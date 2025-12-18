import { CartAPI } from "../../api/CartAPI.js";
import { ProductAPI } from "../../api/ProductAPI.js";

const cartModule = new CartAPI();
const productModule = new ProductAPI();

const $ = (id) => document.getElementById(id);

async function loadCartForUser() {
    try {
        const cart = await cartModule.getCartByUser("-OgefUjAMBYXbbt7tUIX");

        const itemsContainer = $("checkout-items");
        itemsContainer.innerHTML = "";

        let total = 0;

        for (const detailId in cart.cart_details) {
            const item = cart.cart_details[detailId];
            if (!item) continue;

            const product = await productModule.getOneProduct(item.product_id);
            if (!product) continue;

            const itemTotal = item.unit_price * item.quantity;
            total += itemTotal;

            itemsContainer.innerHTML += `
                <div class="d-flex mb-3 align-items-center">
                    <img src="${product.images?.[0] || ''}"
                         style="width:60px;height:60px;object-fit:cover"
                         class="rounded me-3">

                    <div class="flex-grow-1">
                        <div class="fw-bold">${product.name}</div>
                        <small class="text-muted">
                            ${item.quantity} × ${item.unit_price.toLocaleString("vi-VN")}đ
                        </small>
                    </div>

                    <div class="fw-bold">
                        ${itemTotal.toLocaleString("vi-VN")}đ
                    </div>
                </div>
            `;
        }

        // Hiển thị tổng tiền
        $("subtotal").innerText = total.toLocaleString("vi-VN") + "đ";
        $("total").innerText = total.toLocaleString("vi-VN") + "đ";

        // Gán hidden input
        $("amount").value = total;
        $("user_id").value = cart.user_id;

    } catch (err) {
        console.error("Lỗi load giỏ hàng:", err);
    }
}

loadCartForUser();
