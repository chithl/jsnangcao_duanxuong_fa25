import { OrderAPI } from "../../../api/OrderAPI.js";
import { OrderItemAPI } from "../../../api/OrderItemAPI.js";

const orderModule = new OrderAPI();
const orderItemModule = new OrderItemAPI();

// Get order ID from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

// Store current order data
let orderData = null;

/**
 * Format date to Vietnamese format (DD/MM/YYYY HH:mm)
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format currency (VND)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

/**
 * Get order status label
 */
function getOrderStatusLabel(status) {
    const labels = {
        0: 'Đang xử lí',
        1: 'Đang giao',
        2: 'Đã giao',
        3: 'Đã hủy'
    };
    return labels[status] || 'Đang xử lí';
}

/**
 * Get payment method label
 */
function getPaymentMethodLabel(method) {
    const methods = {
        'online': 'Thanh toán online',
        'COD': 'Thanh toán khi nhận hàng'
    };
    return methods[method] || method || '-';
}

/**
 * Load order details
 */
async function loadOrderDetail() {
    if (!orderId) {
        alert('Không tìm thấy ID đơn hàng');
        window.location.href = 'orders.html';
        return;
    }

    try {
        // Load order info
        const orderResponse = await orderModule.getOne(orderId);
        
        const order = orderResponse.data || orderResponse;

        if (!order) {
            alert('Không tìm thấy đơn hàng');
            window.location.href = 'orders.html';
            return;
        }

        // Store order data globally
        orderData = order;
        // Ensure status is a number
        orderData.status = parseInt(orderData.status) || 0;

        // Display order info
        displayOrderInfo(order);

        // Load order items từ order_items collection
        await loadOrderItems(orderId);

    } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu');
    }
}

/**
 * Display order information
 */
function displayOrderInfo(order) {
    const orderInfoDiv = document.getElementById('order-info');
    const orderStatusSelect = document.getElementById('order-status');

    if (!orderInfoDiv) {
        console.error('Không tìm thấy element #order-info');
        return;
    }

    orderInfoDiv.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">#${orderId.substring(0, 8)}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Trạng thái:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${getOrderStatusLabel(order.status)}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Địa chỉ giao hàng:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${order.shipping_address || '-'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">User ID:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${order.user_id ? order.user_id.substring(0, 10) : '-'}</span>
            </div>
        </div>
        <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Tổng tiền:</span>
                <span class="text-sm font-semibold text-brand-500">${formatCurrency(order.total)}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Phương thức thanh toán:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${getPaymentMethodLabel(order.payment_method)}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Mã khuyến mãi:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${order.promoCode || 'Không có'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Ngày tạo:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${formatDate(order.create_at)}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Ngày thanh toán:</span>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">${formatDate(order.paid_at)}</span>
            </div>
        </div>
    `;

    // Set current status in select and update options based on current status
    if (orderStatusSelect) {
        const currentStatus = parseInt(order.status) || 0;
        
        // Update select options based on status logic:
        // 0 → 1, 2, 3
        // 1 → 2, 3
        // 2 → 3
        // 3 → không cho chuyển
        updateStatusOptions(currentStatus);
    }
}

/**
 * Update status select options based on current status
 */
function updateStatusOptions(currentStatus) {
    const orderStatusSelect = document.getElementById('order-status');
    const submitButton = orderStatusSelect.closest('form').querySelector('button[type="submit"]');
    
    if (!orderStatusSelect) return;
    
    // Clear existing options
    orderStatusSelect.innerHTML = '';
    
    const allStatuses = [
        { value: 0, label: 'Đang xử lí' },
        { value: 1, label: 'Đang giao' },
        { value: 2, label: 'Đã giao' },
        { value: 3, label: 'Đã hủy' }
    ];
    
    if (currentStatus === 3) {
        // Nếu đã hủy, không cho chuyển, disable select
        orderStatusSelect.innerHTML = '<option value="3">Đã hủy</option>';
        orderStatusSelect.disabled = true;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        // Enable select
        orderStatusSelect.disabled = false;
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        // Add current status option
        const currentOption = allStatuses.find(s => s.value === currentStatus);
        if (currentOption) {
            const opt = document.createElement('option');
            opt.value = currentOption.value;
            opt.text = currentOption.label;
            opt.selected = true;
            orderStatusSelect.add(opt);
        }
        
        // Add next available statuses
        // 0 → 1, 2, 3
        // 1 → 2, 3
        // 2 → 3
        const nextStatuses = allStatuses.filter(s => s.value > currentStatus);
        nextStatuses.forEach(status => {
            const opt = document.createElement('option');
            opt.value = status.value;
            opt.text = status.label;
            orderStatusSelect.add(opt);
        });
    }
}

/**
 * Display order items từ order object
 */
function displayOrderItems(order) {
    try {
        console.log('displayOrderItems called with order:', order);
        
        // Lấy items từ order object (lưu nested)
        const itemsObj = order.items || {};
        console.log('Items object:', itemsObj);
        
        // Convert object to array
        const items = Object.entries(itemsObj).map(([id, itemData]) => ({
            id,
            ...itemData
        }));
        
        console.log('Items array:', items);

        const orderItemsList = document.getElementById('order-items-list');
        console.log('orderItemsList element:', orderItemsList);

        if (items.length === 0) {
            console.warn('Không có sản phẩm nào');
            orderItemsList.innerHTML = '<tr><td colspan="5" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Không có sản phẩm nào</td></tr>';
            return;
        }

        console.log('Rendering items...');
        orderItemsList.innerHTML = items.map(item => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${item.name || '-'}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">${item.sku || 'N/A'}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${formatCurrency(item.price)}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${item.quantity || 0}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm font-semibold text-gray-800 dark:text-white/90">${formatCurrency((item.price || 0) * (item.quantity || 0))}</p>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        document.getElementById('order-items-list').innerHTML = '<tr><td colspan="5" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu sản phẩm</td></tr>';
    }
}

/**
 * Load order items (lấy từ collection order_items)
 */
async function loadOrderItems(orderId) {
    try {
        // Lấy tất cả items rồi filter
        const response = await orderItemModule.getAll();
        
        // Lấy data từ response
        const allItemsObj = response.data || {};
        
        // Filter items theo orderId
        const filteredItems = {};
        Object.entries(allItemsObj).forEach(([key, value]) => {
            // Case 1: Item đơn lẻ có orderId property
            if (value && 
                typeof value === 'object' && 
                !Array.isArray(value) && 
                value.orderId === orderId) {
                filteredItems[key] = value;
            }
            // Case 2: Key chính là orderId, items nested bên trong
            else if (key === orderId && value && typeof value === 'object') {
                Object.entries(value).forEach(([itemId, itemData]) => {
                    if (itemData && typeof itemData === 'object' && !Array.isArray(itemData)) {
                        filteredItems[itemId] = itemData;
                    }
                });
            }
        });
        
        // Convert object to array
        const items = Object.entries(filteredItems).map(([id, itemData]) => ({
            id,
            ...itemData
        }));

        const orderItemsList = document.getElementById('order-items-list');

        if (items.length === 0) {
            orderItemsList.innerHTML = '<tr><td colspan="5" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Không có sản phẩm nào</td></tr>';
            return;
        }

        orderItemsList.innerHTML = items.map(item => {
            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${item.name || '-'}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-600 dark:text-gray-400">${item.sku || 'N/A'}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${formatCurrency(item.price)}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm text-gray-800 dark:text-white/90">${item.quantity || 0}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-sm font-semibold text-gray-800 dark:text-white/90">${formatCurrency((item.price || 0) * (item.quantity || 0))}</p>
                </td>
            </tr>
        `;
        }).join('');
        
        console.log('Items rendered successfully');

    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        document.getElementById('order-items-list').innerHTML = '<tr><td colspan="5" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu sản phẩm</td></tr>';
    }
}

/**
 * Update order status
 */
async function updateOrderStatus(e) {
    e.preventDefault();

    const newStatus = parseInt(document.getElementById('order-status').value);
    const currentStatus = orderData ? (orderData.status || 0) : 0;

    // Validation: không cho chuyển từ status 3
    if (currentStatus === 3) {
        alert('Đơn hàng đã hủy không thể thay đổi trạng thái!');
        return;
    }

    // Validation: không cho chuyển ngược lại
    if (newStatus < currentStatus) {
        alert('Không thể chuyển về trạng thái trước đó!');
        return;
    }

    // Validation: phải khác trạng thái hiện tại
    if (newStatus === currentStatus) {
        alert('Vui lòng chọn trạng thái mới!');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?')) {
        try {
            await orderModule.updateStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            window.location.reload();
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetail();

    const updateStatusForm = document.getElementById('update-status-form');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', updateOrderStatus);
    }
});