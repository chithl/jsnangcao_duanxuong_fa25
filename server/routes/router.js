// VARIABLE VNPAY
const secretArray = {
    vnp_TmnCode: "CS2TOYXS",
    vnp_HashSecret: "PM9V1IDB6LMRQ12BTNI788D90QOSP0CH",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: "http://localhost:8888/order/vnpay_return",
};

const express = require("express");

const bodyParser = require("body-parser");
const moment = require("moment");
const cors = require("cors");
const axios = require("axios");

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/create_payment", (req, res) => {
    let amount = Number(req.body.amount);
    amount += 30000;
    let userId = req.body.user_id;
    let receiver_name = req.body.fullname; //DB
    let receiver_phone = req.body.phone; //DB
    let promotionCode = req.body.promotion_code;

    let receiver_address = encodeURIComponent(req.body.address); //DB
    promotionCode = encodeURIComponent(promotionCode); //DB

    let encoded_name = encodeURIComponent(receiver_name);
    let encoded_address = encodeURIComponent(receiver_address);
    let encoded_phone = encodeURIComponent(receiver_phone);
    // process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.remoteAddress ||
        req.socket.remoteAddress ||
        req.socket.remoteAddress;

    let tmnCode = secretArray.vnp_TmnCode;
    let secretKey = secretArray.vnp_HashSecret;
    let vnpUrl = secretArray.vnp_Url;
    let returnUrl =
        secretArray.vnp_ReturnUrl +
        `?user_id=${userId}&name=${encoded_name}&address=${encoded_address}&phone=${encoded_phone}&promotion_code=${promotionCode}`;

    let orderId = moment(date).format("DDHHmmss");
    let bankCode = req.body.bankCode;

    let locale = req.body.language;
    if (locale === null || locale === "") {
        locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    // if (bankCode !== null && bankCode !== "") {
    //   vnp_Params["vnp_BankCode"] = bankCode;
    // }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
});

router.get("/order/vnpay_return", async (req, res) => {
    try {
        if (req.query.vnp_TransactionStatus !== "00") {
            return res.render("payment_error");
        }

        const userId = req.query.user_id;
        const promoCodeUsed = req.query.promotion_code ? decodeURIComponent(req.query.promotion_code) : null;

        // 1. Lấy toàn bộ dữ liệu cần thiết
        const [cart, allProducts, allVariants, resPromos] = await Promise.all([
            getCartByUserId(userId),
            getAllProducts(),
            getAllVariants(),
            axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/promotions.json")
        ]);

        if (!cart || !cart.cart_details) {
            return res.render("payment_error", { message: "Giỏ hàng không tồn tại" });
        }

        // 2. Xử lý trừ lượt dùng mã giảm giá (Dùng KEY từ Firebase)
        if (promoCodeUsed && resPromos.data) {
            // Chuyển Object promotions của Firebase thành mảng kèm Key (id)
            const allPromos = Object.entries(resPromos.data).map(([key, val]) => ({
                id: key,
                ...val
            }));

            const promo = allPromos.find(p => p.code == promoCodeUsed);

            if (promo) {
                // Tăng số lượt đã dùng lên 1 dựa theo ID (Key Firebase)
                await axios.patch(`https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/promotions/${promo.id}.json`, {
                    used_count: (Number(promo.used_count) || 0) + 1
                });
            }
        }

        // 3. Tạo dữ liệu Order
        const grandTotal = Number(req.query.vnp_Amount) / 100;
        const orderPayload = {
            user_id: userId,
            status: "pending",
            payment_method: "online",
            shipping_address: decodeURIComponent(req.query.address),
            total: grandTotal,
            promoCode: promoCodeUsed || "",
            create_at: new Date().toISOString(),
            paid_at: new Date().toISOString()
        };

        const orderRes = await axios.post("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/orders.json", orderPayload);
        const newOrderId = orderRes.data.name;

        // 4. Tạo Order_Items
        const cartItems = Object.values(cart.cart_details);
        const itemPromises = cartItems.map(item => {
            const variant = allVariants.find(v => v.id === item.variant_id);
            const product = allProducts.find(p => p.id === item.product_id);

            return axios.post("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/order_items.json", {
                orderId: newOrderId,
                sku: variant ? variant.sku : "N/A",
                name: product ? product.name : "Sản phẩm Jotun",
                price: variant ? variant.price : 0,
                quantity: item.quantity
            });
        });

        await Promise.all(itemPromises);

        // 5. Xóa giỏ hàng
        await axios.patch(`https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/carts/${cart.id}.json`, {
            cart_details: []
        });

        // 6. Render trang và truyền biến (ĐÃ BỎ RETURN CHẶN CODE)
        res.render("payment_success", {
            grand_total: grandTotal,
            data: {
                ...orderPayload,
                order_code: "ORD-" + newOrderId.substring(1, 8).toUpperCase(),
                grand_total: grandTotal
            },
            orderId: newOrderId
        });

    } catch (error) {
        console.error("Lỗi xử lý Firebase:", error);
        res.render("payment_error");
    }
});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Hàm bổ trợ để chuyển Object Firebase thành Array có chứa ID
const firebaseToTable = (data) => {
    if (!data) return [];
    return Object.entries(data).map(([id, value]) => ({
        id: id,      // Đây là cái key tự sinh (ID)
        ...value     // Toàn bộ sku, price, name...
    }));
};

const getCartByUserId = async (userId) => {
    const res = await axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/carts.json");
    const carts = firebaseToTable(res.data);
    return carts.find(cart => cart.user_id == userId);
};

const getAllProducts = async () => {
    const res = await axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/products.json");
    return firebaseToTable(res.data);
};

const getAllVariants = async () => {
    const res = await axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/product_variants.json");
    return firebaseToTable(res.data);
};

module.exports = router;
