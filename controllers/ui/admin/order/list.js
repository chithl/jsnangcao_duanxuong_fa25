import { OrderAPI } from "../../../api/OrderAPI.js";

var orderModule = new OrderAPI();
var orderListTable = document.getElementById("order-list");

/**
 * Format date to Vietnamese format (DD/MM/YYYY HH:mm)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get payment status badge
 */
function getPaymentStatusBadge(status) {
    const badges = {
        'paid': { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        'unpaid': { label: 'Chưa thanh toán', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        'pending': { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    };
    
    const badge = badges[status] || badges['unpaid'];
    return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badge.color}">${badge.label}</span>`;
}

/**
 * Format currency (VND)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Load and display all orders
 */
(async () => {
    try {
        var response = await orderModule.getAllOrder();
        var orders = Array.isArray(response) ? response : (response && response.data) || [];
        
        if (orders.length === 0) {
            orderListTable.innerHTML = '<tr><td colspan="6" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Không có đơn hàng nào</td></tr>';
            return;
        }

        orderListTable.innerHTML = orders.map(order => `
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">#${order.id}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${order.customer_name || '-'}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm font-semibold text-gray-800 dark:text-white/90">${formatCurrency(order.total || 0)}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    ${getPaymentStatusBadge(order.payment_status || 'unpaid')}
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">${formatDate(order.created_at)}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                        <a href="edit-orders.html?id=${order.id}" 
                            class="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-center text-sm font-medium text-blue-800 transition duration-300 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            Chỉnh sửa
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Lỗi khi tải danh sách đơn hàng:', error);
        orderListTable.innerHTML = '<tr><td colspan="6" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu</td></tr>';
    }
})();
