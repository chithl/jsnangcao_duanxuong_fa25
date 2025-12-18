import { BaseAPI } from "./BaseAPI.js";
import { FormulaComponentValidate } from "./validate/FormulaComponentValidate.js";

/**
 * Lớp API cho quản lý thành phần công thức (formula_components)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 */
export class FormulaComponentAPI extends BaseAPI {
    constructor(params, data) {
        var endpoint = "formula_components";
        super(endpoint, params, data);
        this.validator = new FormulaComponentValidate();
    }

    /**
     * Lấy tất cả thành phần công thức
     * Chuyển đổi dữ liệu Firebase từ Object sang Array kèm ID để hiển thị trong list.js
     */
    async getAllFormulaComponents() {
        let resp = await this.getAll();
        if (resp.status === 200 && resp.data) {
        return Object.keys(resp.data).map((id) => ({
            id,
            ...resp.data[id],
        }));
        }
        return [];
    }

    /**
     * Lấy chi tiết một thành phần công thức theo ID
     */
    async getFormulaComponent(id) {
        let resp = await this.getOne(id);
        return resp; // Trả về nguyên response để edit.js xử lý res.status và res.data
    }

    /**
     * Tạo mới một thành phần công thức
     */
    async createFormulaComponent(data) {
        // Ép kiểu dữ liệu trước khi validate và lưu
        const payload = {
        formula_id: data.formula_id,
        colorant_id: data.colorant_id,
        ml_per_L: parseFloat(data.ml_per_L)
        };

        const validation = this.validator.checkValidate(payload);
        if (!validation.isValid) {
        return { error: true, errors: validation.errors };
        }

        let resp = await this.store(payload);
        return resp; // Trả về response để add.js kiểm tra status 201
    }

    /**
     * Cập nhật thành phần công thức theo ID
     */
    async updateFormulaComponent(id, data) {
        const payload = {
        formula_id: data.formula_id,
        colorant_id: data.colorant_id,
        ml_per_L: parseFloat(data.ml_per_L)
        };

        const validation = this.validator.checkValidate(payload);
        if (!validation.isValid) {
        return { error: true, errors: validation.errors };
        }

        let resp = await this.update(id, payload);
        return resp; // Trả về response để edit.js kiểm tra status 200
    }

    /**
     * Xóa thành phần công thức theo ID
     */
    async deleteFormulaComponent(id) {
        const resp = await this.delete(id);
        return resp;
    }
}