import { ValidateAPI } from "./validate.js";

export class PromotionValidate extends ValidateAPI {
    checkValidate(data) {
        let errors = {};

        // Kiểm tra code
        if (!data.code || data.code.trim() === "") {
            errors.code = "Code không được để trống";
        }

        // Kiểm tra type
        if (!data.type || data.type.trim() === "") {
            errors.type = "Type không được để trống";
        }

        // Kiểm tra value
        if (data.value == null || data.value === "") {
            errors.value = "Value không được để trống";
        } else if (isNaN(data.value) || Number(data.value) < 0) {
            errors.value = "Value phải là số >= 0";
        }

        // Kiểm tra min_order
        if (data.min_order == null || data.min_order === "") {
            errors.min_order = "Min order không được để trống";
        } else if (isNaN(data.min_order) || Number(data.min_order) < 0) {
            errors.min_order = "Min order phải là số >= 0";
        }

        // Kiểm tra start_at
        if (!data.start_at || isNaN(Date.parse(data.start_at))) {
            errors.start_at = "Start_at phải là ngày hợp lệ";
        }

        // Kiểm tra end_at
        if (!data.end_at || isNaN(Date.parse(data.end_at))) {
            errors.end_at = "End_at phải là ngày hợp lệ";
        } else if (data.start_at && Date.parse(data.start_at) > Date.parse(data.end_at)) {
            errors.end_at = "End_at phải sau start_at";
        }

        // Kiểm tra usage_limit
        if (data.usage_limit == null || data.usage_limit === "") {
            errors.usage_limit = "Usage limit không được để trống";
        } else if (!Number.isInteger(Number(data.usage_limit)) || Number(data.usage_limit) < 0) {
            errors.usage_limit = "Usage limit phải là số nguyên >= 0";
        }

        // Kiểm tra used_count
        if (data.used_count == null || data.used_count === "") {
            errors.used_count = "Used count không được để trống";
        } else if (!Number.isInteger(Number(data.used_count)) || Number(data.used_count) < 0) {
            errors.used_count = "Used count phải là số nguyên >= 0";
        }

        // Kiểm tra is_active
        if (typeof data.is_active !== "boolean") {
            errors.is_active = "Is_active phải là boolean";
        }

        const isError = Object.keys(errors).length > 0;
        return { isError, errors };
    }
}

