import { ProductAPI } from "../../../api/ProductAPI.js";
import { CategoryAPI } from "../../../api/CategoryAPI.js";

const productModule = new ProductAPI();
const categoryModule = new CategoryAPI();

const productListEl = document.getElementById("product-list");
const categoryListEl = document.getElementById("category-list");
const categoryCurrentNameEl = document.getElementById("category-current-name");
const paginationListEl = document.getElementById("pagination-list");
const PRODUCTS_PER_PAGE = 6;
let currentPage = 1;

const placeholderImage = "https://via.placeholder.com/640x640?text=Sản+phẩm";
let allProducts = [];
let categories = [];
let activeCategoryId = "all";

initPagination();
initShop();

async function initShop() {
  try {
    const [productPayload, categoryPayload] = await Promise.all([
      productModule.getAllProduct(),
      categoryModule.getAllCategory()
    ]);
    allProducts = normalizeCollection(productPayload).filter(p => p?.is_active !== false);
    categories = normalizeCollection(categoryPayload).filter(c => c?.is_active !== false);
    activeCategoryId = "all";
    renderCategoryFilter();
    renderProducts();
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
    if (productListEl) {
      productListEl.innerHTML = "<p class='text-center text-danger py-5'>Đã xảy ra lỗi khi tải sản phẩm.</p>";
    }
  }
}

function normalizeCollection(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.filter(Boolean).map(record => standardizeRecord(record));
  }
  if (typeof payload === "object") {
    return Object.entries(payload)
      .filter(([, value]) => value)
      .map(([key, value]) => standardizeRecord({ ...value, firebaseID: value.firebaseID ?? key, id: value.id ?? key }));
  }
  return [];
}

function standardizeRecord(record) {
  if (!record || typeof record !== "object") return record;
  const copy = { ...record };
  if (!copy.firebaseID && copy.id) copy.firebaseID = copy.id;
  if (!copy.id && copy.firebaseID) copy.id = copy.firebaseID;
  return copy;
}

function renderProducts() {
  if (!productListEl) return;
  const filtered = getFilteredProducts();
  if (!filtered.length) {
    currentPage = 1;
    productListEl.innerHTML = "<p class='text-center text-muted py-5'>Không có sản phẩm phù hợp.</p>";
    renderPagination(0);
    return;
  }
  const paginated = paginateProducts(filtered);
  if (!paginated.length) {
    productListEl.innerHTML = "<p class='text-center text-muted py-5'>Không có sản phẩm phù hợp.</p>";
  } else {
    productListEl.innerHTML = paginated.map(buildProductCard).join("");
  }
  renderPagination(filtered.length);
}

function buildProductCard(product) {
  const productImage = resolveProductImage(product);
  const name = product?.name || "Sản phẩm";
  const brandName = product?.brand || "Jotun";
  const categoryLabel = getCategoryLabelFromProduct(product);
  const productDescription = product?.summary || product?.description || "";

  return `
        <div class="col-md-4">
            <div class="card mb-4 product-wap rounded-0 shadow-sm border-0">
                <div class="card rounded-0">
                    <img
                        class="card-img rounded-0 img-fluid"
                        src="${escapeHtmlAttr(productImage)}"
                        alt="${escapeHtmlAttr(name)}"
                        loading="lazy"
                        onerror="this.src='${placeholderImage}'"
                        style="width: 100%; height: 280px; object-fit: cover;"
                    />
                    <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                        <ul class="list-unstyled m-0">
                            <li><a class="btn btn-success text-white mt-2" href="shop-single.html?id=${escapeHtmlAttr(product.firebaseID || product.id)}" title="Xem chi tiết"><i class="far fa-eye"></i></a></li>
                            <li><a class="btn btn-success text-white mt-2" href="#" title="Thêm vào giỏ"><i class="fas fa-cart-plus"></i></a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body bg-white p-3">
                    <div class="text-uppercase text-muted small mb-1 fw-bold" style="letter-spacing: 1px;">
                        ${escapeHtml(brandName)}
                    </div>
                    <a href="shop-single.html?id=${escapeHtmlAttr(product.firebaseID || product.id)}" class="h5 d-block text-decoration-none text-dark fw-bold mb-2 name_title">
                        ${escapeHtml(name)}
                    </a>
                    ${categoryLabel ? `<p class="text-muted small mb-2">${escapeHtml(categoryLabel)}</p>` : ""}
                    <p class="text-secondary small mb-0" style="height: 44px; overflow: hidden;">
                        ${escapeHtml(productDescription)}
                    </p>
                </div>
            </div>
        </div>`;
}

function resolveProductImage(product) {
  if (!product) return placeholderImage;
  if (Array.isArray(product.images) && product.images.length) return product.images[0];
  if (typeof product.image === "string" && product.image.trim()) return product.image.trim();
  if (typeof product.thumbnail === "string" && product.thumbnail.trim()) return product.thumbnail.trim();
  return placeholderImage;
}

function getFilteredProducts() {
  if (activeCategoryId === "all") return allProducts;
  const category = categories.find(cat => String(cat.firebaseID) === String(activeCategoryId) || String(cat.id) === String(activeCategoryId));
  if (!category) return allProducts;
  const matcher = createCategoryMatcher(category);
  return allProducts.filter(product => matcher(product));
}

function paginateProducts(items) {
  if (!Array.isArray(items) || !items.length) {
    currentPage = 1;
    return [];
  }
  const totalPages = Math.ceil(items.length / PRODUCTS_PER_PAGE);
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  return items.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
}

function renderPagination(totalItems) {
  if (!paginationListEl) return;
  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) {
    paginationListEl.innerHTML = "";
    return;
  }
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const baseLinkClasses = "page-link rounded-0 shadow-sm border-top-0 border-left-0 text-dark";
  const items = [];
  items.push(`
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button
        type="button"
        class="${baseLinkClasses}"
        data-page="${Math.max(1, currentPage - 1)}"
        aria-label="Trang trước"
      >
        &laquo;
      </button>
    </li>
  `);
  for (let page = 1; page <= totalPages; page += 1) {
    const isActive = page === currentPage;
    items.push(`
      <li class="page-item ${isActive ? "active" : ""}">
        <button
          type="button"
          class="${baseLinkClasses} ${isActive ? "bg-success text-white" : ""}"
          data-page="${page}"
        >
          ${page}
        </button>
      </li>
    `);
  }
  items.push(`
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <button
        type="button"
        class="${baseLinkClasses}"
        data-page="${Math.min(totalPages, currentPage + 1)}"
        aria-label="Trang sau"
      >
        &raquo;
      </button>
    </li>
  `);
  paginationListEl.innerHTML = items.join("");
}

function initPagination() {
  if (!paginationListEl) return;
  paginationListEl.addEventListener("click", handlePaginationClick);
}

function handlePaginationClick(event) {
  const target = event.target.closest("[data-page]");
  if (!target) return;
  event.preventDefault();
  const requestedPage = Number(target.dataset.page);
  if (!Number.isFinite(requestedPage)) return;
  const normalizedPage = Math.max(1, requestedPage);
  if (normalizedPage === currentPage) return;
  currentPage = normalizedPage;
  renderProducts();
}

function renderCategoryFilter() {
  if (!categoryListEl) return;
  const items = [];
  items.push(`<button type="button" class="list-group-item list-group-item-action ${activeCategoryId === "all" ? "active" : ""}" data-category-id="all" data-category-name="Tất cả danh mục">Tất cả danh mục</button>`);
  categories.forEach(category => {
    const label = getCategoryLabel(category);
    items.push(`<button type="button" class="list-group-item list-group-item-action" data-category-id="${escapeHtmlAttr(category.firebaseID)}" data-category-name="${escapeHtmlAttr(label)}">${escapeHtml(label)}</button>`);
  });
  if (!categories.length) {
    items.push("<div class='small text-muted mt-2'>Chưa có danh mục nào</div>");
  }
  categoryListEl.innerHTML = items.join("");
  attachCategoryHandlers();
  updateCategorySelection();
}

function attachCategoryHandlers() {
  if (!categoryListEl) return;
  categoryListEl.querySelectorAll("[data-category-id]").forEach(btn => {
    btn.addEventListener("click", () => setActiveCategory(btn.dataset.categoryId));
  });
}

function setActiveCategory(categoryId) {
  if (!categoryId) return;
  if (activeCategoryId === categoryId) return;
  activeCategoryId = categoryId;
  currentPage = 1;
  updateCategorySelection();
  renderProducts();
}

function updateCategorySelection() {
  if (!categoryListEl) return;
  const buttons = categoryListEl.querySelectorAll("[data-category-id]");
  buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.categoryId === activeCategoryId));
  if (categoryCurrentNameEl) {
    const activeButton = Array.from(buttons).find(btn => btn.dataset.categoryId === activeCategoryId);
    categoryCurrentNameEl.innerText = activeButton?.dataset?.categoryName || "Tất cả danh mục";
  }
}

function createCategoryMatcher(category) {
  const idSet = new Set();
  const labelSet = new Set();
  [category.firebaseID, category.id, category._id, category.slug, category.code].forEach(value => {
    if (value) idSet.add(String(value));
  });
  [category.name, category.title, category.label, category.displayName].forEach(value => {
    if (value) labelSet.add(String(value).trim().toLowerCase());
  });

  return product => {
    if (!product) return false;
    const fields = [
      product.category,
      product.category_id,
      product.categoryId,
      product.categoryName,
      product.category_name,
      product.color,
      product.categoryLabel,
      product.category_label,
      product.categories
    ];
    return fields.some(field => matchesField(field));

    function matchesField(field) {
      if (field === undefined || field === null) return false;
      if (Array.isArray(field)) return field.some(matchesField);
      if (typeof field === "object") {
        return matchesField(field.id) || matchesField(field.firebaseID) || matchesField(field.name);
      }
      const normalized = String(field).trim();
      if (!normalized) return false;
      if (idSet.has(normalized)) return true;
      if (labelSet.has(normalized.toLowerCase())) return true;
      return false;
    }
  };
}

function getCategoryLabel(record) {
  if (!record) return "Danh mục";
  return record.name || record.title || record.label || record.category_name || record.categoryName || record.slug || record.code || "Danh mục";
}

function getCategoryLabelFromProduct(product) {
  if (!product) return "";
  return (
    product.category ||
    product.categoryName ||
    product.category_name ||
    product.categoryLabel ||
    product.category_label ||
    product.slug ||
    ""
  );
}

function escapeHtmlAttr(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}