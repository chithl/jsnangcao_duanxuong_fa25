import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";
import { ColorantsAPI } from "../../../api/ColorantsAPI.js";
import { ColorFormulasAPI } from "../../../api/ColorFormulasAPI.js";

const componentModule = new FormulaComponentAPI();
const colorantModule = new ColorantsAPI();
const formulaModule = new ColorFormulasAPI();
const form = document.getElementById("add-formula-component-form");

(async () => {
    try {
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
        }

        if (colorantResp.success) {
            const select = document.getElementById("colorant_id");
            colorantResp.data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = `${item.code} - ${item.name}`;
                select.appendChild(opt);
            });
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
            alert("Thêm thành công!");
            window.location.href = "formula-components.html";
        }
    } catch (error) {
        console.error(error);
    }
});