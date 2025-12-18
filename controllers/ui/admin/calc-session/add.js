import { CalcSessionAPI } from "../../../api/CalcSessionAPI.js";
import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const calcModule = new CalcSessionAPI();
const surfaceModule = new SurfacesAPI();
const ruleModule = new CoverageRuleAPI();
const form = document.getElementById("add-calc-session-form");

(async () => {
    try {
        const [surfResp, ruleResp] = await Promise.all([
            surfaceModule.getAllSurfaces(),
            ruleModule.getAllCoverageRules()
        ]);

        const surfSelect = document.getElementById("surface_id");
        if (surfResp) {
            Object.keys(surfResp).forEach(id => {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = `${surfResp[id].surface_type} (${surfResp[id].area_m2}m2)`;
                surfSelect.appendChild(opt);
            });
        }

        const ruleSelect = document.getElementById("coverage_rule_id");
        if (Array.isArray(ruleResp)) {
            ruleResp.forEach(rule => {
                const opt = document.createElement("option");
                opt.value = rule.id;
                opt.textContent = `${rule.segment} - ${rule.surface_type}`;
                ruleSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        surface_id: document.getElementById("surface_id").value,
        coverage_rule_id: document.getElementById("coverage_rule_id").value,
        coats: parseInt(document.getElementById("coats").value),
        cover_m2_per_L: parseFloat(document.getElementById("cover_m2_per_L").value),
        wastage_pct: parseFloat(document.getElementById("wastage_pct").value),
        litres_needed: parseFloat(document.getElementById("litres_needed").value),
        suggestion: document.getElementById("suggestion").value
    };
    try {
        const res = await calcModule.storeCalcSession(data);
        if (res.success) {
            alert("Thêm lịch sử tính toán thành công!");
            window.location.href = "calc-sessions.html";
        }
    } catch (error) {
        console.error(error);
    }
});