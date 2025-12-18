import { ProductAPI } from "../../../api/ProductAPI.js";
import { VariantAPI } from "../../../api/VariantAPI.js";
import { ReviewAPI } from "../../../api/ReviewAPI.js";
import { AuthAPI } from "../../../api/AuthAPI.js";

const productModule = new ProductAPI();
const variantModule = new VariantAPI();
const reviewModule = new ReviewAPI();
const authModule = new AuthAPI();

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// DOM Elements
const variantPriceEl = document.getElementById("variant-price");
const variantSkuEl = document.getElementById("variant-sku");
const variantInfoEl = document.getElementById("variant-info");
const variantContainer = document.getElementById("variant-container");
const addToCartBtn = document.getElementById("btn-add-to-cart");

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

let currentUser = null;

// --- KHỞI TẠO ---
setupReviewListeners();

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
            const mainImg = document.getElementById("product-detail-img");
            if (mainImg && product.images?.length > 0) mainImg.src = product.images[0];
        }

        renderVariantPickers(variants);
        await loadReviews();
        await resolveReviewAuthState();
    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
    }
})();

// --- LOGIC BIẾN THỂ ---
function renderVariantPickers(variants) {
    if (!variantContainer) return;
    if (!variants || variants.length === 0) {
        variantContainer.innerHTML = "<em class='text-danger'>Sản phẩm hiện hết hàng</em>";
        return;
    }
    variantContainer.innerHTML = variants.map(v => `
        <button type="button" class="btn btn-outline-success btn-variant me-2"
                data-id="${v.id}" data-price="${v.price || 0}" data-sku="${v.sku || ""}">
            ${v.size_L || "–"}L
        </button>
    `).join("");

    const buttons = variantContainer.querySelectorAll(".btn-variant");
    buttons.forEach(btn => {
        btn.onclick = function() {
            buttons.forEach(b => b.classList.remove("active", "btn-success"));
            buttons.forEach(b => b.classList.add("btn-outline-success"));
            this.classList.add("active", "btn-success");
            this.classList.remove("btn-outline-success");
            updateUIWithVariant(this.dataset);
        };
    });
    if (buttons.length > 0) buttons[0].click();
}

function updateUIWithVariant(data) {
    if (variantPriceEl) variantPriceEl.innerText = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(data.price));
    if (variantSkuEl) {
        variantSkuEl.innerText = data.sku || "–";
        variantInfoEl.style.display = "block";
    }
    if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.dataset.variantId = data.id;
    }
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
    if (!reviews.length) {
        reviewListEl.innerHTML = "<p class='text-center text-muted py-5'>Chưa có đánh giá nào.</p>";
        return;
    }
    const sorted = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    reviewListEl.innerHTML = sorted.map(review => {
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
}

function buildStarMarkup(rating) {
    const score = Math.round(Number(rating || 0));
    return Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star ${i < score ? "star-active" : "text-muted"}"></i>`).join(" ");
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