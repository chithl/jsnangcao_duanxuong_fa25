import { BaseAPI } from "./BaseAPI.js";
import { ProjectValidate } from "./validate/ProjectValidate.js";

/**
 * Lớp API cho quản lý kho (inventories)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * @extends BaseAPI
 */
export class InventoryAPI extends BaseAPI {
    /**
     * Khởi tạo InventoryAPI
     * @param {object} [params] - Tham số truy vấn mặc định
     * @param {object} [data] - Dữ liệu mặc định
     */
    constructor(params, data) {
        var endpoint = 'inventories';
        super(endpoint, params, data);
        this.projectValidate = new ProjectValidate();
    }

    /**
     * Lấy tất cả kho đồ
     * @returns {Promise<Array|any>} Mảng các kho đồ hoặc lỗi
     */
    async getAllInventory() {
        let resp = await this.getAll();
        if (resp.status == 200) {
            return resp.data;
        } else {
            return "Không thể lấy được dữ liệu";
        }
    }

    /**
     * Lấy thông tin một kho đồ theo ID
     * @param {string|number} id - ID của kho đồ cần lấy
     * @returns {Promise<object|any>} Đối tượng kho đồ hoặc lỗi
     */
    async getOneInventory(id) {
        let resp = await this.getOne(id);
        return resp.data;
    }

    /**
     * Tạo mới một bản ghi kho (inventory)
     *
     * @param {object} data - Dữ liệu kho cần tạo
     * @param {string} data.sku - Mã SKU (FK liên kết tới product-variant)
     * @param {number} data.quantity - Số lượng tồn kho
     * @param {string} data.location - Vị trí kho lưu trữ
     * @param {string|Date} data.updated_at - Thời điểm cập nhật kho (Timestamp)
     *
     * @returns {Promise<object|any>} Thông tin kho vừa tạo hoặc lỗi nếu có
     */
    async storeInventory(data) {
        // Kiểm tra dữ liệu
        // const { isError, errors } = this.inventoryValidate.checkValidate(data, true);

        // if (isError) {
        // Nếu có lỗi, ném ra hoặc trả về object lỗi
        // Cách 1: ném lỗi
        // throw new Error(JSON.stringify(errors));

        // Cách 2: trả về object lỗi (không gọi API)
        // return { error: true, errors };
        // }

        // Nếu dữ liệu hợp lệ, gọi API để lưu
        const resp = await this.store(data);
        return resp.data;
    }

    /**
     * Cập nhật thông tin kho (inventory) theo ID
     *
     * @param {string|number} id - ID của kho đồ cần cập nhật
     * @param {object} data - Dữ liệu kho cần cập nhật
     * @param {string} [data.sku] - Mã SKU (FK liên kết tới product-variant)
     * @param {number} [data.quantity] - Số lượng tồn kho
     * @param {string} [data.location] - Vị trí kho lưu trữ
     * @param {string|Date} [data.updated_at] - Thời điểm cập nhật kho (Timestamp)
     *
     * @returns {Promise<object|any>} Thông tin kho đã được cập nhật hoặc lỗi nếu có
     */
    async updateInventory(id, data) {
        // Kiểm tra id
        if (id === undefined || id === null || id === '') {
            throw new Error("ID kho đồ là bắt buộc để cập nhật.");
        }

        // Kiểm tra dữ liệu
        // const { isError, errors } = this.projectValidate.checkValidate(data, true);
        // if (isError) {
        //     throw new Error(JSON.stringify(errors));
        // }

        // Nếu hợp lệ, gọi API update
        const resp = await this.update(id, data);
        return resp.data;
    }

    /**
     * Xóa kho đồ theo ID
     * @param {string|number} id - ID của kho đồ cần xóa
     * @returns {Promise<object|any>} Kết quả xóa hoặc lỗi
     */
    async deleteInventory(id) {
        if (!id) {
            throw new Error("ID kho đồ là bắt buộc để xóa.");
        }

        const resp = await this.delete(id);

        if (resp.status === 200) {
            return true;
        }

        throw new Error("Xóa kho đồ không thành công.");
    }
}
