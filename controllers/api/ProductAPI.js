import { BaseAPI } from "./BaseAPI.js";


/**
 * Lớp API cho quản lý sản phẩm (products)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * @extends BaseAPI
 */
export class ProductAPI extends BaseAPI {
    /**
     * Khởi tạo ProductAPI
     * @param {object} [params] - Tham số truy vấn mặc định
     * @param {object} [data] - Dữ liệu mặc định
     */
    constructor(params, data) {
        var endpoint = 'products';
        super(endpoint, params, data);
    }

    /**
     * Lấy tất cả sản phẩm
     * @returns {Promise<Array|any>} Mảng các sản phẩm hoặc lỗi
     */
    async getAllProduct() {
        let resp = await this.getAll();
        return resp.data;
    }

    /**
     * Lấy thông tin một sản phẩm theo ID
     * @param {string|number} id - ID của sản phẩm cần lấy
     * @returns {Promise<object|any>} Đối tượng sản phẩm hoặc lỗi
     */
    async getOneProduct(id) {
        let resp = await this.getOne(id);
        return resp.data;
    }

    /**
     * Tạo mới một sản phẩm
     * @param {object} data - Dữ liệu sản phẩm cần tạo
     * @returns {Promise<object|any>} Sản phẩm vừa tạo hoặc lỗi
     */
    async storeProduct(data) {
        let resp = await this.store(data);
        return resp.data;
    }

    /**
     * Cập nhật thông tin sản phẩm theo ID
     * @param {string|number} id - ID của sản phẩm cần cập nhật
     * @param {object} data - Dữ liệu cập nhật
     * @returns {Promise<object|any>} Sản phẩm đã cập nhật hoặc lỗi
     */
    async updateProduct(id, data) {
        let resp = await this.update(id, data);
        return resp.data;
    }

    /**
     * Xóa sản phẩm theo ID
     * @param {string|number} id - ID của sản phẩm cần xóa
     * @returns {Promise<object|any>} Kết quả xóa hoặc lỗi
     */
    async deleteProduct(id) {
        let resp = await this.delete(id);
        return resp.data;
    }
}
