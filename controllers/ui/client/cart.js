import { CartAPI } from "../../api/CartAPI.js";
import { ProductAPI } from "../../api/ProductAPI.js";

const cartModule = new CartAPI();
const productModule = new ProductAPI();
// Helper để lấy element theo id
const $ = (id) => document.getElementById(id);

async function loadCartForUser() {
    try {
        const cart = await cartModule.getCartByUser("-OgefUjAMBYXbbt7tUIX");
        const cartContainer = $("cart-items");

        let cartContent = "";
        let subtotal = 0;
        let total = 0;
        if (!cart || !cart.cart_details || Object.keys(cart.cart_details).length === 0) {
            // Giỏ hàng trống nhưng vẫn hiện card
            cartContent = `
                <div class="card mb-3">
                    <div class="card-body text-center text-muted">
                        Không có sản phẩm nào trong giỏ hàng
                    </div>
                </div>
            `;
        } else {
            // Giỏ hàng có sản phẩm
            for (const detailId in cart.cart_details) {
                const item = cart.cart_details[detailId];
                if (!item) continue;

                const product = await productModule.getOneProduct(item.product_id);
                const name = product?.name ?? "";
                const image = product?.images?.[0] ?? "";
                const stock = product?.stock ?? 0;

                subtotal += item.unit_price * item.quantity;
                total += item.unit_price * item.quantity; // Chưa tính thuế, phí vận chuyển
                cartContent += `
                    <div class="card mb-3">
                        <div class="card-body d-flex align-items-center gap-3">
                            <img src="${image}" width="90" height="90" class="rounded">
                            <div class="flex-grow-1">
                                <h6 class="fw-semibold mb-1">${name}</h6>
                                <p class="small mb-1">Tồn kho: <strong>${stock}</strong></p>
                                <div class="d-flex align-items-center gap-3">
                                    <strong class="text-danger">${item.unit_price.toLocaleString()} đ</strong>
                                    <div class="input-group input-group-sm" style="width:130px">
                                        <button class="btn btn-outline-secondary btn-minus"
                                            data-cart="${cart.cartKey}"
                                            data-detail="${detailId}"
                                            data-qty="${item.quantity}">−</button>
                                        <input class="form-control text-center" value="${item.quantity}" readonly>
                                        <button class="btn btn-outline-secondary btn-plus"
                                            data-cart="${cart.cartKey}"
                                            data-detail="${detailId}"
                                            data-qty="${item.quantity}"
                                            data-stock="${stock}">+</button>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-outline-danger btn-remove"
                                data-cart="${cart.cartKey}"
                                data-detail="${detailId}">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        cartContainer.innerHTML = cartContent;

        $("subtotal").innerText = subtotal.toLocaleString() + "đ";
        $("total").innerText = total.toLocaleString() + "đ";
        // Luôn bind sự kiện, ngay cả khi giỏ rỗng
        bindCartEvents(cart?.cartKey);
        bindCheckout(cart?.cartKey);

    } catch (err) {
        console.error("Lỗi load cart:", err);
    }
}


function bindCartEvents(cartKey) {
    // Xóa sản phẩm
    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.onclick = async () => {
            const detailId = btn.dataset.detail;
            if (!confirm("Xóa sản phẩm này?")) return;

            await cartModule.removeItemFromCart(cartKey, detailId);
            loadCartForUser();
        };
    });

    // Tăng số lượng
    document.querySelectorAll(".btn-plus").forEach(btn => {
        btn.onclick = async () => {
            const { detail, qty, stock } = btn.dataset;
            if (+qty >= +stock) return showAlert("Vượt tồn kho", "warning");

            await cartModule.updateItemQuantity(cartKey, detail, +qty + 1);
            loadCartForUser();
        };
    });

    // Giảm số lượng
    document.querySelectorAll(".btn-minus").forEach(btn => {
        btn.onclick = async () => {
            const { detail, qty } = btn.dataset;
            if (+qty <= 1) return showAlert("Số lượng tối thiểu là 1", "warning");

            await cartModule.updateItemQuantity(cartKey, detail, +qty - 1);
            loadCartForUser();
        };
    });
}

function bindCheckout(cartKey) {
    const btnCheckout = document.getElementById("btn-checkout");
    if (!btnCheckout) return;

    btnCheckout.onclick = async () => {
        try {
            if (!cartKey) throw new Error("Giỏ hàng trống");

            // Lấy cart mới nhất
            const cart = await cartModule.getOne(cartKey);

            if (!cart.data || !cart.data.cart_details || Object.keys(cart.data.cart_details).length === 0) {
                showAlert("Giỏ hàng trống, không thể thanh toán!", "danger");
                return; // không chuyển trang
            }

            // Nếu có sản phẩm → chuyển trang
            window.location.href = `checkout.html?cartKey=${cartKey}`;
        } catch (err) {
            console.error(err);
            showAlert(err.message || "Giỏ hàng trống, không thể thanh toán!", "danger");
        }
    };
}

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");

    alertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;}
// Load giỏ hàng khi trang mở
await loadCartForUser();
