import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";

var formulaComponentModule = new FormulaComponentAPI();
var params = new URLSearchParams(window.location.search);
var id = params.get("id"); 
var form = document.getElementById("edit-formula-component");

(async () => {
    var res = await formulaComponentModule.getFormulaComponent(id);
    if (res.status === 200) {
        var { formula_id, colorant_id, ml_per_L } = res.data;
        document.getElementById("id").value = id;
        document.getElementById("formula_id").value = formula_id;
        document.getElementById("colorant_id").value = colorant_id;
        document.getElementById("ml_per_L").value = ml_per_L;
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    var formulaIdValue = document.getElementById("formula_id").value;
    var colorantIdValue = document.getElementById("colorant_id").value;
    var mlPerLValue = document.getElementById("ml_per_L").value;
    var data = {
        formula_id: formulaIdValue,
        colorant_id: colorantIdValue,
        ml_per_L: mlPerLValue
    };
    try {
        var response = await formulaComponentModule.updateFormulaComponent(id, data); 
        if (response && response.status === 200) {
            alert("Chỉnh sửa thành phần công thức thành công!");
            window.location.href = "formula-components.html"; 
        }
    } catch (error) {
        console.error(error);
    }
});