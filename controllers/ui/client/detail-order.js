import { OrderAPI } from "../../api/OrderAPI.js";
import { OrderItemAPI } from "../../api/OrderItemAPI.js";

const orderAPI = new OrderAPI();
const orderItemAPI = new OrderItemAPI();

// lấy orderId từ URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

if (!orderId) {
    alert("Không tìm thấy đơn hàng");
    throw new Error("Missing orderId");
}

/**
 * Load thông tin đơn hàng
 */
async function loadOrderDetail() {
    try {
        const res = await orderAPI.getOrderById(orderId);

        if (!res || !res.data) {
            alert("Đơn hàng không tồn tại");
            return;
        }

        const order = res.data;

        document.getElementById("order-id").innerText = orderId;
        document.getElementById("created-at").innerText =
            order.create_at
                ? new Date(order.create_at).toLocaleString("vi-VN")
                : "";

        const statusMap = {
            0: "Đang xử lý",
            1: "Đang giao",
            2: "Đã giao",
            3: "Đã hủy"
        };
        const statusKey = typeof order.status === "string" ? Number(order.status) : order.status;
        document.getElementById("status").innerText = statusMap[statusKey] || "";
        document.getElementById("payment").innerText = order.payment_method || "";
        document.getElementById("address").innerText = order.shipping_address || "";
        document.getElementById("total").innerText =
            Number(order.total).toLocaleString("vi-VN") + " đ";

    } catch (error) {
        console.error("Lỗi load order detail:", error);
    }
}

/**
 * Load danh sách sản phẩm theo orderId
 */
async function loadOrderItems() {
    try {
        const res = await axios.get('https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/order_items.json');
        const allItems = res.data || {};
        const items = Object.values(allItems).filter(i => i.orderId === "-OgqEPiPXHL03m499MJE");

        const list = document.getElementById("order-items");
        const empty = document.getElementById("empty-items");

        if (items.length === 0) {
            empty.classList.remove("hidden");
            return;
        }

        let html = "";
        items.forEach(i => {
            html += `
                <tr>
                    <td>${i.name}</td>
                    <td>${i.sku || "N/A"}</td>
                    <td class="text-right">${Number(i.price).toLocaleString("vi-VN")} đ</td>
                    <td class="text-center">${i.quantity}</td>
                    <td class="text-right">${Number(i.price * i.quantity).toLocaleString("vi-VN")} đ</td>
                </tr>
            `;
        });

        list.innerHTML = html;

    } catch (error) {
        console.error("Lỗi load order items:", error);
        document.getElementById("empty-items").classList.remove("hidden");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadOrderDetail();
    loadOrderItems();
});
