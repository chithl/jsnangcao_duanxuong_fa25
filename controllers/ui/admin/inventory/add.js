import { InventoryAPI } from "../../../api/InventoryAPI.js";

const inventoryModule = new InventoryAPI();

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
  const sku = document.getElementById("sku")?.value?.trim();
  const quantity = parseInt(document.getElementById("quantity")?.value || "0", 10);
  const location = document.getElementById("location")?.value?.trim();
  const note = document.getElementById("note")?.value?.trim();

  return { sku, quantity, location, note };
}

function validate(data) {
  if (!data.sku) return "SKU là bắt buộc";
  if (data.quantity == null || isNaN(data.quantity) || data.quantity < 0) return "Số lượng không hợp lệ";
  return null;
}

export function initInventoryAddForm() {
  const form = document.getElementById("inventory-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const data = getFormData();
    const err = validate(data);
    if (err) {
      setStatus(err, "error");
      return;
    }

    const payload = {
      sku: data.sku,
      quantity: data.quantity,
      location: data.location || "",
      note: data.note || "",
      updated_at: new Date().toISOString(),
    };

    try {
      const btn = document.getElementById("btn-save");
      if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-60");
      }

      await inventoryModule.storeInventory(payload);
      setStatus("Tạo tồn kho thành công! Đang chuyển trang...", "success");

      setTimeout(() => {
        window.location.href = "inventories.html";
      }, 800);
    } catch (error) {
      console.error(error);
      setStatus("Không thể tạo tồn kho. Vui lòng thử lại!", "error");
    } finally {
      const btn = document.getElementById("btn-save");
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("opacity-60");
      }
    }
  });
}
