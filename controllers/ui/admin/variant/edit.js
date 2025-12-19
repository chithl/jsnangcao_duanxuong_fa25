import { VariantAPI } from "../../../api/VariantAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";

const variantModule = new VariantAPI();
const productModule = new ProductAPI();
let currentVariantId = null;
let currentProductId = null;

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function setStatus(message, type = "info") {
  const box = document.getElementById("form-status");
  if (!box) return;

  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    success: "border-success-200 bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
    error: "border-error-200 bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300",
  };

  box.className = `rounded-lg border p-3 text-sm ${styles[type] || styles.info}`;
  box.textContent = message;
  box.classList.remove("hidden");
}

function clearStatus() {
  const box = document.getElementById("form-status");
  if (!box) return;
  box.classList.add("hidden");
  box.textContent = "";
}

function getFormData() {
  const sku = document.getElementById("sku")?.value?.trim() || "";
  const size_L = document.getElementById("size_L")?.value?.trim() || "";
  const price = document.getElementById("price")?.value?.trim() || "";
  const hex_preview = document.getElementById("hex_preview")?.value?.trim() || "";
  const is_active = document.getElementById("is_active")?.value === "true";

  return { sku, size_L, price, hex_preview, is_active };
}

function clearFieldErrors() {
  ["sku", "size_L", "price"].forEach((key) => {
    const el = document.getElementById(`error-${key}`);
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
    const input = document.getElementById(key);
    if (input) {
      input.classList.remove(
        "border-error-300",
        "focus:border-error-500",
        "focus:ring-error-500"
      );
    }
  });
}

function setFieldErrors(errors) {
  Object.entries(errors).forEach(([key, message]) => {
    const el = document.getElementById(`error-${key}`);
    if (el) {
      el.textContent = message;
      el.classList.remove("hidden");
    }
    const input = document.getElementById(key);
    if (input) {
      input.classList.add(
        "border-error-300",
        "focus:border-error-500",
        "focus:ring-error-500"
      );
    }
  });
}

function validateFields(data) {
  const errors = {};

  if (!data.sku) errors.sku = "Sku là bắt buộc";

    if (!data.hex_preview) errors.hex_preview = "Màu sắc là bắt buộc";

  const sizeNum = parseFloat(data.size_L);
  if (!data.size_L) errors.size_L = "Dung tích là bắt buộc";
  else if (Number.isNaN(sizeNum) || sizeNum <= 0) errors.size_L = "Dung tích không hợp lệ";

  const priceNum = parseFloat(data.price);
  if (!data.price) errors.price = "Giá bán là bắt buộc";
  else if (Number.isNaN(priceNum) || priceNum < 0) errors.price = "Giá bán không hợp lệ";

  return { errors, sizeNum, priceNum };
}

async function loadVariant(id) {
  try {
    setStatus("Đang tải dữ liệu...", "info");
    const data = await variantModule.getOneVariant(id);

    if (!data) {
      setStatus("Không tìm thấy biến thể", "error");
      return;
    }

    // Populate form
    document.getElementById("variant-id").value = id;
    document.getElementById("product_id").value = data.product_id || "";
    document.getElementById("sku").value = data.sku || "";
    document.getElementById("size_L").value = data.size_L || "";
    document.getElementById("price").value = data.price || "";
    document.getElementById("hex_preview").value = data.hex_preview || "";
    document.getElementById("is_active").value = data.is_active ? "true" : "false";

    // Update color picker
    const colorPicker = document.getElementById("hex_preview_picker");
    if (colorPicker && data.hex_preview) {
      colorPicker.value = data.hex_preview;
    }

    // Load product name
    currentProductId = data.product_id;
    if (currentProductId) {
      await loadProductName(currentProductId);
    }

    clearStatus();
  } catch (error) {
    console.error(error);
    setStatus("Không thể tải dữ liệu. Vui lòng thử lại!", "error");
  }
}

async function loadProductName(productId) {
  try {
    const product = await productModule.getOneProduct(productId);
    if (product && product.name) {
      document.getElementById("product_name").value = product.name;
    }
  } catch (error) {
    console.error("Lỗi load product:", error);
  }
}

async function updateVariant(id, payload) {
  try {
    const btn = document.getElementById("btn-save");
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-60");
    }

    await variantModule.updateVariant(id, payload);
    
    alert("Cập nhật biến thể thành công!");
    
    if (currentProductId) {
      window.location.href = `product-detail.html?id=${currentProductId}`;
    } else {
      window.location.href = "products.html";
    }
  } catch (error) {
    console.error(error);
    setStatus("Không thể cập nhật. Vui lòng thử lại!", "error");
  } finally {
    const btn = document.getElementById("btn-save");
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("opacity-60");
    }
  }
}

async function deleteVariant(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;

  try {
    const btn = document.getElementById("btn-delete");
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-60");
    }

    await variantModule.deleteVariant(id);
    setStatus("Xóa thành công! Đang chuyển trang...", "success");

    setTimeout(() => {
      if (currentProductId) {
        window.location.href = `product-detail.html?id=${currentProductId}`;
      } else {
        window.location.href = "products.html";
      }
    }, 800);
  } catch (error) {
    console.error(error);
    setStatus("Không thể xóa. Vui lòng thử lại!", "error");
  } finally {
    const btn = document.getElementById("btn-delete");
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("opacity-60");
    }
  }
}

export function initVariantEditForm() {
  const id = getUrlParam("id");
  if (!id) {
    setStatus("Không tìm thấy ID biến thể. Vui lòng quay lại!", "error");
    return;
  }

  currentVariantId = id;
  loadVariant(id);

  // Color picker sync
  const colorPicker = document.getElementById("hex_preview_picker");
  const hexInput = document.getElementById("hex_preview");
  
  if (colorPicker && hexInput) {
    colorPicker.addEventListener("input", (e) => {
      hexInput.value = e.target.value;
    });

    hexInput.addEventListener("input", (e) => {
      const value = e.target.value;
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        colorPicker.value = value;
      }
    });
  }

  // Form submit
  const form = document.getElementById("edit-variant-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearStatus();
      clearFieldErrors();

      const data = getFormData();
      const { errors, sizeNum, priceNum } = validateFields(data);
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        // setStatus("Vui lòng kiểm tra các trường bắt buộc", "error");
        return;
      }

      const payload = {
        product_id: currentProductId,
        sku: data.sku,
        size_L: sizeNum,
        price: priceNum,
        hex_preview: data.hex_preview || "",
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      await updateVariant(currentVariantId, payload);
    });
  }

  // Delete button
  const btnDelete = document.getElementById("btn-delete");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => {
      deleteVariant(currentVariantId);
    });
  }

  // Back button
  const btnBack = document.getElementById("btn-back");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (currentProductId) {
        window.location.href = `product-detail.html?id=${currentProductId}`;
      } else {
        window.location.href = "products.html";
      }
    });
  }
}
