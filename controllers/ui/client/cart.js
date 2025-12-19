import { CartAPI } from "../../api/CartAPI.js";
import { ProductAPI } from "../../api/ProductAPI.js";
import { InventoryAPI } from "../../api/InventoryAPI.js";

const inventoryModule = new InventoryAPI();
const cartModule = new CartAPI();
const productModule = new ProductAPI();
// Helper để lấy element theo id
const $ = (id) => document.getElementById(id);



async function loadCartForUser() {
    try {
        let userIdBySess = "-OgefUjAMBYXbbt7tUIX";
        if (localStorage.getItem('user')) {
            userIdBySess = JSON.parse(localStorage.getItem('user')).id;
        }

        // TỐI ƯU: Tải song song Giỏ hàng và Toàn bộ kho đồ
        const [cart, allInventories] = await Promise.all([
            cartModule.getCartByUser(userIdBySess),
            inventoryModule.getAllInventory() // Lấy toàn bộ data kho
        ]);

        const cartContainer = $("cart-items");
        let cartContent = "";
        let subtotal = 0;

        if (!cart || !cart.cart_details || Object.keys(cart.cart_details).length === 0) {
            document.querySelector("#btn-checkout").disabled = true;
            cartContent = `
                <div class="card mb-3">
                    <div class="card-body text-center text-muted">Không có sản phẩm nào trong giỏ hàng</div>
                </div>`;
        } else {
            document.querySelector("#btn-checkout").disabled = false;

            // Chuyển allInventories thành mảng nếu Firebase trả về Object
            const inventoryList = Object.values(allInventories || {});

            for (const [detailId, item] of Object.entries(cart.cart_details)) {
                if (!item) continue;

                // 1. Lấy thông tin sản phẩm cơ bản (Ảnh, tên gốc)
                const product = await productModule.getOneProduct(item.product_id);
                const name = item.name || product?.name || "Sản phẩm";
                const image = product?.images?.[0] || "../../assets/client/img/no-image.png";

                // 2. TÌM TỒN KHO THỰC TẾ TRONG INVENTORY THEO SKU (item.variant_id)
                const invRecord = inventoryList.find(inv => inv.sku === item.variant_id);
                
                // Ưu tiên lấy quantity từ Inventory, nếu không thấy mới dùng stock từ Product
                const stock = invRecord ? invRecord.quantity : (product?.stock ?? 0);

                // 3. Tính toán tiền
                const itemTotal = item.unit_price * item.quantity;
                subtotal += itemTotal;

                cartContent += `
                    <div class="card mb-3">
                        <div class="card-body d-flex align-items-center gap-3">
                            <img src="${image}" width="90" height="90" class="rounded" style="object-fit: cover;">
                            <div class="flex-grow-1">
                                <h6 class="fw-semibold mb-1">${name}</h6>
                                <p class="small mb-1 text-muted">SKU: ${item.variant_id}</p>
                                <p class="small mb-1">Tồn kho: <strong class="${stock <= 0 ? 'text-danger' : 'text-success'}">${stock}</strong></p>
                                <div class="d-flex align-items-center gap-3">
                                    <strong class="text-danger">${item.unit_price.toLocaleString()} đ</strong>
                                    <div class="input-group input-group-sm" style="width:130px">
                                        <button class="btn btn-outline-secondary btn-minus"
                                            data-cart="${cart.id || cart.cartKey}"
                                            data-detail="${detailId}"
                                            data-qty="${item.quantity}">−</button>
                                        <input class="form-control text-center" value="${item.quantity}" readonly>
                                        <button class="btn btn-outline-secondary btn-plus"
                                            data-cart="${cart.id || cart.cartKey}"
                                            data-detail="${detailId}"
                                            data-qty="${item.quantity}"
                                            data-stock="${stock}">+</button>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-outline-danger btn-remove"
                                data-cart="${cart.id || cart.cartKey}"
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
        $("total").innerText = subtotal.toLocaleString() + "đ";

        // Sử dụng cartKey hoặc ID thống nhất để bind sự kiện
        const currentCartKey = cart?.id || cart?.cartKey;
        bindCartEvents(currentCartKey);
        bindCheckout(currentCartKey);

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
    `;
}



// Load giỏ hàng khi trang mở
await loadCartForUser();
