import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

const ruleModule = new CoverageRuleAPI();

async function loadRules() {
    try {
        const rules = await ruleModule.getAllCoverageRules();
        let content = '';

        rules.forEach(item => {
            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.id}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.segment}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.surface_type}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.recommended_coats}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.wastage_pct}%</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-3">
                        <a href="edit-coverage-rule.html?id=${item.id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                        <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${item.id}">Xóa</button>
                    </div>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('coverage-rule-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        }
    } catch (error) {
        console.error(error);
    }
}

function addDeleteListeners() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm(`Xóa quy tắc này?`)) {
                try {
                    await ruleModule.deleteCoverageRule(id);
                    alert("Xóa thành công!");
                    loadRules();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => { await loadRules(); })();