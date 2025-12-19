import { InventoryAPI } from "../../../api/InventoryAPI.js";

const inventoryModule = new InventoryAPI();
let currentInventoryId = null;

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

async function loadInventory(id) {
  try {
    setStatus("Đang tải dữ liệu...", "info");
    const data = await inventoryModule.getOneInventory(id);

    if (!data) {
      setStatus("Không tìm thấy dữ liệu tồn kho", "error");
      return;
    }

    // Populate form
    document.getElementById("inventory-id").value = id;
    document.getElementById("sku").value = data.sku || "";
    document.getElementById("quantity").value = data.quantity || "";
    document.getElementById("location").value = data.location || "";
    document.getElementById("note").value = data.note || "";

    clearStatus();
  } catch (error) {
    console.error(error);
    setStatus("Không thể tải dữ liệu. Vui lòng thử lại!", "error");
  }
}

async function updateInventory(id, payload) {
  try {
    const btn = document.getElementById("btn-save");
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-60");
    }

    await inventoryModule.updateInventory(id, payload);
    setStatus("Cập nhật thành công! Đang chuyển trang...", "success");

    setTimeout(() => {
      window.location.href = "inventories.html";
    }, 800);
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

async function deleteInventory(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa tồn kho này?")) return;

  try {
    const btn = document.getElementById("btn-delete");
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-60");
    }

    await inventoryModule.deleteInventory(id);
    setStatus("Xóa thành công! Đang chuyển trang...", "success");

    setTimeout(() => {
      window.location.href = "inventories.html";
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

export function initInventoryEditForm() {
  const id = getUrlParam("id");
  if (!id) {
    setStatus("Không tìm thấy ID tồn kho. Vui lòng quay lại!", "error");
    return;
  }

  currentInventoryId = id;
  loadInventory(id);

  const form = document.getElementById("inventory-form");
  if (form) {
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

      await updateInventory(currentInventoryId, payload);
    });
  }

  const btnDelete = document.getElementById("btn-delete");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => {
      deleteInventory(currentInventoryId);
    });
  }
}
