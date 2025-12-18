/**
 * Lớp kiểm tra tính hợp lệ cho Quy tắc định mức (Coverage Rules)
 */
export class CoverageRuleValidate {
    /**
     * Kiểm tra dữ liệu quy tắc định mức
     * @param {object} data - Dữ liệu cần kiểm tra
     * @returns {object} { isError: boolean, errors: object }
     */
    checkValidate(data) {
        let errors = {};
        let isError = false;

        if (!data.segment || data.segment.trim() === "") {
            errors.segment = "Phân khúc không được để trống";
            isError = true;
        }

        if (!data.surface_type || data.surface_type.trim() === "") {
            errors.surface_type = "Loại bề mặt không được để trống";
            isError = true;
        }

        if (data.recommended_coats === undefined || data.recommended_coats === "") {
            errors.recommended_coats = "Số lớp đề xuất không được để trống";
            isError = true;
        } else if (isNaN(data.recommended_coats) || parseInt(data.recommended_coats) <= 0) {
            errors.recommended_coats = "Số lớp đề xuất phải là số nguyên dương";
            isError = true;
        }

        if (data.wastage_pct === undefined || data.wastage_pct === "") {
            errors.wastage_pct = "Hệ số hao hụt không được để trống";
            isError = true;
        } else if (isNaN(data.wastage_pct) || parseFloat(data.wastage_pct) < 0) {
            errors.wastage_pct = "Hệ số hao hụt phải là số không âm";
            isError = true;
        }

        return { isError, errors };
    }
}