import { BaseAPI } from "./BaseAPI.js";
import { OrderValidate } from "../validate/OrderValidate.js";

/**
 * OrderAPI
 * --------------------------------------------------
 * Class dùng để thao tác với Order (đơn hàng)
 * Kế thừa BaseAPI và tích hợp validate cho frontend
 */
export class OrderAPI extends BaseAPI {
    constructor() {
        super("orders");
        this.validator = new OrderValidate();
    }

    /**
     * Lấy danh sách tất cả đơn hàng
     * @returns {Promise<AxiosResponse|any>}
     */
    async getOrders() {
        return this.getAll();
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     * @param {string} id - ID đơn hàng
     * @returns {Promise<AxiosResponse|any>}
     */
    async getOrderById(id) {
        if (!id) {
            return {
                error: true,
                errors: [{ field: "id", message: "Order ID không hợp lệ" }]
            };
        }
        return this.getOne(id);
    }

    /**
     * Tạo mới đơn hàng
     * - Validate dữ liệu trước khi gửi API
     * - Firebase sẽ tự sinh ID
     *
     * @param {object} data - dữ liệu đơn hàng
     * @returns {Promise<AxiosResponse|object>}
     */
    async createOrder(data) {
        const { isValid, errors } = this.validator.checkValidate(data, "create");

        if (!isValid) {
            return { error: true, errors };
        }

        return this.store({
            ...data,
            status: "pending",
            created_at: Date.now(),
            paid_at: null
        });
    }

    /**
     * Cập nhật toàn bộ đơn hàng (ít dùng)
     * @param {string} id - ID đơn hàng
     * @param {object} data - dữ liệu cập nhật
     * @returns {Promise<AxiosResponse|object>}
     */
    async updateOrder(id, data) {
        const { isValid, errors } = this.validator.checkValidate(data, "update");

        if (!isValid) {
            return { error: true, errors };
        }

        return this.update(id, data);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * @param {string} id - ID đơn hàng
     * @param {string} status - pending | paid | shipping | completed | canceled
     * @returns {Promise<AxiosResponse|any>}
     */
    async updateStatus(id, status) {
        return this.patch(id, { status });
    }

    /**
     * Đánh dấu đơn hàng đã thanh toán
     * @param {string} id - ID đơn hàng
     * @param {"COD"|"online"} payment_method
     * @returns {Promise<AxiosResponse|any>}
     */
    async markAsPaid(id, payment_method = "online") {
        return this.patch(id, {
            status: "paid",
            payment_method,
            paid_at: Date.now()
        });
    }

    /**
     * Xóa đơn hàng
     * @param {string} id - ID đơn hàng
     * @returns {Promise<AxiosResponse|any>}
     */
    async deleteOrder(id) {
        return this.delete(id);
    }
}