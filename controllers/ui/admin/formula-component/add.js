import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";

var formulaComponentModule = new FormulaComponentAPI();
var form = document.getElementById("add-formula-component");

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
        var response = await formulaComponentModule.createFormulaComponent(data);
        if (response && response.status === 201) {
            alert("Thêm thành phần công thức thành công!");
            window.location.href = "formula-components.html"; 
        }
    } catch (error) {
        console.error("Lỗi kết nối hoặc xử lý:", error);
    }
});