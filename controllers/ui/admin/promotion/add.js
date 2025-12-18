import { PromotionAPI } from "../../../api/PromotionAPI.js";

const promotionModule = new PromotionAPI();
const form = document.getElementById("add-promotion-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        id: "promo_" + document.getElementById("code").value,
        code: document.getElementById("code").value,
        type: document.getElementById("type").value,
        value: parseFloat(document.getElementById("value").value),
        min_order: parseFloat(document.getElementById("min_order").value),
        usage_limit: parseInt(document.getElementById("usage_limit").value),
        used_count: 0,
        is_active: document.getElementById("is_active").checked ? 1 : 0,
        start_at: document.getElementById("start_at").value,
        end_at: document.getElementById("end_at").value
    };
    try {
        const response = await promotionModule.storePromotion(data);
        if (response && !response.error) {
            alert("Thêm chương trình khuyến mãi thành công!");
            window.location.href = "promotions.html";
        } else if (response && response.error) {
            alert("Lỗi: " + JSON.stringify(response.errors));
        }
    } catch (error) {
        console.error(error);
    }
});