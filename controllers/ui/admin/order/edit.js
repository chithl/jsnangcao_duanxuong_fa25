import { OrderAPI } from "../../../api/OrderAPI.js";

var orderModule = new OrderAPI();
var params = new URLSearchParams(window.location.search);
var id = params.get("id");
var form = document.getElementById("edit-order");

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

// Load current order
(async () => {
    try {
        var res = await orderModule.getOneOrder(id);
        if (res && res.status === 200) {
            var { customer_name, total, payment_status, created_at } = res.data;
            document.getElementById("id").value = id;
            document.getElementById("order_id_display").value = '#' + id;
            document.getElementById("customer_name").value = customer_name;
            document.getElementById("total_display").value = formatCurrency(total);
            document.getElementById("payment_status").value = payment_status || 'unpaid';
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Không thể tải thông tin đơn hàng');
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paymentStatusValue = document.getElementById("payment_status").value;

    if (!paymentStatusValue) {
        alert('Vui lòng chọn trạng thái thanh toán');
        return;
    }

    var data = {
        payment_status: paymentStatusValue
    };

    try {
        var response = await orderModule.updateOrder(id, data);
        if (response && response.status === 200) {
            alert("Cập nhật trạng thái thanh toán thành công!");
            window.location.href = "orders.html"; 
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + (error.message || 'Không thể cập nhật trạng thái thanh toán'));
    }
});
