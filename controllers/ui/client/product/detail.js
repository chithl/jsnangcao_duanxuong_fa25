import { ProductAPI } from "../../../api/ProductAPI.js";
import { VariantAPI } from "../../../api/VariantAPI.js";
import { ReviewAPI } from "../../../api/ReviewAPI.js";
import { AuthAPI } from "../../../api/AuthAPI.js";
import { InventoryAPI } from "../../../api/InventoryAPI.js";

const productModule = new ProductAPI();
const variantModule = new VariantAPI();
const reviewModule = new ReviewAPI();
const authModule = new AuthAPI();
const inventoryModule = new InventoryAPI();

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// DOM Elements
const variantPriceEl = document.getElementById("variant-price");
const variantSkuEl = document.getElementById("variant-sku");
const variantInfoEl = document.getElementById("variant-info");
const variantContainer = document.getElementById("variant-container");
const addToCartBtn = document.getElementById("btn-add-to-cart");
const ADD_TO_CART_DEFAULT_HTML = addToCartBtn ? addToCartBtn.innerHTML : "<i class=\"fas fa-cart-plus me-2\"></i> Thêm vào giỏ hàng";
const ADD_TO_CART_SOLD_OUT_HTML = "<span class='fw-bold'>Hết hàng</span>";

const quantityDecreaseBtn = document.getElementById("quantity-decrease");
const quantityIncreaseBtn = document.getElementById("quantity-increase");
const quantityInputEl = document.getElementById("product-quantity");
const quantityHiddenEl = document.getElementById("selected-variant-quantity");
const stockHintEl = document.getElementById("variant-stock-hint");

const colorBlockEl = document.getElementById("color-block");
const colorOptionsEl = document.getElementById("color-options");
const productDescriptionEl = document.getElementById("product-description");
const productTaglineEl = document.getElementById("product-tagline");
const productSalesEl = document.getElementById("product-sales");
const selectedVariantInput = document.getElementById("selected-variant-id");
const mainImageEl = document.getElementById("product-detail-img");

const reviewListEl = document.getElementById("comment-list-luxury");
const reviewFormEl = document.getElementById("luxury-review-form");
const reviewCommentEl = document.getElementById("review-comment");
const reviewNameEl = document.getElementById("review-name");
const reviewSubmitBtn = document.getElementById("review-submit-btn");
const reviewAuthHintEl = document.getElementById("review-auth-hint");
const selectedRatingEl = document.getElementById("selected-rating");
const ratingStarEls = document.querySelectorAll(".star-rating-input i[data-rating]");
const ratingAverageValueEl = document.getElementById("rating-average-value");
const ratingStarsEl = document.getElementById("rating-stars");
const ratingAverageNoteEl = document.getElementById("rating-average-note");
const ratingProgressBars = document.querySelectorAll("[data-rating-bar]");
const ratingCountEls = document.querySelectorAll("[data-rating-count]");
const numberFormatter = new Intl.NumberFormat("vi-VN");

let currentUser = null;
const REVIEW_BATCH_SIZE = 5;
let cachedReviews = [];
let visibleReviewCount = 0;
let variantList = [];
let productBaseImage = "";
let selectedQuantity = 1;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;
let inventoryLoaded = false;
let inventoryError = false;
const inventoryBySku = new Map();
const inventoryByVariantId = new Map();

// --- KHỞI TẠO ---
setupReviewListeners();
initQuantityControls();

(async () => {
    if (!productId) return;
    try {
        const [product, variants] = await Promise.all([
            productModule.getOneProduct(productId),
            variantModule.getVariantsByProduct(productId)
        ]);

        if (product) {
            document.getElementById("product-name").innerText = product.name || "N/A";
            document.getElementById("product-brand").innerText = product.brand || "-";
            document.getElementById("product-line").innerText = product.line || "-";
            document.getElementById("product-finish").innerText = product.finish || "-";
            const tagline = product.tagline || product.subtitle || product.category || "Sản phẩm cao cấp";
            if (productTaglineEl) productTaglineEl.innerText = tagline;
            if (productDescriptionEl) {
                productDescriptionEl.innerText = product.description || product.summary || product.short_description || "Chưa có mô tả";
            }
            productBaseImage = getPrimaryImage(product);
            if (mainImageEl && productBaseImage) mainImageEl.src = productBaseImage;
            const soldCount = product.sold || product.sales || product.sold_count || product.totalSold;
            if (productSalesEl) {
                productSalesEl.innerText = soldCount ? `Đã bán ${soldCount}` : "";
            }
        }else {
            window.location.href = "../../views/client/404.html";
            return;
        }

        await loadInventory();
        renderVariantPickers(variants);
        renderColorOptions(product, variantList);
        await loadReviews();
        await resolveReviewAuthState();
    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
    }
})();

// --- LOGIC BIẾN THỂ ---
function renderVariantPickers(variants) {
    if (!variantContainer) return;
    const normalized = Array.isArray(variants) ? variants.filter(Boolean) : [];
    if (!normalized.length) {
        variantContainer.innerHTML = "<em class='text-danger'>Sản phẩm hiện hết hàng</em>";
        variantList = [];
        return;
    }
    variantList = normalized.map(variant => ({
        ...variant,
        label: buildVariantLabel(variant)
    }));
    variantContainer.innerHTML = variantList.map(variant => `
        <button type="button" class="btn btn-outline-success btn-variant variant-pill"
                data-id="${variant.id}"
                data-price="${variant.price || 0}"
                data-sku="${variant.sku || ""}">
            ${escapeHtmlAttr(variant.label)}
        </button>
    `).join("");

    const buttons = variantContainer.querySelectorAll(".btn-variant");
    buttons.forEach(btn => {
        btn.onclick = function() {
            buttons.forEach(b => {
                b.classList.remove("active", "btn-success");
                b.classList.add("btn-outline-success");
            });
            this.classList.add("active", "btn-success");
            this.classList.remove("btn-outline-success");
            updateUIWithVariant(this.dataset);
        };
    });
    if (buttons.length > 0) buttons[0].click();
}

function updateUIWithVariant(data) {
    const priceValue = Number(data.price || 0);
    if (variantPriceEl) variantPriceEl.innerText = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceValue);
    if (variantSkuEl) {
        variantSkuEl.innerText = data.sku || "–";
        if (variantInfoEl) variantInfoEl.style.display = data.sku ? "block" : "none";
    }
    const variantId = data.id || data.variantId || "";
    if (selectedVariantInput) selectedVariantInput.value = variantId;
    if (addToCartBtn) {
        setAddToCartAvailability(true);
        addToCartBtn.dataset.variantId = variantId;
    }
    const variantRecord = variantList.find(v => String(v.id) === String(variantId));
    updateInventoryHint(variantRecord);
}

async function loadInventory() {
    inventoryLoaded = false;
    inventoryError = false;
    inventoryBySku.clear();
    inventoryByVariantId.clear();
    try {
        const payload = await inventoryModule.getAllInventory();
        const records = normalizeInventoryPayload(payload);
        buildInventoryMaps(records);
    } catch (error) {
        console.error("Không tải được dữ liệu kho:", error);
        inventoryError = true;
    } finally {
        inventoryLoaded = true;
    }
}

function normalizeInventoryPayload(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) {
        return payload.filter(Boolean);
    }
    if (typeof payload === "object") {
        return Object.values(payload).filter(Boolean);
    }
    return [];
}

function buildInventoryMaps(records) {
    records.forEach(record => {
        const skuKey = getInventorySkuKey(record);
        if (skuKey) inventoryBySku.set(skuKey, record);
        const variantKey = getInventoryVariantKey(record);
        if (variantKey) inventoryByVariantId.set(variantKey, record);
    });
}

function getInventorySkuKey(record) {
    const candidate = record?.sku ?? record?.SKU ?? record?.variant_sku ?? record?.variantSKU ?? record?.product_sku ?? record?.code;
    return normalizeKey(candidate);
}

function getInventoryVariantKey(record) {
    const candidate = record?.variant_id ?? record?.variantId ?? record?.variant ?? record?.product_variant_id ?? record?.id;
    return candidate ? String(candidate).trim() : "";
}

function normalizeKey(value) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : String(value);
    const trimmed = text.trim();
    return trimmed ? trimmed.toLowerCase() : "";
}

function findInventoryRecord(variant) {
    if (!variant) return null;
    const variantKey = variant.id ?? variant.variantId ?? variant.variant_id ?? variant.id;
    const resolvedVariantKey = variantKey ? String(variantKey).trim() : "";
    if (resolvedVariantKey && inventoryByVariantId.has(resolvedVariantKey)) {
        return inventoryByVariantId.get(resolvedVariantKey);
    }
    const skuKey = normalizeKey(variant.sku ?? variant.SKU ?? variant.code ?? variant.variant_sku ?? variant.variantSKU);
    if (skuKey && inventoryBySku.has(skuKey)) {
        return inventoryBySku.get(skuKey);
    }
    return null;
}

function resolveInventoryQuantity(record) {
    if (!record) return null;
    const candidate = record.quantity ?? record.qty ?? record.stock ?? record.available ?? record.amount ?? record.on_hand ?? record.onStock ?? record.on_stock ?? record.total ?? record.available_quantity;
    const numeric = Number(candidate);
    return Number.isFinite(numeric) ? numeric : null;
}

function updateInventoryHint(variant) {
    if (!stockHintEl) return;
    const record = findInventoryRecord(variant);
    if (record) {
        const quantity = resolveInventoryQuantity(record);
        if (quantity !== null) {
            if (quantity <= 0) {
                stockHintEl.innerText = "Hết hàng";
                stockHintEl.className = "fw-semibold text-danger small";
                setAddToCartAvailability(false);
                return;
            }
            stockHintEl.innerText = `${numberFormatter.format(quantity)} sản phẩm`;
            stockHintEl.className = "fw-semibold text-success small";
            setAddToCartAvailability(true);
            return;
        }
    }
    if (!inventoryLoaded && !inventoryError) {
        stockHintEl.innerText = "Đang xác thực kho…";
        stockHintEl.className = "fw-semibold text-muted small";
        setAddToCartAvailability(false);
        return;
    }
    if (inventoryError) {
        stockHintEl.innerText = "Không lấy được dữ liệu kho";
        stockHintEl.className = "fw-semibold text-muted small";
        setAddToCartAvailability(false);
        return;
    }
    stockHintEl.innerText = "Tồn kho chưa cập nhật";
    stockHintEl.className = "fw-semibold text-muted small";
    setAddToCartAvailability(false);
}

function setAddToCartAvailability(isAvailable) {
    if (!addToCartBtn) return;
    addToCartBtn.disabled = !isAvailable;
    addToCartBtn.innerHTML = isAvailable ? ADD_TO_CART_DEFAULT_HTML : ADD_TO_CART_SOLD_OUT_HTML;
}

function initQuantityControls() {
    if (!quantityInputEl) return;
    quantityDecreaseBtn?.addEventListener("click", () => changeQuantity(-1));
    quantityIncreaseBtn?.addEventListener("click", () => changeQuantity(1));
    const syncInput = event => handleQuantityInputChange(event);
    quantityInputEl.addEventListener("input", syncInput);
    quantityInputEl.addEventListener("change", syncInput);
    synchronizeQuantity();
}

function changeQuantity(delta) {
    setQuantity(selectedQuantity + delta);
}

function setQuantity(value) {
    const normalized = Number.isFinite(value) ? Math.round(value) : selectedQuantity;
    let next = Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, normalized));
    if (next === selectedQuantity) {
        synchronizeQuantity();
        return;
    }
    selectedQuantity = next;
    synchronizeQuantity();
}

function handleQuantityInputChange(event) {
    const value = Number(event?.target?.value);
    if (!Number.isFinite(value)) {
        synchronizeQuantity();
        return;
    }
    setQuantity(value);
}

function synchronizeQuantity() {
    if (quantityInputEl) quantityInputEl.value = String(selectedQuantity);
    if (quantityHiddenEl) quantityHiddenEl.value = String(selectedQuantity);
    if (addToCartBtn) addToCartBtn.dataset.quantity = String(selectedQuantity);
    updateQuantityButtonState();
}

function updateQuantityButtonState() {
    if (quantityDecreaseBtn) quantityDecreaseBtn.disabled = selectedQuantity <= MIN_QUANTITY;
    if (quantityIncreaseBtn) quantityIncreaseBtn.disabled = selectedQuantity >= MAX_QUANTITY;
}

function buildVariantLabel(variant) {
    if (!variant) return "Biến thể";
    const liter = variant.size_L ?? variant.size_l;
    if (liter) return `${liter}L`;
    const milli = variant.size_ml ?? variant.sizeMl;
    if (milli) return `${milli}ml`;
    if (variant.capacity) return variant.capacity;
    if (variant.label) return variant.label;
    if (variant.name) return variant.name;
    return "Biến thể";
}

function getPrimaryImage(record) {
    return resolveImageSource(record);
}

function resolveImageSource(record) {
    if (!record) return "";
    const single = [
        "image",
        "image_url",
        "imageUrl",
        "thumbnail",
        "thumb",
        "photo",
        "coverImage",
        "cover_image",
        "primaryImage"
    ];
    for (const key of single) {
        const val = record[key];
        if (typeof val === "string" && val.trim()) return val.trim();
    }
    const list = ["images", "media", "photos", "gallery"];
    for (const key of list) {
        const collection = record[key];
        if (!Array.isArray(collection)) continue;
        const found = collection.find(item => typeof item === "string" && item.trim());
        if (found) return found.trim();
    }
    return "";
}

function renderColorOptions(product, variants = []) {
    if (!colorOptionsEl) return;
    const registry = new Map();
    const register = value => {
        if (!value) return;
        const text = value.toString().trim();
        if (!text) return;
        const key = text.toLowerCase();
        if (!registry.has(key)) registry.set(key, text);
    };
    register(product?.color);
    if (Array.isArray(product?.colors)) product.colors.forEach(register);
    if (Array.isArray(product?.palette)) product.palette.forEach(register);
    if (Array.isArray(product?.color_palette)) product.color_palette.forEach(register);
    variants.forEach(variant => register(variant.color || variant.color_name || variant.variant_color));
    if (!registry.size) {
        colorBlockEl?.classList.add("d-none");
        colorOptionsEl.innerHTML = "";
        return;
    }
    colorBlockEl?.classList.remove("d-none");
    const chips = Array.from(registry.values()).map(color => {
        const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
        const style = isHex ? `style="background:${color};"` : "";
        const className = isHex ? "color-chip color-swatch" : "color-chip color-label";
        const labelText = isHex ? "" : color;
        return `<span class="${className}" ${style}>${labelText}</span>`;
    });
    colorOptionsEl.innerHTML = chips.join("");
}

function escapeHtmlAttr(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

// --- LOGIC ĐÁNH GIÁ (REVIEW) - GIỮ NGUYÊN GIAO DIỆN GỐC ---
function setupReviewListeners() {
    ratingStarEls.forEach(star => {
        star.addEventListener("click", () => {
            const value = Number(star.dataset.rating) || 0;
            setRatingValue(value);
            updateReviewButtonState();
        });
    });
    if (reviewCommentEl) reviewCommentEl.addEventListener("input", updateReviewButtonState);
    if (reviewFormEl) reviewFormEl.addEventListener("submit", handleReviewSubmit);
    setRatingValue(0);
}

function setRatingValue(value) {
    if (!selectedRatingEl) return;
    selectedRatingEl.value = value;
    ratingStarEls.forEach(star => {
        const starValue = Number(star.dataset.rating) || 0;
        const active = starValue > 0 && starValue <= value;
        star.classList.toggle("fas", active);
        star.classList.toggle("far", !active);
        star.classList.toggle("star-active", active);
    });
}

function updateReviewButtonState() {
    if (!reviewSubmitBtn) return;
    const hasRating = Number(selectedRatingEl?.value || 0) > 0;
    const hasComment = reviewCommentEl ? reviewCommentEl.value.trim().length > 0 : false;
    reviewSubmitBtn.disabled = !currentUser || !hasRating || !hasComment;
}

async function loadReviews() {
    if (!productId) return;
    try {
        const payload = await reviewModule.getAllReview();
        const rawReviews = !payload ? [] : (Array.isArray(payload) ? payload : Object.entries(payload).map(([k,v]) => ({id: k, ...v})));
        const reviews = rawReviews.filter(item => String(item.productId || item.product_id) === String(productId));
        const visibleReviews = reviews.filter(item => item.status === undefined || Number(item.status) === 1);
        renderRatingSummary(visibleReviews);
        renderCommentList(visibleReviews);
    } catch (error) {
        console.error("Không tải được đánh giá", error);
    }
}

function renderRatingSummary(reviews) {
    const total = reviews.length;
    const tally = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach(review => {
        const numeric = Number(review.rating ?? 0);
        const key = Math.round(numeric);
        if (key >= 1 && key <= 5) tally[key] += 1;
        sum += numeric;
    });
    const average = total ? sum / total : 0;
    if (ratingAverageValueEl) ratingAverageValueEl.innerText = total ? average.toFixed(1) : "0.0";
    if (ratingAverageNoteEl) ratingAverageNoteEl.innerText = total ? `Dựa trên ${total} đánh giá` : "Chưa có đánh giá";
    fillAverageStars(average);
    ratingProgressBars.forEach(bar => {
        const key = Number(bar.dataset.ratingBar);
        bar.style.width = total ? `${(tally[key] / total) * 100}%` : "0%";
    });
    ratingCountEls.forEach(el => {
        const key = Number(el.dataset.ratingCount);
        el.innerText = tally[key] ?? 0;
    });
}

function fillAverageStars(value) {
    if (!ratingStarsEl) return;
    const highlight = Math.round(value);
    ratingStarsEl.querySelectorAll("i").forEach((star, index) => {
        const isActive = highlight > index;
        star.classList.toggle("star-active", isActive);
        star.classList.toggle("text-muted", !isActive);
    });
}

function renderCommentList(reviews) {
    if (!reviewListEl) return;
    cachedReviews = [...reviews].sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
    visibleReviewCount = Math.min(REVIEW_BATCH_SIZE, cachedReviews.length);
    updateCommentListDisplay();
}

function updateCommentListDisplay() {
    if (!reviewListEl) return;
    if (!cachedReviews.length) {
        reviewListEl.innerHTML = "<p class='text-center text-muted py-5'>Chưa có đánh giá nào.</p>";
        return;
    }
    const slice = cachedReviews.slice(0, visibleReviewCount);
    reviewListEl.innerHTML = slice.map(review => {
        const name = (review.reviewerName || "Khách hàng");
        const comment = (review.comment || "");
        const initials = (name.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase() || "KH";
        return `
            <div class="comment-card p-4 mb-3">
                <div class="d-flex align-items-center mb-3">
                    <div class="user-avatar me-3">${initials}</div>
                    <div>
                        <h6 class="fw-bold mb-1">${name}</h6>
                        <div class="small">
                            ${buildStarMarkup(review.rating)}
                            <span class="text-muted ms-2">${new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                    </div>
                </div>
                <p class="text-secondary ps-5 ms-3 mb-0 lh-lg">${comment}</p>
            </div>`;
    }).join("");
    if (visibleReviewCount < cachedReviews.length) {
        const remaining = Math.min(REVIEW_BATCH_SIZE, cachedReviews.length - visibleReviewCount);
        reviewListEl.innerHTML += `
            <div class="text-center mt-4">
                <button id="load-more-comments" class="btn btn-outline-dark px-4" type="button">
                    Xem thêm ${remaining} bình luận
                </button>
            </div>`;
        const loadMoreBtn = document.getElementById("load-more-comments");
        if (loadMoreBtn) loadMoreBtn.addEventListener("click", handleLoadMoreComments);
    }
}

function handleLoadMoreComments() {
    visibleReviewCount = Math.min(cachedReviews.length, visibleReviewCount + REVIEW_BATCH_SIZE);
    updateCommentListDisplay();
}

function buildStarMarkup(rating) {
    const score = Math.round(Number(rating || 0));
    return Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star ${i < score ? "star-active" : "text-muted"}"></i>`).join(" ");
}

function getReviewTimestamp(review) {
    const candidate = review.createdAt ?? review.created_at ?? review.updatedAt ?? review.updated_at;
    const parsed = Date.parse(String(candidate));
    return Number.isFinite(parsed) ? parsed : 0;
}

async function resolveReviewAuthState() {
    const token = localStorage.getItem("token");
    if (!token) {
        showReviewHint("Đăng nhập để gửi đánh giá");
        return;
    }
    try {
        const result = await authModule.me(token);
        if (result.success) {
            currentUser = result.data;
            if (reviewNameEl) reviewNameEl.value = currentUser.name || currentUser.email;
            reviewCommentEl.disabled = false;
            showReviewHint("");
        }
    } catch {
        showReviewHint("Phiên đăng nhập hết hạn");
    }
}

function showReviewHint(msg, type = "danger") {
    if (!reviewAuthHintEl) return;
    reviewAuthHintEl.innerText = msg;
    reviewAuthHintEl.className = `text-${type} small mb-3 ${msg ? '' : 'd-none'}`;
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const payload = {
        productId,
        rating: Number(selectedRatingEl.value),
        comment: reviewCommentEl.value.trim(),
        reviewerName: currentUser.name || currentUser.email,
        status: 1,
        createdAt: new Date().toISOString()
    };
    try {
        reviewSubmitBtn.disabled = true;
        await reviewModule.storeReview(payload);
        reviewCommentEl.value = "";
        setRatingValue(0);
        showReviewHint("Cảm ơn bạn đã đánh giá!", "success");
        await loadReviews();
    } catch (err) {
        showReviewHint("Lỗi khi gửi đánh giá");
    } finally {
        updateReviewButtonState();
    }
}