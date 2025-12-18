import { ValidateAPI } from "./validate";

export class FormulaComponentValidate extends ValidateAPI {
    checkValidate(data, mode = "create") {
        let errors = [];
        const isPatch = mode === "patch";
        const shouldCheck = (field) => !isPatch || field in data;

        // Kiểm tra formula_id
        if (shouldCheck("formula_id")) {
        if (!data.formula_id || data.formula_id.toString().trim() === "") {
            errors.push({
            field: "formula_id",
            message: "Mã công thức không được để trống",
            });
        }
        }

        // Kiểm tra colorant_id
        if (shouldCheck("colorant_id")) {
        if (!data.colorant_id || data.colorant_id.toString().trim() === "") {
            errors.push({
            field: "colorant_id",
            message: "Mã chất tạo màu không được để trống",
            });
        }
        }

        // Kiểm tra ml_per_L (phải là số và lớn hơn 0)
        if (shouldCheck("ml_per_L")) {
        const ml = Number(data.ml_per_L);
        if (!Number.isFinite(ml) || ml <= 0) {
            errors.push({
            field: "ml_per_L",
            message: "Dung tích (ml/L) phải là số lớn hơn 0",
            });
        }
        }

        return {
        isValid: errors.length === 0,
        errors,
        };
    }
}