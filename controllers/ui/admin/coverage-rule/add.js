import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

var coverageRuleModule = new CoverageRuleAPI();
var form = document.getElementById("add-coverage-rule");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    var segmentValue = document.getElementById("segment").value;
    var surfaceTypeValue = document.getElementById("surface_type").value;
    var recommendedCoatsValue = document.getElementById("recommended_coats").value;
    var wastagePctValue = document.getElementById("wastage_pct").value;
    var data = {
        segment: segmentValue,
        surface_type: surfaceTypeValue,
        recommended_coats: recommendedCoatsValue,
        wastage_pct: wastagePctValue
    };
    try {
        var response = await coverageRuleModule.createCoverageRule(data);
        if (response && response.status === 201) {
            alert("Thêm quy tắc định mức thành công!");
            window.location.href = "coverage-rules.html"; 
        }
    } catch (error) {
        console.error(error);
    }
});