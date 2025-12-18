import { BaseAPI } from "./BaseAPI.js";

/**
 * Lớp API cho quản lý danh mục (categories)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * @extends BaseAPI
 */
export class CategoryAPI extends BaseAPI {
    /**
     * Khởi tạo CategoryAPI
     * @param {object} [params] - Tham số truy vấn mặc định
     * @param {object} [data] - Dữ liệu mặc định
     */
    constructor(params, data) {
        var endpoint = 'categories';
        super(endpoint, params, data);
    }

    /**
     * Lấy tất cả danh mục
     * @returns {Promise<Array|any>} Mảng các danh mục hoặc lỗi
     */
    async getAllCategory() {
        let resp = await this.getAll();
        return resp.data;
    }

    /**
     * Lấy thông tin một danh mục theo ID
     * @param {string|number} id - ID của danh mục cần lấy
     * @returns {Promise<object|any>} Đối tượng danh mục hoặc lỗi
     */
    async getOneCategory(id) {
        let resp = await this.getOne(id);
        console.log(resp.data);

        return resp.data;
    }

    /**
     * Tạo mới một danh mục
     * @param {object} data - Dữ liệu danh mục cần tạo
     * @returns {Promise<object|any>} Danh mục vừa tạo hoặc lỗi
     */
    async storeCategory(data) {
        let resp = await this.store(data);
        return resp.data;
    }

    /**
     * Cập nhật thông tin danh mục theo ID
     * @param {string|number} id - ID của danh mục cần cập nhật
     * @param {object} data - Dữ liệu cập nhật
     * @returns {Promise<object|any>} Danh mục đã cập nhật hoặc lỗi
     */
    async updateCategory(id, data) {
        let resp = await this.update(id, data);
        return resp.data;
    }

    /**
 * Cập nhật nhanh 1 hoặc vài field (PATCH)
 * @param {string|number} id
 * @param {object} data
 * @returns {Promise<object|any>}
 */
    async patchCategory(id, data) {
        let resp = await this.patch(id, data);
        return resp.data;
    }

    /**
     * Xóa danh mục theo ID
     * @param {string|number} id - ID của danh mục cần xóa
     * @returns {Promise<object|any>} Kết quả xóa hoặc lỗi
     */
    async deleteCategory(id) {
        let resp = await this.delete(id);
        return resp.data;
    }

    // ======== check trùng ========== //

    async checkDuplicateName(name, excludeId = null) {
        let params = { name };
        if (excludeId) params.exclude_id = excludeId;

        let resp = await this.getAll(params);
        return resp.data.length > 0;
    }

    // ======= Lọc ========== //

    async imporCategory(formData) {
        let resp = await this.post("import", formData);
        return resp.data;
    }

    /**
     * Export sản phẩm ra CSV / JSON
     * @param {object} params
     * @returns {Promise<object|any>}
     */
    async exportCategory(params = {}) {
        let resp = await this.post("export", params);
        return resp.data;
    }

}
