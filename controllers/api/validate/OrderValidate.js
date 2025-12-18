import { ValidateAPI } from "./validate.js";

/**
 * Validate dữ liệu Order
 */
export class OrderValidate extends ValidateAPI {

    /**
     * Validate khi tạo mới Order
     * @param {object} data
     */
    validateCreate(data) {
        let errors = [];

        if (!data.user_id || data.user_id.trim() === "") {
            errors.push({
                field: "user_id",
                message: "User ID không được để trống"
            });
        }

        const validStatus = ["pending", "paid", "shipping", "completed", "canceled"];
        if (data.status && !validStatus.includes(data.status)) {
            errors.push({
                field: "status",
                message: "Trạng thái đơn hàng không hợp lệ"
            });
        }

        const validPaymentMethods = ["COD", "online"];
        if (!data.payment_method || !validPaymentMethods.includes(data.payment_method)) {
            errors.push({
                field: "payment_method",
                message: "Phương thức thanh toán không hợp lệ"
            });
        }

        if (!data.shipping_address || typeof data.shipping_address !== "object") {
            errors.push({
                field: "shipping_address",
                message: "Địa chỉ giao hàng không hợp lệ"
            });
        }

        if (data.total === undefined || typeof data.total !== "number" || data.total < 0) {
            errors.push({
                field: "total",
                message: "Tổng tiền phải là số >= 0"
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate khi cập nhật Order
     * @param {object} data
     */
    validateUpdate(data) {
        let errors = [];

        if (data.status !== undefined) {
            const validStatus = ["pending", "paid", "shipping", "completed", "canceled"];
            if (!validStatus.includes(data.status)) {
                errors.push({
                    field: "status",
                    message: "Trạng thái đơn hàng không hợp lệ"
                });
            }
        }

        if (data.payment_method !== undefined) {
            const validPaymentMethods = ["COD", "online"];
            if (!validPaymentMethods.includes(data.payment_method)) {
                errors.push({
                    field: "payment_method",
                    message: "Phương thức thanh toán không hợp lệ"
                });
            }
        }

        if (data.total !== undefined) {
            if (typeof data.total !== "number" || data.total < 0) {
                errors.push({
                    field: "total",
                    message: "Tổng tiền phải là số >= 0"
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}