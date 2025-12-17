import { BaseAPI } from "./BaseAPI.js";
import { ProductAPI } from "./ProductAPI.js";
import { CartValidate } from "./validate/CartValidate.js";

/**
 * Lớp API cho quản lý giỏ hàng (carts) với validation
 * @extends BaseAPI
 */
export class CartAPI extends BaseAPI {
    constructor(params, data) {
        const endpoint = 'carts';
        super(endpoint, params, data);
        this.productAPI = new ProductAPI(); // dùng để trừ tồn kho khi checkout
        this.cartValidate = new CartValidate(); // dùng để validate dữ liệu giỏ hàng
    }

    async getAllCart() {
        const resp = await this.getAll();
        return resp.data;
    }

    async getCartByUser(user_id) {
        const carts = await this.getAllCart();
        return carts.find(c => c.user_id === user_id) || null;
    }

    // Thêm sản phẩm vào giỏ hàng
    async addItemToCart(user_id, item) {
        // Kiểm tra dữ liệu item trước
        const { isError, errors } = this.cartValidate.checkValidate({ user_id, cart_details: [item] }, true);
        if (isError) throw new Error(JSON.stringify(errors));

        let cart = await this.getCartByUser(user_id);

        if (!cart) {
            const newCart = { user_id, cart_details: [item] };
            const resp = await this.store(newCart);
            return resp.data;
        } else {
            const detailIndex = cart.cart_details.findIndex(d => d.product_id === item.product_id && d.variant_id === item.variant_id);

            if (detailIndex >= 0) {
                cart.cart_details[detailIndex].quantity += item.quantity;
            } else {
                cart.cart_details.push(item);
            }

            // Validate toàn bộ giỏ trước khi update
            const { isError: isErrorUpdate, errors: errorsUpdate } = this.cartValidate.checkValidate(cart, false);
            if (isErrorUpdate) throw new Error(JSON.stringify(errorsUpdate));

            const resp = await this.update(cart.id, { cart_details: cart.cart_details });
            return resp.data;
        }
    }

    // Cập nhật số lượng sản phẩm
    async updateItemQuantity(cart_id, detail_id, quantity) {
        if (!cart_id) throw new Error("Cart ID là bắt buộc.");
        if (!detail_id) throw new Error("Detail ID là bắt buộc.");
        if (quantity < 1) throw new Error("Quantity phải >= 1.");

        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;
        const detail = cart.cart_details.find(d => d.id === detail_id);
        if (!detail) throw new Error("Chi tiết giỏ hàng không tồn tại");

        detail.quantity = quantity;

        // Validate toàn bộ giỏ trước khi update
        const { isError, errors } = this.cartValidate.checkValidate(cart, false);
        if (isError) throw new Error(JSON.stringify(errors));

        const resp = await this.update(cart_id, { cart_details: cart.cart_details });
        return resp.data;
    }

    // Xóa 1 sản phẩm trong giỏ
    async removeItemFromCart(cart_id, detail_id) {
        if (!cart_id) throw new Error("Cart ID là bắt buộc.");
        if (!detail_id) throw new Error("Detail ID là bắt buộc.");

        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;
        cart.cart_details = cart.cart_details.filter(d => d.id !== detail_id);

        // Validate toàn bộ giỏ trước khi update
        const { isError, errors } = this.cartValidate.checkValidate(cart, false);
        if (isError) throw new Error(JSON.stringify(errors));

        const resp = await this.update(cart_id, { cart_details: cart.cart_details });
        return resp.data;
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(cart_id) {
        if (!cart_id) throw new Error("Cart ID là bắt buộc.");

        const resp = await this.update(cart_id, { cart_details: [] });
        return resp.data;
    }

    // Thanh toán giỏ hàng
    async checkout(cart_id) {
        if (!cart_id) throw new Error("Cart ID là bắt buộc.");

        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;

        if (!cart.cart_details || cart.cart_details.length === 0) {
            throw new Error("Giỏ hàng trống");
        }

        // Validate trước khi checkout
        const { isError, errors } = this.cartValidate.checkValidate(cart, false);
        if (isError) throw new Error(JSON.stringify(errors));

        // Trừ tồn kho
        for (const item of cart.cart_details) {
            const product = await this.productAPI.getOneProduct(item.product_id);

            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} không đủ tồn kho`);
            }

            await this.productAPI.updateProduct(item.product_id, { quantity: product.quantity - item.quantity });
        }

        // Xóa giỏ hàng sau khi checkout
        const resp = await this.clearCart(cart_id);
        return { message: "Checkout thành công", cart: resp };
    }
}
