import { OrderAPI } from "../../../api/OrderAPI.js";

var orderModule = new OrderAPI();
var orderListTable = document.getElementById("order-list");

/**
 * Format date to Vietnamese format (DD/MM/YYYY HH:mm)
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get order status badge
 * 0: Đang xử lí
 * 1: Đang giao
 * 2: Đã giao
 * 3: Đã hủy
 */
// function getOrderStatusBadge(status) {
//   const badges = {
//     0: {
//       label: "Đang xử lí",
//       color:
//         "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
//     },
//     1: {
//       label: "Đang giao",
//       color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
//     },
//     2: {
//       label: "Đã giao",
//       color:
//         "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
//     },
//     3: {
//       label: "Đã hủy",
//       color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
//     },
//   };

//   const badge = badges[status] !== undefined ? badges[status] : badges[0];
//   return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badge.color}">${badge.label}</span>`;
// }

/**
 * Get payment method label
 */
function getPaymentMethodLabel(method) {
  const methods = {
    online: "Thanh toán online",
    COD: "Thanh toán khi nhận hàng",
  };
  return methods[method] || method || "-";
}

/**
 * Format currency (VND)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Load and display all orders
 */
(async () => {
  try {
    var response = await orderModule.getAll();

    // Firebase trả về object, không phải array
    var ordersData = response.data || response || {};

    // Chuyển object thành array và thêm id từ key
    var orders = Object.entries(ordersData).map(([id, orderData]) => ({
      id,
      ...orderData,
    }));

    // Sắp xếp theo thời gian tạo (mới nhất trước)
    orders.sort((a, b) => {
      const dateA = new Date(a.create_at || 0);
      const dateB = new Date(b.create_at || 0);
      return dateB - dateA;
    });

    if (orders.length === 0) {
      orderListTable.innerHTML =
        '<tr><td colspan="6" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Không có đơn hàng nào</td></tr>';
      return;
    }

    orderListTable.innerHTML = orders
      .map(
        (order, index) => `
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">${
                      index + 1
                    }</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div>
                        <p class="text-sm text-gray-800 dark:text-white/90">${
                          order.shipping_address || "-"
                        }</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">User: ${
                          order.user_id ? order.user_id.substring(0, 8) : "-"
                        }</p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div>
                        <p class="text-sm font-semibold text-gray-800 dark:text-white/90">${formatCurrency(
                          order.total || 0
                        )}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${getPaymentMethodLabel(
                          order.payment_method
                        )}</p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    ${order.status == 0
                      ? '<span class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Đang xử lí</span>'
                      : order.status == 1
                      ? '<span class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Đang giao</span>'
                      : order.status == 2
                      ? '<span class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Đã giao</span>'
                      : '<span class="rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">Đã hủy</span>'
                    }
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">${formatDate(
                      order.create_at
                    )}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                             <a href="detail-order.html?id=${order.id}"
                      class="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
                       <i class="bi bi-eye"></i>
                    </a>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  } catch (error) {
    console.error("Lỗi khi tải danh sách đơn hàng:", error);
    orderListTable.innerHTML =
      '<tr><td colspan="6" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu</td></tr>';
  }
})();
