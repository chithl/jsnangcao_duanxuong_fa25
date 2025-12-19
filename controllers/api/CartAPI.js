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

    objectToArray(cart_details = {}) {
        return Object.entries(cart_details).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }

    arrayToObject(detailsArray = []) {
        const obj = {};
        for (const item of detailsArray) {
            const { id, ...rest } = item;
            obj[id] = rest;
        }
        return obj;
    }

    async getAllCart() {
        const resp = await this.getAll();
        // console.log(resp);
        return resp.data;
    }

    async getCartByUser(user_id) {
        const carts = await this.getAllCart();
        if(carts == null) return null;
        const cartArray = Object.entries(carts).map(([cartKey, cart]) => ({ cartKey, ...cart }));
        return cartArray.find(c => c.user_id === user_id) || null;
    }

    async createNewCart(data) {
        console.log("Create")
        const cartRes = await super.store(data);
        return cartRes;
    }

    // Thêm sản phẩm vào giỏ hàng
    async addItemToCart(user_id, item) {
        if (!user_id) throw new Error("user_id là bắt buộc.");

        let cart = await this.getCartByUser(user_id);

        if (!cart) {
            const newCart = {
                user_id,
                cart_details: {
                    [`item_${Date.now()}`]: item
                }
            };

            const { isError, errors } = this.cartValidate.checkValidate(newCart);
            if (isError) throw new Error(JSON.stringify(errors));

            const resp = await this.store(newCart);
            return resp.data;
        }

        const detailsArray = this.objectToArray(cart.cart_details);

        const exist = detailsArray.find(
            d => d.product_id === item.product_id && d.variant_id === item.variant_id
        );

        if (exist) {
            exist.quantity += item.quantity;
        } else {
            detailsArray.push({
                id: `item_${Date.now()}`,
                ...item
            });
        }

        const updatedDetails = this.arrayToObject(detailsArray);

        const updatedCart = {
            user_id: cart.user_id,
            cart_details: updatedDetails
        };

        const { isError, errors } = this.cartValidate.checkValidate(updatedCart);
        if (isError) throw new Error(JSON.stringify(errors));

        const resp = await this.update(cart.id, updatedCart);
        return resp.data;
    }

    // Cập nhật số lượng sản phẩm
    async updateItemQuantity(cart_id, detail_id, quantity) {
        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;

        if (!cart.cart_details[detail_id]) {
            throw new Error("Item không tồn tại trong giỏ");
        }

        cart.cart_details[detail_id].quantity = quantity;

        const { isError, errors } = this.cartValidate.checkValidate(cart);
        if (isError) throw new Error(JSON.stringify(errors));

        const resp = await this.update(cart_id, cart);
        return resp.data;
    }

    // Xóa 1 sản phẩm trong giỏ
    async removeItemFromCart(cart_id, detail_id) {
        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;

        delete cart.cart_details[detail_id];

        const { isError, errors } = this.cartValidate.checkValidate(cart);
        if (isError) throw new Error(JSON.stringify(errors));

        const resp = await this.update(cart_id, cart);
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
        const cartResp = await this.getOne(cart_id);
        const cart = cartResp.data;

        if (!cart.cart_details || Object.keys(cart.cart_details).length === 0) {
            throw new Error("Giỏ hàng trống");
        }

        for (const item of Object.values(cart.cart_details)) {
            const product = await this.productAPI.getOneProduct(item.product_id);

            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} không đủ tồn kho`);
            }

            await this.productAPI.updateProduct(item.product_id, {
                quantity: product.quantity - item.quantity
            });
        }

        await this.clearCart(cart_id);
        return { message: "Checkout thành công" };
    }
}
