import { ValidateAPI } from "./validate.js";

export class CartValidate extends ValidateAPI {
    checkValidate(data) {
        const errors = {};

        // user_id
        if (!data.user_id || typeof data.user_id !== "string") {
            errors.user_id = "user_id là bắt buộc và phải là chuỗi.";
        }

        // cart_details
        if (!data.cart_details || typeof data.cart_details !== "object") {
            errors.cart_details = "cart_details phải là object.";
        } else {
            for (const [key, item] of Object.entries(data.cart_details)) {
                if (!item.product_id || typeof item.product_id !== "string") {
                    errors[`cart_details.${key}.product_id`] = "product_id là bắt buộc.";
                }

                if (!item.variant_id || typeof item.variant_id !== "string") {
                    errors[`cart_details.${key}.variant_id`] = "variant_id là bắt buộc.";
                }

                if (isNaN(item.unit_price) || Number(item.unit_price) < 0) {
                    errors[`cart_details.${key}.unit_price`] = "unit_price phải >= 0.";
                }

                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                    errors[`cart_details.${key}.quantity`] = "quantity phải >= 1.";
                }
            }
        }

        return {
            isError: Object.keys(errors).length > 0,
            errors
        };
    }
}