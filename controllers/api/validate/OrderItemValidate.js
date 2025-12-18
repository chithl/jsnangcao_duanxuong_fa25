import { ValidateAPI } from "./validate.js";

/**
 * Validate dữ liệu Order Item
 */
export class OrderItemValidate extends ValidateAPI {

    /**
     * Validate khi tạo mới Order Item
     * @param {object} data
     */
    validateCreate(data) {
        let errors = [];

        if (!data.orderId || data.orderId.trim() === "") {
            errors.push({
                field: "orderId",
                message: "Order ID không được để trống"
            });
        }

        if (!data.sku || data.sku.trim() === "") {
            errors.push({
                field: "sku",
                message: "SKU không được để trống"
            });
        }

        if (!data.name || data.name.trim() === "") {
            errors.push({
                field: "name",
                message: "Tên sản phẩm không được để trống"
            });
        }

        if (data.price === undefined || typeof data.price !== "number" || data.price < 0) {
            errors.push({
                field: "price",
                message: "Giá sản phẩm phải là số >= 0"
            });
        }

        if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
            errors.push({
                field: "quantity",
                message: "Số lượng phải là số nguyên > 0"
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate khi cập nhật Order Item
     * @param {object} data
     */
    validateUpdate(data) {
        let errors = [];

        if (data.price !== undefined) {
            if (typeof data.price !== "number" || data.price < 0) {
                errors.push({
                    field: "price",
                    message: "Giá sản phẩm phải là số >= 0"
                });
            }
        }

        if (data.quantity !== undefined) {
            if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
                errors.push({
                    field: "quantity",
                    message: "Số lượng phải là số nguyên > 0"
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}