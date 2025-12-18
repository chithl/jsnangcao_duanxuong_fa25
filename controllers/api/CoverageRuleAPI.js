import { BaseAPI } from "./BaseAPI.js";
import { CoverageRuleValidate } from "./validate/CoverageRuleValidate.js";

/**
 * Lớp API cho quản lý quy tắc định mức (coverage_rules)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 * @extends BaseAPI
 */
export class CoverageRuleAPI extends BaseAPI {
    constructor(params, data) {
        const endpoint = "coverage_rules";
        super(endpoint, params, data);
        this.validator = new CoverageRuleValidate();
    }

    /**
     * Lấy tất cả quy tắc định mức
     * Chuyển đổi dữ liệu Firebase từ Object sang Array kèm ID
     */
    async getAllCoverageRules() {
        let resp = await super.getAll();
        if (resp.status === 200 && resp.data) {
            return Object.keys(resp.data).map((id) => ({
                id,
                ...resp.data[id],
            }));
        }
        return [];
    }

    /**
     * Lấy chi tiết một quy tắc theo ID
     */
    async getCoverageRule(id) {
        let resp = await super.getOne(id);
        if (resp.status === 200) {
            return resp;
        }
        return { status: 404, message: "Không tìm thấy quy tắc" };
    }

    /**
     * Tạo mới quy tắc định mức
     */
    async createCoverageRule(data) {
        // Ép kiểu dữ liệu trước khi gửi lên Firebase
        const payload = {
            segment: data.segment,
            surface_type: data.surface_type,
            recommended_coats: parseInt(data.recommended_coats),
            wastage_pct: parseFloat(data.wastage_pct),
            created_at: new Date().toISOString()
        };

        const { isError, errors } = this.validator.checkValidate(payload);
        if (isError) {
            return { error: true, errors };
        }

        return await super.store(payload);
    }

    /**
     * Cập nhật quy tắc định mức
     */
    async updateCoverageRule(id, data) {
        if (!id) return { status: 400, message: "Thiếu ID quy tắc" };

        const payload = {
            segment: data.segment,
            surface_type: data.surface_type,
            recommended_coats: parseInt(data.recommended_coats),
            wastage_pct: parseFloat(data.wastage_pct),
            updated_at: new Date().toISOString()
        };

        const { isError, errors } = this.validator.checkValidate(payload);
        if (isError) {
            return { error: true, errors };
        }

        return await super.update(id, payload);
    }

    /**
     * Xóa quy tắc định mức
     */
    async deleteCoverageRule(id) {
        if (!id) return { status: 400, message: "Thiếu ID quy tắc" };
        return await super.delete(id);
    }
}