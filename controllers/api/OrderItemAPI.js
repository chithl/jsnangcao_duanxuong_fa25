import { BaseAPI } from "./BaseAPI.js";
import { OrderItemValidate } from "./validate/OrderItemValidate.js";

/**
 * OrderItemAPI
 * --------------------------------------------------
 * Class thao tác với bảng order_items
 * Quản lý các sản phẩm trong đơn hàng
 */
export class OrderItemAPI extends BaseAPI {
    constructor() {
        super("order_items");
        this.validator = new OrderItemValidate();
    }

    /**
     * Lấy tất cả order items
     * @returns {Promise<AxiosResponse|any>}
     */
    async getItems() {
        return this.getAll();
    }

    /**
     * Lấy chi tiết order item theo ID
     * @param {string} id - ID item
     * @returns {Promise<AxiosResponse|any>}
     */
    async getItemById(id) {
        if (!id) {
            return {
                error: true,
                errors: [{ field: "id", message: "Item ID không hợp lệ" }]
            };
        }
        return this.getOne(id);
    }

   async getByOrderId(orderId) {
    if (!orderId) {
        return { success: false, data: [], message: "Missing orderId" };
    }

    try {
        // Sử dụng REST API endpoint của Firebase
        const url = `https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/order_items.json?orderBy="orderId"&equalTo="${orderId}"`;

        const res = await axios.get(url);
        return { success: true, data: res.data };
    } catch (error) {
        console.error("Lỗi getByOrderId:", error);
        return { success: false, data: [], message: error.message };
    }
}



    /**
     * Thêm sản phẩm vào đơn hàng
     * @param {object} data - dữ liệu item
     * @returns {Promise<AxiosResponse|object>}
     */
    async createItem(data) {
        const { isValid, errors } = this.validator.checkValidate(data, "create");

        if (!isValid) {
            return { error: true, errors };
        }

        return this.store(data);
    }

    /**
     * Cập nhật sản phẩm trong đơn hàng
     * @param {string} id - ID item
     * @param {object} data - dữ liệu cập nhật
     * @returns {Promise<AxiosResponse|object>}
     */
    async updateItem(id, data) {
        const { isValid, errors } = this.validator.checkValidate(data, "update");

        if (!isValid) {
            return { error: true, errors };
        }

        return this.update(id, data);
    }

    /**
     * Xóa sản phẩm khỏi đơn hàng
     * @param {string} id - ID item
     * @returns {Promise<AxiosResponse|any>}
     */
    async deleteItem(id) {
        return this.delete(id);
    }
}