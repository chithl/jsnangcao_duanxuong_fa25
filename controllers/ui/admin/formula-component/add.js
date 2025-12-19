import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";
import { ColorantsAPI } from "../../../api/ColorantsAPI.js";
import { ColorFormulasAPI } from "../../../api/ColorFormulasAPI.js";

const componentModule = new FormulaComponentAPI();
const colorantModule = new ColorantsAPI();
const formulaModule = new ColorFormulasAPI();
const form = document.getElementById("add-formula-component-form");

(async () => {
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const formula_id = urlParams.get('formula_id');
        const formula_name = urlParams.get('formula_name');
        const formula_code = urlParams.get('formula_code');

        const [colorantResp, formulaResp] = await Promise.all([
            colorantModule.list(),
            formulaModule.list()
        ]);

        if (formulaResp.success) {
            const select = document.getElementById("formula_id");
            formulaResp.data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = `${item.code} - ${item.name}`;
                select.appendChild(opt);
            });
            
            // Pre-select formula if provided
            if (formula_id) {
                select.value = formula_id;
                select.disabled = true; // Lock the formula selection
            }
        }

        if (colorantResp.success) {
            const select = document.getElementById("colorant_id");
            colorantResp.data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = `${item.name}`;
                select.appendChild(opt);
            });
        }
        
        // Show info banner if coming from formula creation
        if (formula_id) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800';
            infoDiv.innerHTML = `
                <p class="text-sm text-blue-800 dark:text-blue-200">
                    <strong>📌 Thêm thành phần cho công thức:</strong> ${formula_name || formula_code || 'N/A'}
                </p>
            `;
            
            const formContainer = document.querySelector('#add-formula-component-form');
            if (formContainer) {
                formContainer.parentElement.insertBefore(infoDiv, formContainer);
            }
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        formula_id: document.getElementById("formula_id").value,
        colorant_id: document.getElementById("colorant_id").value,
        ml_per_L: parseFloat(document.getElementById("ml_per_L").value)
    };
    try {
        const response = await componentModule.createFormulaComponent(data);
        if (response && (response.status === 200 || response.status === 201)) {
            const addMore = confirm(
                "Thêm thành phần thành công!\n\nBạn có muốn thêm thành phần khác cho công thức này không?"
            );
            
            if (addMore) {
                // Keep formula_id in URL and reset form
                const formulaId = data.formula_id;
                const urlParams = new URLSearchParams(window.location.search);
                const formula_name = urlParams.get('formula_name');
                const formula_code = urlParams.get('formula_code');
                
                const params = new URLSearchParams({
                    formula_id: formulaId,
                    formula_name: formula_name || '',
                    formula_code: formula_code || ''
                });
                window.location.href = `add-formula-component.html?${params.toString()}`;
            } else {
                window.location.href = "formula-components.html";
            }
        }
    } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi thêm thành phần!");
    }
});