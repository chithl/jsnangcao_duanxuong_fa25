import { ProductAPI } from "../../../api/ProductAPI.js";
import { VariantAPI } from "../../../api/VariantAPI.js";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString("vi-VN") + " ₫";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function toArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object")
    return Object.entries(data).map(([id, item]) => ({ id, ...item }));
  return [];
}

function extractStringValue(obj) {
  if (typeof obj === "string") return obj;
  if (typeof obj === "object" && obj !== null) {
    const chars = [];
    for (let i = 0; i < 1000; i++) {
      if (obj[i] === undefined) break;
      chars.push(obj[i]);
    }
    return chars.join("");
  }
  return String(obj || "");
}

function extractArrayValue(obj) {
  if (Array.isArray(obj)) return obj;
  if (typeof obj === "object" && obj !== null) {
    const arr = [];
    for (let i = 0; i < 1000; i++) {
      if (obj[i] === undefined) break;
      arr.push(obj[i]);
    }
    return arr.filter((v) => v !== undefined && v !== "id");
  }
  return [];
}

function findProductById(productId, allProducts) {
  if (!allProducts) return null;

  // Nếu là object kiểu Firebase {id: {..}}
  if (!Array.isArray(allProducts) && typeof allProducts === "object") {
    if (allProducts[productId])
      return { id: productId, ...allProducts[productId] };
    // fallback: tìm trong values nếu có field id trùng
    const hit = Object.entries(allProducts).find(
      ([key, item]) =>
        (item?.id || item?._id || item?.key || item?.product_id) === productId
    );
    if (hit) return { id: hit[0], ...hit[1] };
  }

  // Nếu là mảng
  if (Array.isArray(allProducts)) {
    return (
      allProducts.find(
        (p) => (p?.id || p?._id || p?.key || p?.product_id) === productId
      ) || null
    );
  }

  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const productModule = new ProductAPI();
  const variantModule = new VariantAPI();

  const productId = decodeURIComponent(
    new URLSearchParams(window.location.search).get("id") || ""
  ).trim();
  if (!productId) {
    alert("Không tìm thấy ID sản phẩm");
    window.location.href = "products.html";
    return;
  }

  const nameEl = document.getElementById("product-name");
  const skuEl = document.getElementById("product-sku");
  const brandEl = document.getElementById("product-brand");
  const lineEl = document.getElementById("product-line");
  const segmentEl = document.getElementById("product-segment");
  const finishEl = document.getElementById("product-finish");
  const baseEl = document.getElementById("product-base");
  const coverEl = document.getElementById("product-cover");
  const tagsEl = document.getElementById("product-tags");
  const createdEl = document.getElementById("product-created");
  const imagesWrap = document.getElementById("product-images");
  const imageEmpty = document.getElementById("image-empty");
  const statusBadge = document.getElementById("status-badge");
  const editLink = document.getElementById("edit-link");
  const variantTable = document.getElementById("variant-table");
  const variantEmpty = document.getElementById("variant-empty");
  const variantCount = document.getElementById("variant-count");

  try {
    // Load product detail (with fallback if GET one null)
    let product = await productModule.getOneProduct(productId);

    if (!product || typeof product !== "object") {
      // Fallback: fetch all and pick by id
      const allProducts = await productModule.getAllProduct();
      product = findProductById(productId, allProducts);
    }

    if (!product || typeof product !== "object") {
      console.warn("Product not found", { productId });
      alert("Không tìm thấy sản phẩm");
      // window.location.href = "products.html";
      return;
    }

    nameEl.textContent = product.name || "-";
    skuEl.textContent = product.sku || "-";
    brandEl.textContent = product.brand || "-";
    lineEl.textContent = product.line || "-";
    segmentEl.textContent = product.segment || "-";
    finishEl.textContent = product.finish || "-";
    baseEl.textContent = product.base || "-";
    coverEl.textContent = product.cover_m2_per_L
      ? `${product.cover_m2_per_L}`
      : "-";
    tagsEl.textContent = Array.isArray(product.tags)
      ? product.tags.join(", ")
      : "-";
    createdEl.textContent = formatDate(product.created_at);

    if (statusBadge) {
      if (product.is_active) {
        statusBadge.textContent = "Đang bán";
        statusBadge.className = "badge-active";
      } else {
        statusBadge.textContent = "Ngừng bán";
        statusBadge.className = "badge-inactive";
      }
    }

    if (editLink) {
      editLink.href = `edit-products.html?id=${productId}`;
    }

    const addVariantBtn = document.getElementById("add-variant-btn");
    if (addVariantBtn) {
      addVariantBtn.href = `add-variant.html?product_id=${productId}`;
    }

    // Render images
    const imgs = Array.isArray(product.images) ? product.images : [];
    if (imgs.length === 0) {
      if (imageEmpty) imageEmpty.classList.remove("hidden");
    } else if (imagesWrap) {
      if (imageEmpty) imageEmpty.classList.add("hidden");
      imagesWrap.innerHTML = imgs
        .map(
          (src, idx) => `
                <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <img src="${src}" alt="image-${idx}" class="w-full h-28 object-cover" />
                </div>
            `
        )
        .join("");
    }

    // Load variants
    let variantsData = await variantModule.getVariantsByProduct(productId);

    const variantsArray = Object.entries(variantsData || {}).map(
      ([id, data]) => ({
        id,
        ...data,
      })
    );

    const variants = variantsArray;

    if (variantEmpty) variantEmpty.classList.add("hidden");
    if (variantCount) variantCount.textContent = `${variants.length} biến thể`;

    let rows = "";
    console.log(variants);

    for (const variant of variants) {
      rows += `
                <tr class="border-b border-gray-200 dark:border-gray-800">
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="font-medium text-gray-800 dark:text-white/90">${
                              variant.id || "-"
                            }</p>
                        </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="text-gray-600 dark:text-gray-400">${
                              variant.product_id || "-"
                            }</p>
                        </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="text-gray-600 dark:text-gray-400">${
                              variant.sku || "-"
                            }</p>
                        </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="text-gray-600 dark:text-gray-400">${
                              variant.size_L || "-"
                            }</p>
                        </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="text-gray-800 dark:text-white/90">${formatCurrency(
                              variant.price
                            )}</p>
                        </div>
                    </td>
<td class="px-5 py-4 sm:px-6">
  <div class="flex items-center">
    <p class="text-gray-800 dark:text-white/90">
      ${(variant.supported_palettes || [])
        .map((palette) => `<span>${palette}</span>`)
        .join(", ")}
    </p>
  </div>
</td>

                                        <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="text-gray-800 dark:text-white/90">${
                              variant.hex_preview || "-"
                            }</p>
                        </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center">
                            <p class="${
                              variant.is_active
                                ? "badge-active"
                                : "badge-inactive"
                            }">
                                ${variant.is_active ? "Đang bán" : "Ngừng bán"}
                            </p>
                        </div>
                    </td>
                </tr>
            `;
    }

    if (variantTable) {
      variantTable.innerHTML = rows;
    }
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    alert("Có lỗi xảy ra khi tải chi tiết sản phẩm");
    // window.location.href = "products.html";
  }
});
