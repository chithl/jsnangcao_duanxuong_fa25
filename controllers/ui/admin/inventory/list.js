import { InventoryAPI } from "../../../api/InventoryAPI.js";
import { VariantAPI } from "../../../api/VariantAPI.js";

const inventoryModule = new InventoryAPI();
const variantModule = new VariantAPI();

/**
 * Định dạng ngày tháng
 * @param {string|Date} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Xác định trạng thái tồn kho
 * @param {number} quantity
 * @returns {object} { status, label, color }
 */
function getStockStatus(quantity) {
  const qty = parseInt(quantity) || 0;
  if (qty === 0) {
    return {
      status: "out-stock",
      label: "Hết hàng",
      color: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
    };
  } else if (qty < 10) {
    return {
      status: "low-stock",
      label: `Tồn kho thấp (${qty})`,
      color: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
    };
  } else {
    return {
      status: "in-stock",
      label: `Còn hàng (${qty})`,
      color: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
    };
  }
}

/**
 * Tải danh sách tồn kho
 */
export async function loadInventoryList() {
  try {
    // Lấy dữ liệu inventory
    const inventoryList = await inventoryModule.getAllInventory();
    let data = [];

    if (Array.isArray(inventoryList)) {
      data = inventoryList.map((item) => ({
        id: item?.id || item?._id || item?.key || "",
        ...item,
      }));
    } else if (typeof inventoryList === "object" && inventoryList !== null) {
      data = Object.entries(inventoryList).map(([id, item]) => ({
        id,
        ...item,
      }));
    }

    console.log("Inventory Data:", data);

    // Render danh sách
    renderInventoryTable(data);

    // Setup event listeners cho search & filter
    setupSearchAndFilter(data);
  } catch (error) {
    console.error("Lỗi khi tải danh sách tồn kho:", error);
    displayError("Không thể tải dữ liệu tồn kho. Vui lòng thử lại!");
  }
}

/**
 * Render bảng tồn kho
 * @param {Array} data - Danh sách inventory
 */
function renderInventoryTable(data) {
  const inventoryListEl = document.getElementById("inventory-list");

  if (!data || data.length === 0) {
    inventoryListEl.innerHTML = `
      <tr>
        <td colspan="6" class="px-5 py-8 text-center text-gray-500">
          <div class="flex flex-col items-center justify-center">
            <svg class="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-sm">Không có dữ liệu tồn kho</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let content = "";

  data.forEach((item) => {
    const stockStatus = getStockStatus(item.quantity);
    const updatedAt = formatDate(item.updated_at);

    content += `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
        <!-- SKU -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center">
            <p class="text-gray-700 text-theme-sm font-medium dark:text-gray-300">
              ${item.sku || "N/A"}
            </p>
          </div>
        </td>

        <!-- Số lượng -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center">
            <p class="text-gray-700 text-theme-sm dark:text-gray-300">
              <strong>${item.quantity || 0}</strong> cái
            </p>
          </div>
        </td>

        <!-- Vị trí kho -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center">
            <p class="text-gray-500 text-theme-sm dark:text-gray-400">
              ${item.location || "N/A"}
            </p>
          </div>
        </td>

        <!-- Trạng thái -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center">
            <span class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${stockStatus.color}">
              ${stockStatus.label}
            </span>
          </div>
        </td>

        <!-- Cập nhật lần cuối -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center">
            <p class="text-gray-500 text-theme-xs dark:text-gray-400">
              ${updatedAt}
            </p>
          </div>
        </td>

        <!-- Hành động -->
        <td class="px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <!-- Nút điều chỉnh -->
            <button type="button" onclick="adjustStock('${item.id}')"
              class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 hover:bg-blue-light-100">
              <i class="bi bi-arrow-left-right"></i>
            </button>

            <!-- Nút sửa -->
            <button type="button" onclick="editInventory('${item.id}')"
              class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 hover:bg-blue-light-100">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button type="button" onclick="deleteInventory('${item.id}')"
             class="inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-error-100">
            <i class="bi bi-trash"></i>
           </button>
            
          </div>
        </td>
      </tr>
    `;
  });

  inventoryListEl.innerHTML = content;
}

//  Nút xóa
//             <button type="button" onclick="deleteInventory('${item.id}')"
//               class="inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-error-100">
//               <i class="bi bi-trash"></i>
//             </button>

/**
 * Setup search & filter event listeners
 * @param {Array} originalData - Dữ liệu gốc từ API
 */
function setupSearchAndFilter(originalData) {
  const searchBtn = document.getElementById("btn-search");
  const searchSkuInput = document.getElementById("search-sku");
  const filterLocationSelect = document.getElementById("filter-location");
  const filterStatusSelect = document.getElementById("filter-status");

  if (!searchBtn) return;

  searchBtn.addEventListener("click", () => {
    const searchSku = searchSkuInput?.value?.toLowerCase() || "";
    const filterLocation = filterLocationSelect?.value || "";
    const filterStatus = filterStatusSelect?.value || "";

    let filteredData = originalData.filter((item) => {
      // Lọc SKU
      const matchSku =
        !searchSku || (item.sku || "").toLowerCase().includes(searchSku);

      // Lọc vị trí kho
      const matchLocation =
        !filterLocation || item.location === filterLocation;

      // Lọc trạng thái
      let matchStatus = true;
      if (filterStatus) {
        const stockStatus = getStockStatus(item.quantity);
        matchStatus = stockStatus.status === filterStatus;
      }

      return matchSku && matchLocation && matchStatus;
    });

    renderInventoryTable(filteredData);
  });

  // Enter key để search
  searchSkuInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });
}

/**
 * Điều chỉnh số lượng tồn kho
 * @param {string} inventoryId
 */
window.adjustStock = function (inventoryId) {
  const quantity = prompt("Nhập số lượng mới:");
  if (quantity === null) return;

  const newQty = parseInt(quantity);
  if (isNaN(newQty) || newQty < 0) {
    alert("Vui lòng nhập số lượng hợp lệ!");
    return;
  }

  updateInventoryStock(inventoryId, newQty);
};

/**
 * Cập nhật số lượng tồn kho
 * @param {string} id
 * @param {number} newQuantity
 */
async function updateInventoryStock(id, newQuantity) {
  try {
    const current = await inventoryModule.getOneInventory(id);
    const payload = {
      ...(current || {}),
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };

    await inventoryModule.updateInventory(id, payload);
    alert("Cập nhật số lượng thành công!");
    loadInventoryList(); // Reload danh sách
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    alert("Không thể cập nhật số lượng. Vui lòng thử lại!");
  }
}

/**
 * Chỉnh sửa tồn kho
 * @param {string} id
 */
window.editInventory = function (id) {
  window.location.href = `edit-inventories.html?id=${id}`;
};

/**
 * Xóa tồn kho
 * @param {string} id
 */
window.deleteInventory = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa tồn kho này?")) {
    deleteInventoryItem(id);
  }
};

/**
 * Xóa item inventory
 * @param {string} id
 */
async function deleteInventoryItem(id) {
  try {
    await inventoryModule.deleteInventory(id);
    alert("Xóa thành công!");
    loadInventoryList(); // Reload danh sách
  } catch (error) {
    console.error("Lỗi xóa:", error);
    alert("Không thể xóa tồn kho. Vui lòng thử lại!");
  }
}

/**
 * Hiển thị thông báo lỗi
 * @param {string} message
 */
function displayError(message) {
  const inventoryListEl = document.getElementById("inventory-list");
  inventoryListEl.innerHTML = `
    <tr>
      <td colspan="6" class="px-5 py-8 text-center">
        <div class="flex flex-col items-center justify-center">
          <svg class="mb-3 h-12 w-12 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-error-600 dark:text-error-400">${message}</p>
        </div>
      </td>
    </tr>
  `;
}
