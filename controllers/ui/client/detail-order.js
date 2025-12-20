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
        const items = Object.values(allItems).filter(i => i.orderId === orderId);

        const list = document.getElementById("order-items");
        const empty = document.getElementById("empty-items");
        const countBadge = document.getElementById("items-count");

        if (items.length === 0) {
            empty.classList.remove("hidden");
            countBadge.innerText = "0 sản phẩm";
            return;
        }

        empty.classList.add("hidden");
        countBadge.innerText = `${items.length} sản phẩm`;
        let html = "";
        items.forEach(i => {
            html += `
                <tr>
                    <td class="px-6 py-4 align-middle">
                        <div class="font-semibold text-gray-900">${i.name}</div>
                        <div class="text-xs text-gray-500">${i.description || ""}</div>
                    </td>
                    <td class="px-6 py-4 align-middle">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">${i.sku || "N/A"}</span>
                    </td>
                    <td class="px-6 py-4 align-middle text-right text-gray-900 font-semibold">${Number(i.price).toLocaleString("vi-VN")} đ</td>
                    <td class="px-6 py-4 align-middle text-center">
                        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-gray-800 font-semibold">${i.quantity}</span>
                    </td>
                    <td class="px-6 py-4 align-middle text-right text-red-600 font-bold">${Number(i.price * i.quantity).toLocaleString("vi-VN")} đ</td>
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
