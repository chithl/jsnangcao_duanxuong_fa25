import { PromotionAPI } from "../../../api/PromotionAPI.js";

const promotionModule = new PromotionAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-promotion-form");

(async () => {
    try {
        const data = await promotionModule.getOnePromotion(id);
        if (data && typeof data !== 'string') {
            document.getElementById("id").value = id;
            document.getElementById("code").value = data.code;
            document.getElementById("type").value = data.type;
            document.getElementById("value").value = data.value;
            document.getElementById("min_order").value = data.min_order;
            document.getElementById("usage_limit").value = data.usage_limit;
            document.getElementById("start_at").value = data.start_at || "";
            document.getElementById("end_at").value = data.end_at || "";
            document.getElementById("is_active").checked = data.is_active === 1;
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        code: document.getElementById("code").value,
        type: document.getElementById("type").value,
        value: parseFloat(document.getElementById("value").value),
        min_order: parseFloat(document.getElementById("min_order").value),
        usage_limit: parseInt(document.getElementById("usage_limit").value),
        is_active: document.getElementById("is_active").checked ? 1 : 0,
        start_at: document.getElementById("start_at").value,
        end_at: document.getElementById("end_at").value
    };
    try {
        const response = await promotionModule.updatePromotion(id, data);
        if (response && !response.error) {
            alert("Cập nhật khuyến mãi thành công!");
            window.location.href = "promotions.html";
        } else if (response && response.error) {
            alert("Lỗi cập nhật: " + JSON.stringify(response.errors));
        }
    } catch (error) {
        console.error(error);
    }
});