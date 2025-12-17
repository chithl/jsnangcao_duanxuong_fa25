import { ValidateAPI } from "./validate.js";

export class CartValidate extends ValidateAPI {
    /**
     * Kiểm tra dữ liệu giỏ hàng
     * @param {object} data
     * @param {boolean} isNew - true nếu tạo mới, false nếu update
     * @returns {{isError: boolean, errors: object}}
     */
    checkValidate(data, isNew = true) {
        const errors = {};

        // user_id bắt buộc
        if (!data.user_id || data.user_id === '') {
            errors.user_id = "User ID là bắt buộc.";
        }

        // cart_details phải là mảng
        if (!Array.isArray(data.cart_details) || data.cart_details.length === 0) {
            errors.cart_details = "Giỏ hàng phải có ít nhất 1 sản phẩm.";
        } else {
            data.cart_details.forEach((item, index) => {
                if (!item.product_id || item.product_id === '') {
                    errors[`cart_details[${index}].product_id`] = "Product ID là bắt buộc.";
                }
                if (!item.variant_id || item.variant_id === '') {
                    errors[`cart_details[${index}].variant_id`] = "Variant ID là bắt buộc.";
                }
                if (item.unit_price === undefined || item.unit_price === null || isNaN(item.unit_price) || item.unit_price < 0) {
                    errors[`cart_details[${index}].unit_price`] = "Unit price phải là số >= 0.";
                }
                if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity < 1) {
                    errors[`cart_details[${index}].quantity`] = "Quantity phải là số >= 1.";
                }
            });
        }

        // id bắt buộc nếu update/delete
        if (!isNew && (!data.id || data.id === '')) {
            errors.id = "ID giỏ hàng là bắt buộc khi cập nhật hoặc xóa.";
        }

        return {
            isError: Object.keys(errors).length > 0,
            errors
        };
    }
}