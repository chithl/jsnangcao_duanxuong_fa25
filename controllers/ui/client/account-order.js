import { OrderAPI } from "../../api/OrderAPI.js";

const orderModule = new OrderAPI();

const token = localStorage.getItem("token");
const userLocal = localStorage.getItem("user");

if (!token || !userLocal) {
    alert("Vui lòng đăng nhập");
    window.location.href = "login.html";
}

const decoded = JSON.parse(atob(token));
const userId = decoded.uid;

const user = JSON.parse(userLocal);
document.getElementById("user-name").innerText = user.name;

async function loadData() {
    try {
        const res = await orderModule.getByUserId(userId);
        console.log("ORDER RESULT:", res);

        if (!res.success) return;

        const orders = res.data || {};
        const list = document.getElementById("list");
        const empty = document.getElementById("empty-order");

        const data = Object.entries(orders).map(([id, item]) => ({
            id,
            ...item
        }));

        if (data.length === 0) {
            if (empty) empty.classList.remove("d-none");
            return;
        }

        const statusMap = {
            0: "Đang xử lý",
            1: "Đang giao",
            2: "Đã giao",
            3: "Đã hủy"
        };

        let html = "";
        data.forEach(o => {
            const statusKey = typeof o.status === "string" ? Number(o.status) : o.status;
            const statusLabel = statusMap[statusKey] || "";
            html += `
                <tr>
                    <td>#${o.id}</td>
                    <td>${new Date(o.create_at).toLocaleString("vi-VN")}</td>
                    <td>${Number(o.total).toLocaleString("vi-VN")} đ</td>
                    <td>${statusLabel}</td>
                    <td><a href="detail-order.html?id=${o.id}"
                                class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">
                                Chi tiết
                              </a></td>
                </tr>
            `;
        });

        list.innerHTML = html;

    } catch (error) {
        console.error("Lỗi load order", error);
    }
}

loadData(); // 👈 QUAN TRỌNG
