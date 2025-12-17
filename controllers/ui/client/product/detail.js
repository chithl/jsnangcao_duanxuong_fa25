import { ProductAPI } from "../../../api/ProductAPI.js";
import { VariantAPI } from "../../../api/VariantAPI.js";

var productModule = new ProductAPI();
var variantModule = new VariantAPI();
var params = new URLSearchParams(window.location.search);
var productId = params.get("id");

const variantPriceEl = document.getElementById("variant-price");
const variantSkuEl = document.getElementById("variant-sku");
const variantInfoEl = document.getElementById("variant-info");
const addToCartBtn = document.getElementById("btn-add-to-cart");
const checkoutBtn = document.getElementById("btn-checkout");

(async () => {
    if (!productId) return;

    try {
        // Lấy dữ liệu sản phẩm và biến thể song song
        const [product, variantsData] = await Promise.all([
            productModule.getOneProduct(productId),
            variantModule.getVariantsByProduct(productId)
        ]);
        const normalizeVariants = data => {
            if (!data) return [];
            if (Array.isArray(data)) return data.filter(Boolean);

            const values = Object.values(data);
            const looksLikeVariantMap = values.some(
                value => value && typeof value === "object" && ("sku" in value || "size_L" in value || "price" in value)
            );

            if (looksLikeVariantMap) {
                return Object.entries(data)
                    .map(([key, value]) => (value && typeof value === "object" ? { id: key, ...value } : null))
                    .filter(Boolean);
            }

            return [data];
        };

        const variants = normalizeVariants(variantsData);
        console.log(variants);
        if (product) {
            // Đổ dữ liệu Product tĩnh
            document.getElementById("product-name").innerText = product.name;
            document.getElementById("product-brand").innerText = product.brand;
            document.getElementById("product-line").innerText = product.line;
            document.getElementById("product-finish").innerText = product.finish;
            document.getElementById("product-detail-img").src = product.images ? product.images[0] : "";

            // GỌI HÀM RENDER BIẾN THỂ
            renderVariantPickers(variants);
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
})();

function renderVariantPickers(variants) {
    const container = document.getElementById("variant-container");
    
    // Nếu mảng rỗng thì sẽ hiện dòng chữ như trong ảnh bạn gửi
    if (!variants || variants.length === 0) {
        container.innerHTML = "<em class='text-danger'>Sản phẩm hiện hết hàng (Không có biến thể)</em>";
        return;
    }

    // Render nút dựa trên trường size_L trong CSDL
    container.innerHTML = variants.map(v => `
        <button type="button" class="btn btn-outline-success btn-variant me-2"
                data-id="${v.id ?? ""}"
                data-price="${v.price ?? ""}"
                data-sku="${v.sku ?? ""}">
            ${v.size_L ?? "–"}L
        </button>
    `).join("");

    // Gán sự kiện click cho các nút mới tạo
    const buttons = container.querySelectorAll(".btn-variant");
    buttons.forEach(btn => {
        btn.onclick = function() {
            buttons.forEach(b => b.classList.remove("active", "btn-success"));
            buttons.forEach(b => b.classList.add("btn-outline-success"));
            
            this.classList.add("active", "btn-success");
            this.classList.remove("btn-outline-success");
            // Hiển thị giá và kích hoạt nút mua
            showVariantData(this.dataset);
        };
    });
}

const revealButton = button => {
	if (!button) return;
	button.disabled = false;
	button.classList.remove("d-none");
	button.hidden = false;
};

function showVariantData(data) {
	if (variantPriceEl) {
		variantPriceEl.innerText = data.price
			? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(data.price))
			: "Liên hệ";
	}
	if (variantSkuEl) {
		variantSkuEl.innerText = data.sku ?? "–";
	}
	if (variantInfoEl) {
		variantInfoEl.style.display = "block";
	}
	if (addToCartBtn) {
		addToCartBtn.disabled = false;
		if (data.id) addToCartBtn.dataset.variantId = data.id;
		if (data.sku) addToCartBtn.dataset.sku = data.sku;
		revealButton(addToCartBtn);
	}
	revealButton(checkoutBtn);
}