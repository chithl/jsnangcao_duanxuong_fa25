import { BaseAPI } from "./BaseAPI.js";
import { PromotionValidate } from "./validate/PromotionValidate.js";

export class PromotionAPI extends BaseAPI {
    constructor(params, data) {
        var endpoint = 'promotions';
        super(endpoint, params, data);
        this.validator = new PromotionValidate(); // khởi tạo validator
    }

    async getAllPromotion() {
        let resp = await super.getAll();
        if (resp.status == 200) {
            return resp.data;
        } else {
            return "Lỗi không thể lấy dữ liệu"
        }
    }

    async getOnePromotion(id) {
        let resp = await super.getOne(id); // gọi BaseAPI
        if (resp.status != 200) {
            return "Không có giá trị với id là: " + id;
        }

        return resp.data;
    }

    /**
     * Tạo mới một khuyến mãi
     *
     * Trước khi gửi dữ liệu lên server, phương thức sẽ tự động kiểm tra hợp lệ:
     * - code: string, không được để trống
     * - type: string, không được để trống
     * - value: number >= 0, không được để trống
     * - min_order: number >= 0
     * - start_at: string hoặc Date hợp lệ
     * - end_at: string hoặc Date hợp lệ, phải sau start_at
     * - usage_limit: integer >= 0
     * - used_count: integer >= 0
     * - is_active: boolean
     *
     * @param {object} data - Dữ liệu khuyến mãi
     * @param {string} data.code
     * @param {string} data.type
     * @param {number} data.value
     * @param {number} [data.min_order]
     * @param {string|Date} data.start_at
     * @param {string|Date} data.end_at
     * @param {number} [data.usage_limit]
     * @param {number} [data.used_count]
     * @param {boolean} data.is_active
     * @returns {Promise<object>} Nếu lỗi validation trả về { error: true, errors }, nếu thành công trả về dữ liệu khuyến mãi
     */
    async storePromotion(data) {
        // Bắt lỗi dữ liệu trước khi gửi
        const { isError, errors } = this.validator.checkValidate(data);
        if (isError) {
            return { error: true, errors }; // trả về lỗi chi tiết
        }

        let resp = await super.store(data);
        if (resp.status != 200) {
            return "Không thể tạo khuyến mãi";
        }

        return resp.data;
    }

    /**
     * Cập nhật thông tin một khuyến mãi theo ID
     *
     * Trước khi gửi dữ liệu lên server, phương thức sẽ tự động kiểm tra hợp lệ:
     * - code: string, không được để trống
     * - type: string, không được để trống
     * - value: number >= 0, không được để trống
     * - min_order: number >= 0
     * - start_at: string hoặc Date hợp lệ
     * - end_at: string hoặc Date hợp lệ, phải sau start_at
     * - usage_limit: integer >= 0
     * - used_count: integer >= 0
     * - is_active: boolean
     *
     * @param {string|number} id - ID của khuyến mãi cần cập nhật
     * @param {object} data - Dữ liệu cập nhật
     * @param {string} data.code
     * @param {string} data.type
     * @param {number} data.value
     * @param {number} [data.min_order]
     * @param {string|Date} data.start_at
     * @param {string|Date} data.end_at
     * @param {number} [data.usage_limit]
     * @param {number} [data.used_count]
     * @param {boolean} data.is_active
     * @returns {Promise<object>} Nếu lỗi validation trả về { error: true, errors }, nếu thành công trả về dữ liệu khuyến mãi
     */
    async updatePromotion(id, data) {
        // Bắt lỗi dữ liệu trước khi cập nhật
        const { isError, errors } = this.validator.checkValidate(data);
        if (isError) {
            return { error: true, errors };
        }

        let resp = await super.update(id, data);
        if (resp.status != 200) {
            return "Không thể cập nhật promotion do dữ liệu truyền vào";
        }

        return resp.data;
    }

    /**
     * 
     * @param {string|number} id 
     * @returns {string} Nếu lỗi trả về message báo lỗi
     */
    async deletePromotion(id) {
        let resp = await super.delete(id);
        if (resp.status != 200) {
            return "Không thể xóa promotion với id là: " + id;
        }
        return resp.data;
    }
}
