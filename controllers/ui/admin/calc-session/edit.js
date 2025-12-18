import { CalcSessionAPI } from "../../../api/CalcSessionAPI.js";
import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const calcModule = new CalcSessionAPI();
const surfaceModule = new SurfacesAPI();
const ruleModule = new CoverageRuleAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-calc-session-form");

(async () => {
    try {
        const [surfResp, ruleResp, sessionResp] = await Promise.all([
            surfaceModule.getAllSurfaces(),
            ruleModule.getAllCoverageRules(),
            calcModule.getOneCalcSession(id)
        ]);

        const surfSelect = document.getElementById("surface_id");
        if (surfResp) {
            Object.keys(surfResp).forEach(sid => {
                const opt = document.createElement("option");
                opt.value = sid;
                opt.textContent = `${surfResp[sid].surface_type} (${surfResp[sid].area_m2}m2)`;
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

        if (sessionResp.success) {
            const d = sessionResp.data;
            document.getElementById("id").value = id;
            document.getElementById("surface_id").value = d.surface_id;
            document.getElementById("coverage_rule_id").value = d.coverage_rule_id;
            document.getElementById("coats").value = d.coats;
            document.getElementById("cover_m2_per_L").value = d.cover_m2_per_L;
            document.getElementById("wastage_pct").value = d.wastage_pct;
            document.getElementById("litres_needed").value = d.litres_needed;
            document.getElementById("suggestion").value = d.suggestion || "";
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
        const res = await calcModule.updateCalcSession(id, data);
        if (res.success) {
            alert("Cập nhật thành công!");
            window.location.href = "calc-sessions.html";
        }
    } catch (error) {
        console.error(error);
    }
});