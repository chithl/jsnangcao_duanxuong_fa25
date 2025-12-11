import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

var coverageRuleModule = new CoverageRuleAPI();
var params = new URLSearchParams(window.location.search);
var id = params.get("id");
var form = document.getElementById("edit-coverage-rule");

(async () => {
    var res = await coverageRuleModule.getCoverageRule(id);
    if (res.status === 200) {
        var { segment, surface_type, recommended_coats, wastage_pct } = res.data;
        document.getElementById("id").value = id;
        document.getElementById("segment").value = segment;
        document.getElementById("surface_type").value = surface_type;
        document.getElementById("recommended_coats").value = recommended_coats;
        document.getElementById("wastage_pct").value = wastage_pct;
    }
})();

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
        var response = await coverageRuleModule.updateCoverageRule(id, data); 
        if (response && response.status === 200) {
            alert("Chỉnh sửa quy tắc định mức thành công!");
            window.location.href = "coverage-rules.html"; 
        }
    } catch (error) {
        console.error(error);
    }
});