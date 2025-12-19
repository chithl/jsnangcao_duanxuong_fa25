import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";
import { ColorantsAPI } from "../../../api/ColorantsAPI.js";
import { ColorFormulasAPI } from "../../../api/ColorFormulasAPI.js";

const componentModule = new FormulaComponentAPI();
const colorantModule = new ColorantsAPI();
const formulaModule = new ColorFormulasAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-formula-component-form");

(async () => {
    try {
        const [colorantResp, formulaResp, componentResp] = await Promise.all([
            colorantModule.list(),
            formulaModule.list(),
            componentModule.getFormulaComponent(id)
        ]);

        if (formulaResp.success) {
            const select = document.getElementById("formula_id");
            formulaResp.data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = `${item.name}`;
                select.appendChild(opt);
            });
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

        if (componentResp.status === 200) {
            const data = componentResp.data;
            document.getElementById("id").value = id;
            document.getElementById("formula_id").value = data.formula_id;
            document.getElementById("colorant_id").value = data.colorant_id;
            document.getElementById("ml_per_L").value = data.ml_per_L;
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
        const response = await componentModule.updateFormulaComponent(id, data);
        if (response && response.status === 200) {
            alert("Cập nhật thành công!");
            window.location.href = "formula-components.html";
        }
    } catch (error) {
        console.error(error);
    }
});