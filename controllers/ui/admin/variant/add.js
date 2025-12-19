import { VariantAPI } from "../../../api/VariantAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";
import { InventoryAPI } from "../../../api/InventoryAPI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const variantModule = new VariantAPI();
  const productModule = new ProductAPI();
  const inventoryModule = new InventoryAPI();
  const form = document.getElementById("add-variant");

  // Lấy product_id từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = decodeURIComponent(
    urlParams.get("product_id") || ""
  ).trim();

  if (!productId) {
    alert("Không tìm thấy ID sản phẩm");
    window.location.href = "products.html";
    return;
  }

  document.getElementById("product_id").value = productId;

  // Lưu danh sách variants và products để check trùng SKU
  let existingVariants = [];
  let existingProducts = [];
  let currentProduct = null;

  // Validation rules
  const validationRules = {
    sku: { required: true, minLength: 2 },
    size_L: { required: true, min: 0 },
    price: { required: true, min: 0 },
    quantity: { required: true, min: 0 },
    hex_preview: { required: true, pattern: /^#[0-9A-Fa-f]{6}$/ },
    supported_palettes: { required: true },
    is_active: { required: true },
  };

  // Load product info
  async function loadProductInfo() {
    try {
      const product = await productModule.getOneProduct(productId);
      currentProduct = product;
      if (product && product.name) {
        document.getElementById("product_name").value = product.name;
      } else {
        document.getElementById("product_name").value = `Sản phẩm ${productId}`;
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      document.getElementById("product_name").value = `Sản phẩm ${productId}`;
    }
  }

  // Load tất cả variants để check trùng SKU
  async function loadAllVariants() {
    try {
      const variantResponse = (await variantModule.getAllVariants)
        ? await variantModule.getAllVariants()
        : await variantModule.getAllVariant();
      if (Array.isArray(variantResponse)) {
        existingVariants = variantResponse;
      } else if (variantResponse && Array.isArray(variantResponse.data)) {
        existingVariants = variantResponse.data;
      } else if (variantResponse && typeof variantResponse === "object") {
        existingVariants = Object.entries(variantResponse).map(
          ([id, data]) => ({ id, ...data })
        );
      } else {
        existingVariants = [];
      }
    } catch (error) {
      console.error("Lỗi khi tải biến thể:", error);
      existingVariants = [];
    }
  }

  // Load tất cả products để check trùng SKU
  async function loadAllProducts() {
    try {
      const productResponse = await productModule.getAllProduct();
      if (Array.isArray(productResponse)) {
        existingProducts = productResponse;
      } else if (productResponse && typeof productResponse === "object") {
        existingProducts = Object.entries(productResponse).map(
          ([id, data]) => ({ id, ...data })
        );
      } else {
        existingProducts = [];
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      existingProducts = [];
    }
  }

  // Slugify string
  function slugify(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Generate SKU dựa trên product và variant info
  function generateVariantSKU(productName, sizeL, hexColor) {
    const productSlug = slugify(productName || "product").substring(0, 10);
    const sizeSlug = sizeL ? `${sizeL}L`.replace(".", "") : "size";
    const colorCode = hexColor
      ? hexColor.replace("#", "").substring(0, 6).toUpperCase()
      : "";
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `${productSlug}-${sizeSlug}-${colorCode}-${rand}`;
  }

  // Kiểm tra SKU có trùng không
  function isSkuDuplicate(sku) {
    const skuLower = sku.toLowerCase();
    const dupInVariants = existingVariants.some(
      (v) => (v.sku || "").toLowerCase() === skuLower
    );
    const dupInProducts = existingProducts.some(
      (p) => (p.sku || "").toLowerCase() === skuLower
    );
    return dupInVariants || dupInProducts;
  }
  // Generate unique SKU
  function generateUniqueSKU(productName, sizeL, hexColor, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const d = new Date();

    const baseSKU = generateVariantSKU(productName, sizeL, hexColor);

    const pad = (n) => String(n).padStart(2, "0");
    const timeCode =
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds());

    const candidate = `${baseSKU}-${timeCode}`;

    if (!isSkuDuplicate(candidate)) {
      return candidate;
    }
  }
  return null;
}

  // Tự động sinh và điền SKU
  function autoFillSKU() {
    const productName = currentProduct?.name || "product";
    const sizeL = document.getElementById("size_L")?.value || "";
    const hexColor = document.getElementById("hex_preview")?.value || "";

    if (sizeL && hexColor) {
      const sku = generateUniqueSKU(productName, sizeL, hexColor);
      if (sku) {
        document.getElementById("sku").value = sku;
      }
    }
  }

  // Parse palettes từ string
  function parsePalettes(text) {
    return text
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  // Validate form
  function validateForm() {
    const errors = {};
    // const skuValue = document.getElementById('sku').value.trim();
    const sizeLValue = document.getElementById("size_L").value;
    const priceValue = document.getElementById("price").value;
    const quantityValue = document.getElementById("quantity").value;
    const hexValue = document.getElementById("hex_preview").value.trim();
    const palettesText = document
      .getElementById("supported_palettes")
      .value.trim();
    const isActiveValue = document.getElementById("is_active").value;

    // if (!skuValue) {
    //     errors.sku = 'SKU là bắt buộc';
    // } else if (skuValue.length < validationRules.sku.minLength) {
    //     errors.sku = `SKU phải có ít nhất ${validationRules.sku.minLength} ký tự`;
    // } else if (isSkuDuplicate(skuValue)) {
    //     errors.sku = 'SKU này đã tồn tại trong hệ thống';
    // }

    if (!sizeLValue) {
      errors.size_L = "Dung tích là bắt buộc";
    } else if (Number(sizeLValue) <= 0) {
      errors.size_L = "Dung tích phải lớn hơn 0";
    }

    if (!priceValue) {
      errors.price = "Giá bán là bắt buộc";
    } else if (Number(priceValue) <= 0) {
      errors.price = "Giá bán phải lớn hơn 0";
    }

    if (quantityValue === "" || quantityValue === null) {
      errors.quantity = "Số lượng là bắt buộc";
    } else if (Number(quantityValue) < 0) {
      errors.quantity = "Số lượng không được âm";
    }

    if (!hexValue) {
      errors.hex_preview = "Màu mẫu là bắt buộc";
    } else if (!validationRules.hex_preview.pattern.test(hexValue)) {
      errors.hex_preview = "Màu mẫu phải có định dạng #RRGGBB (ví dụ: #FF5733)";
    }

    const palettes = parsePalettes(palettesText);
    if (palettes.length === 0) {
      errors.supported_palettes = "Vui lòng nhập ít nhất 1 bảng màu";
    }

    if (isActiveValue === "") {
      errors.is_active = "Vui lòng chọn trạng thái";
    }

    return errors;
  }

  // Clear errors
  function clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
  }

  // Display errors
  function displayErrors(errors) {
    Object.keys(errors).forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        const container = input.closest("div");
        if (!container) return;
        let errorEl = container.querySelector(".error-message");
        if (!errorEl) {
          errorEl = document.createElement("small");
          errorEl.className = "error-message mt-1 block";
          container.appendChild(errorEl);
        }
        errorEl.textContent = errors[field];
        errorEl.classList.remove("hidden");
      }
    });
  }

  // Color preview
  const hexInput = document.getElementById("hex_preview");
  const colorPreview = document.getElementById("color-preview");

  if (hexInput && colorPreview) {
    hexInput.addEventListener("input", () => {
      const hex = hexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        colorPreview.style.background = hex;
      }
    });
  }

  // Cancel button
  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.href = `product-detail.html?id=${productId}`;
  }

  // Set SKU input readonly
  const skuInput = document.getElementById("sku");
  if (skuInput) {
    skuInput.setAttribute("readonly", "readonly");
    skuInput.classList.add("bg-gray-50");
  }

  // Auto-fill SKU khi size hoặc color thay đổi
  const sizeLInput = document.getElementById("size_L");
  if (sizeLInput) {
    sizeLInput.addEventListener("change", autoFillSKU);
    sizeLInput.addEventListener("input", autoFillSKU);
  }

  if (hexInput) {
    hexInput.addEventListener("change", autoFillSKU);
  }

  // Load data
  await loadProductInfo();
  await loadAllVariants();
  await loadAllProducts();

  // Auto-fill SKU lần đầu nếu có data
  autoFillSKU();

  // Submit form
  const btn = document.getElementById("button_submit");
  btn.addEventListener("click", async function (e) {
    e.preventDefault();

    clearErrors();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    // Collect data
    const sku = document.getElementById("sku").value.trim();
    const size_L = Number(document.getElementById("size_L").value);
    const price = Number(document.getElementById("price").value);
    const quantity = Number(document.getElementById("quantity").value);
    const hex_preview = document.getElementById("hex_preview").value.trim();
    const palettesText = document
      .getElementById("supported_palettes")
      .value.trim();
    const isActiveValue = document.getElementById("is_active").value;

    const payload = {
      product_id: productId,
      sku,
      size_L,
      price,
      hex_preview,
      supported_palettes: parsePalettes(palettesText),
      is_active: isActiveValue === "1",
      created_at: new Date().toISOString(),
    };

    try {
      btn.disabled = true;
      btn.classList.add("opacity-60", "cursor-not-allowed");

      const resp = await variantModule.storeVariant(productId, payload);

      if (resp && resp.name) {
        // Tự động tạo inventory record cho biến thể mới
        try {
          const inventoryPayload = {
            sku: sku,
            quantity: quantity,
            location: "Kho chính",
            note: `Tự động tạo cho biến thể ${sku}`,
            updated_at: new Date().toISOString(),
          };
          await inventoryModule.storeInventory(inventoryPayload);
          console.log("Đã tạo inventory record cho variant:", sku);
        } catch (invError) {
          console.error("Lỗi khi tạo inventory:", invError);
          // Không chặn flow, chỉ log lỗi
        }

        alert("Thêm biến thể thành công");
        window.location.href = `product-detail.html?id=${productId}`;
      } else {
        alert("Không thể thêm biến thể. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm biến thể:", error);
      alert("Có lỗi xảy ra khi thêm biến thể.");
    } finally {
      btn.disabled = false;
      btn.classList.remove("opacity-60", "cursor-not-allowed");
    }
  });
});
