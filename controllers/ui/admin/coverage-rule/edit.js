import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const ruleModule = new CoverageRuleAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-coverage-rule-form");

(async () => {
    try {
        const res = await ruleModule.getCoverageRule(id);
        if (res.status === 200) {
            const data = res.data;
            document.getElementById("id").value = id;
            document.getElementById("segment").value = data.segment;
            document.getElementById("surface_type").value = data.surface_type;
            document.getElementById("recommended_coats").value = data.recommended_coats;
            document.getElementById("wastage_pct").value = data.wastage_pct;
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        segment: document.getElementById("segment").value,
        surface_type: document.getElementById("surface_type").value,
        recommended_coats: parseInt(document.getElementById("recommended_coats").value),
        wastage_pct: parseFloat(document.getElementById("wastage_pct").value)
    };
    try {
        const response = await ruleModule.updateCoverageRule(id, data);
        if (response && response.status === 200) {
            alert("Cập nhật thành công!");
            window.location.href = "coverage-rules.html";
        }
    } catch (error) {
        console.error(error);
    }
});