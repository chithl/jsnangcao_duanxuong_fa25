import { CartAPI } from "../../api/CartAPI.js";
import { ProductAPI } from "../../api/ProductAPI.js";
import { PromotionAPI } from "../../api/PromotionAPI.js";

let promotionAPI = new PromotionAPI();

const cartModule = new CartAPI();
const productModule = new ProductAPI();

const $ = (id) => document.getElementById(id);

let total = 0;

async function loadCartForUser() {
    let userIdBySess = "-OgefUjAMBYXbbt7tUIX";
    let cartId = "";

    if (localStorage.getItem('user')) {
        console.log(JSON.parse(localStorage.getItem('user')));
        userIdBySess = JSON.parse(localStorage.getItem('user')).id;
    }

    const cart = await cartModule.getCartByUser(userIdBySess);

    if (cart == null || cart == "") {
        let dataToCreate = {
            user_id: userIdBySess,
            cart_details: {
            },
        }

        let cartRes = await cartModule.createNewCart(dataToCreate);

        cartId = cartRes.data.name;
        console.log("Cart name is " + cartId);
    } else {
        cartId = cart.cartKey;
    }

    const itemsContainer = $("checkout-items");
    itemsContainer.innerHTML = "";

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

    console.log($("amount").value);
    console.log($("user_id").value);
}

/**
 * Hàm kiểm tra tính hợp lệ của mã khuyến mãi
 * @param {Object} promo - Object khuyến mãi từ Firebase
 * @param {Number} currentTotal - Tổng tiền hiện tại của giỏ hàng
 * @returns {Object} { isValid: boolean, message: string }
 */
const validatePromotion = (promo, currentTotal) => {
    const now = new Date();
    const startDate = new Date(promo.start_at);
    const endDate = new Date(promo.end_at);

    // 1. Kiểm tra trạng thái kích hoạt
    if (!promo.is_active) {
        return { isValid: false, message: "Mã giảm giá này hiện đã bị tạm dừng sử dụng." };
    }

    // 2. Kiểm tra thời gian bắt đầu
    if (now < startDate) {
        return { isValid: false, message: `Mã này có hiệu lực từ ngày ${startDate.toLocaleDateString("vi-VN")}.` };
    }

    // 3. Kiểm tra thời gian hết hạn
    if (now > endDate) {
        return { isValid: false, message: "Mã giảm giá đã hết hạn sử dụng." };
    }

    // 4. Kiểm tra giới hạn lượt dùng (Usage Limit)
    if (promo.used_count >= promo.usage_limit) {
        return { isValid: false, message: "Mã giảm giá đã hết lượt sử dụng." };
    }

    // 5. Kiểm tra giá trị đơn hàng tối thiểu (Min Order)
    if (currentTotal < promo.min_order) {
        const missingAmount = promo.min_order - currentTotal;
        return {
            isValid: false,
            message: `Đơn hàng chưa đủ điều kiện. Cần mua thêm ít nhất ${missingAmount.toLocaleString("vi-VN")}đ để áp dụng mã này.`
        };
    }

    return { isValid: true, message: "Áp dụng mã thành công!" };
};

document.querySelector("#apply_promo_code").addEventListener("click", async () => {
    const codeInput = document.querySelector("#promotion_code_input").value.trim();

    if (!codeInput) {
        alert("Vui lòng nhập mã khuyến mãi");
        return;
    }

    // Giả sử 'total' là biến toàn cục chứa tổng tiền hiện tại
    const currentCartTotal = typeof total !== 'undefined' ? total : 0;

    try {
        const promoRes = await promotionAPI.getAllPromotion();
        if (!promoRes) {
            alert("Lỗi kết nối dữ liệu khuyến mãi.");
            return;
        }

        // Tìm promo theo code
        const promoData = Object.entries(promoRes).find(([id, value]) => value.code === codeInput);

        if (!promoData) {
            alert("Mã khuyến mãi không tồn tại.");
            return;
        }

        const selectedPromo = { id: promoData[0], ...promoData[1] };

        // --- BẮT LỖI CHUẨN CHỈNH ---
        const validation = validatePromotion(selectedPromo, currentCartTotal);

        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        // --- TÍNH TOÁN SỐ TIỀN MỚI ---
        let discountAmount = 0;
        if (selectedPromo.type === "percentage") {
            discountAmount = currentCartTotal * (selectedPromo.value / 100);
        } else {
            discountAmount = selectedPromo.value;
        }

        // Đảm bảo số tiền giảm không vượt quá tổng hóa đơn
        const totalNew = Math.max(0, currentCartTotal - discountAmount);

        // --- CẬP NHẬT UI ---
        const formattedPrice = totalNew.toLocaleString("vi-VN") + "đ";
        document.getElementById("subtotal").innerText = formattedPrice;
        document.getElementById("total").innerText = formattedPrice;

        // Gán vào hidden input để gửi lên server/firebase khi checkout
        document.getElementById("amount").value = totalNew;
        document.getElementById("promotion_code").value = selectedPromo.code;

        alert(validation.message); // "Áp dụng mã thành công!"

    } catch (error) {
        console.error("Lỗi khi áp mã:", error);
        alert("Có lỗi xảy ra trong quá trình xử lý.");
    }
});

await loadCartForUser();
