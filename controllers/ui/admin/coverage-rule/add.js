import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const ruleModule = new CoverageRuleAPI();
const form = document.getElementById("add-coverage-rule-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        segment: document.getElementById("segment").value,
        surface_type: document.getElementById("surface_type").value,
        recommended_coats: parseInt(document.getElementById("recommended_coats").value),
        wastage_pct: parseFloat(document.getElementById("wastage_pct").value)
    };
    try {
        const response = await ruleModule.createCoverageRule(data);
        if (response && (response.status === 200 || response.status === 201)) {
            alert("Thêm thành công!");
            window.location.href = "coverage-rules.html";
        }
    } catch (error) {
        console.error(error);
    }
});