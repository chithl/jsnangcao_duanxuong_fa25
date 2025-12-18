import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";
import { ColorantsAPI } from "../../../api/ColorantsAPI.js";
import { ColorFormulasAPI } from "../../../api/ColorFormulasAPI.js";

const componentModule = new FormulaComponentAPI();
const colorantModule = new ColorantsAPI();
const formulaModule = new ColorFormulasAPI();

async function loadComponents() {
    try {
        const [componentResp, colorantResp, formulaResp] = await Promise.all([
            componentModule.getAllFormulaComponents(),
            colorantModule.list(),
            formulaModule.list()
        ]);

        const components = componentResp || [];
        const colorants = colorantResp.success ? colorantResp.data : [];
        const formulas = formulaResp.success ? formulaResp.data : [];

        let content = '';
        console.log("Components:", components)
        components.forEach(item => {
            const colorant = colorants.find(c => c.id === item.colorant_id);
            const colorantLabel = colorant ? `${colorant.code} - ${colorant.name}` : item.colorant_id;

            const formula = formulas.find(f => f.id === item.formula_id);
            const formulaLabel = formula ? `${formula.code} - ${formula.name}` : item.formula_id;

            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.id}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${formulaLabel}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${colorantLabel}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.ml_per_L}</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-3">
                        <a href="edit-formula-component.html?id=${item.id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                        <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${item.id}">Xóa</button>
                    </div>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('formula-component-list');
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
            if (confirm(`Xóa thành phần này?`)) {
                try {
                    await componentModule.deleteFormulaComponent(id);
                    alert("Xóa thành công!");
                    loadComponents();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => { await loadComponents(); })();