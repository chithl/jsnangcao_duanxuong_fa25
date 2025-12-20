import { CartAPI } from "../../api/CartAPI.js";
import { ProductAPI } from "../../api/ProductAPI.js";
import { PromotionAPI } from "../../api/PromotionAPI.js";
import { AddressesAPI } from "../../api/AddressesAPI.js";

let promotionAPI = new PromotionAPI();
let addressesAPI = new AddressesAPI();

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
 * Load danh sách địa chỉ của user
 */
async function loadUserAddresses() {
    const userId = $("user_id").value;
    if (!userId) return;

    try {
        const addresses = await addressesAPI.getAddressesByUser(userId);
        const selectContainer = $("address_select_container");
        const inputContainer = $("address_input_container");
        const addressSelect = $("address");

        if (addresses && addresses.length > 0) {
            selectContainer.style.display = "block";
            inputContainer.style.display = "none";

            addressSelect.setAttribute("required", "true");

            addressSelect.innerHTML = '<option value="">-- Chọn địa chỉ --</option>';

            let defaultAddr = addresses.find(a => a.is_default) || addresses[0];
            addresses.forEach(addr => {
                const option = document.createElement("option");
                const addrString = [addr.line1, addr.city].filter(Boolean).join(", ");
                option.value = addrString; // dùng chuỗi địa chỉ làm value
                option.textContent = [
                    addr.receiver_name || "Người nhận",
                    addr.line1,
                    addr.ward,
                    addr.city
                ].filter(Boolean).join(" - ");
                option.dataset.addressId = addr.id; // lưu id nếu cần dùng
                option.dataset.addressData = JSON.stringify(addr);
                addressSelect.appendChild(option);
            });

            if (defaultAddr) {
                const defaultString = [defaultAddr.line1, defaultAddr.city].filter(Boolean).join(", ");
                addressSelect.value = defaultString;
            }
        } else {
            selectContainer.style.display = "none";
            inputContainer.style.display = "block";
            addressSelect.removeAttribute("required");
            $("selected_address").value = "";
        }
    } catch (error) {
        console.error("Lỗi khi load danh sách địa chỉ:", error);
    }
}

/**
 * Xử lý khi chọn địa chỉ từ select
 */
document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "address") {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption && selectedOption.value) {
            console.log("Địa chỉ được chọn:", selectedOption.value);
        }
    }
});

/**
 * Xử lý khi nhấn nút "Thêm mới" 
 */
document.addEventListener("click", function(e) {
    if (e.target && e.target.id === "add_new_address_btn") {
        const selectContainer = $("address_select_container");
        const inputContainer = $("address_input_container");
        const addressSelect = $("address");
        
        selectContainer.style.display = "none";
        inputContainer.style.display = "block";
        
        addressSelect.removeAttribute("required");

        $("selected_address").value = "";

        ["address_line1", "address_ward", "address_city", "address_note"].forEach(id => {
            const el = $(id);
            if (el) el.value = "";
        });
        const line1 = $("address_line1");
        if (line1) line1.focus();
    }
});

/**
 * Xử lý khi nhấn nút "Hủy"
 */
 document.addEventListener("click", function(e) {
     if (e.target && e.target.id === "cancel_new_address_btn") {
         const selectContainer = $("address_select_container");
         const inputContainer = $("address_input_container");
         const addressSelect = $("address");

         // Clear tất cả input fields
         $("address_line1").value = "";
         $("address_ward").value = "";
         $("address_city").value = "";
         $("address_note").value = "";
         $("address_is_default").checked = false;
         $("address_error").innerText = "";

         // Quay lại hiển thị select nếu có địa chỉ lưu sẵn
         const addresses = addressSelect ? addressSelect.querySelectorAll('option') : [];
         if (addresses.length > 1) {
             selectContainer.style.display = "block";
             inputContainer.style.display = "none";
             addressSelect.setAttribute("required", "true");

         }
     }
 });

/**
 * Xử lý khi nhấn "Lưu địa chỉ"
 */
document.addEventListener("click", async function(e) {
    if (e.target && e.target.id === "save_new_address_btn") {
        const userId = $("user_id").value;
        const fullname = $("fullname").value.trim();
        const phone = $("phone").value.trim();
        const line1 = $("address_line1").value.trim();
        const ward = $("address_ward").value.trim();
        const city = $("address_city").value.trim();
        const note = $("address_note").value.trim();
        const isDefault = $("address_is_default").checked;

        $("address_line1_error").innerText = "";
        $("address_ward_error").innerText = "";
        $("address_city_error").innerText = "";
        $("address_error").innerText = "";

        if (!line1) {
            $("address_line1_error").innerText = "Vui lòng nhập số nhà, đường";
            return;
        }

        if (!ward) {
            $("address_ward_error").innerText = "Vui lòng nhập phường/xã";
            return;
        }

        if (!city) {
            $("address_city_error").innerText = "Vui lòng nhập quận/huyện, tỉnh/thành";
            return;
        }

        if (!fullname) {
            $("fullname_error").innerText = "Vui lòng nhập họ và tên";
            return;
        }

        if (!phone) {
            $("phone_error").innerText = "Vui lòng nhập số điện thoại";
            return;
        }

        try {
            const newAddressData = {
                user_id: userId,
                receiver_name: fullname,
                phone: phone,
                line1: line1,
                ward: ward,
                city: city,
                note: note,
                is_default: isDefault
            };

            const result = await addressesAPI.createAddress(newAddressData);
            
            if (result.success) {
                $("address_line1_error").innerText = "";
                $("address_ward_error").innerText = "";
                $("address_city_error").innerText = "";
                $("address_error").innerText = "";
                alert("Lưu địa chỉ thành công!");
                $("address_line1").value = "";
                $("address_ward").value = "";
                $("address_city").value = "";
                $("address_note").value = "";
                $("address_is_default").checked = false;
                // Reload danh sách địa chỉ
                await loadUserAddresses();
                
                // Chọn địa chỉ mới vào select nếu có
                const addressSelect = $("address");
                if (addressSelect && addressSelect.options) {
                    const newString = [result.data.line1, result.data.ward, result.data.city].filter(Boolean).join(", ");
                    for (let i = 0; i < addressSelect.options.length; i++) {
                        if (addressSelect.options[i].value === newString) {
                            addressSelect.value = newString;
                            break;
                        }
                    }
                }
            } else {
                $("address_error").innerText = result.errors?.[0]?.message || "Lỗi khi lưu địa chỉ";
            }
        } catch (error) {
            console.error("Lỗi khi lưu địa chỉ:", error);
            $("address_error").innerText = "Lỗi khi lưu địa chỉ";
        }
    }
});

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

/**
 * Xử lý submit form checkout
 */
document.querySelector("#checkout-form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const addressValue = $("address")?.value || "";
    const line1 = $("address_line1")?.value.trim();
    const ward = $("address_ward")?.value.trim();
    const city = $("address_city")?.value.trim();

    if (!addressValue && !(line1 || ward || city)) {
        alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
        return;
    }

    // Nếu đang nhập địa chỉ mới mà chưa lưu, ngăn submit
    if (!addressValue && (line1 || ward || city)) {
        alert("Vui lòng bấm 'Lưu địa chỉ' trước khi thanh toán");
        return;
    }

    this.submit();
});

await loadCartForUser();
await loadUserAddresses();
