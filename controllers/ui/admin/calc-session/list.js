import { CalcSessionAPI } from "../../../api/CalcSessionAPI.js";
import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const calcModule = new CalcSessionAPI();
const surfaceModule = new SurfacesAPI();
const ruleModule = new CoverageRuleAPI();

async function loadCalcSessions() {
    try {
        const [sessionResp, surfaceData, ruleData] = await Promise.all([
            calcModule.getAllCalcSessions(),
            surfaceModule.getAllSurfaces(),
            ruleModule.getAllCoverageRules()
        ]);

        const sessions = sessionResp.success ? sessionResp.data : [];
        const surfaces = surfaceData || {};
        const rules = Array.isArray(ruleData) ? ruleData.reduce((acc, r) => ({...acc, [r.id]: r}), {}) : {};
        
        let content = '';
        sessions.forEach(item => {
            const surface = surfaces[item.surface_id];
            const surfaceLabel = surface ? `${surface.surface_type} (${surface.area_m2}m2)` : item.surface_id;
            
            const rule = rules[item.coverage_rule_id];
            const ruleLabel = rule ? `${rule.segment} - ${rule.surface_type}` : item.coverage_rule_id;

            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">${surfaceLabel}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${ruleLabel}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-brand-500 font-semibold text-theme-sm">${item.litres_needed} L</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.coats} lớp</p>
                    <p class="text-gray-500 text-theme-xs dark:text-gray-400">Định mức: ${item.cover_m2_per_L} | Hao hụt: ${item.wastage_pct}%</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-3">
                        <a href="edit-calc-session.html?id=${item.id}" class="text-blue-light-500 hover:underline text-sm font-medium">Sửa</a>
                        <button class="btn-delete text-error-600 hover:underline text-sm font-medium" data-id="${item.id}">Xóa</button>
                    </div>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('calc-session-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        }
    } catch (error) {
        console.error(error);
    }
}

function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const idToDelete = e.target.getAttribute('data-id');
            if (confirm(`Bạn có chắc chắn muốn xóa phiên tính toán này không?`)) {
                try {
                    await calcModule.deleteCalcSession(idToDelete);
                    alert("Xóa thành công!");
                    loadCalcSessions();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadCalcSessions();
})();