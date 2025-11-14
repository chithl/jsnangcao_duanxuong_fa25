import { CategoryAPI } from "../../api/CategoryAPI.js";

/**
 * Module xử lý trang tạo Category
 * Đăng ký window.createCategory để gọi từ button trong HTML
 */

window.createCategory = async function () {
    const name = document.getElementById('name')?.value ?? '';
    const description = document.getElementById('description')?.value ?? '';

    const data = { name, description };

    try {
        const api = new CategoryAPI();
        const result = await api.storeCategory(data);
        console.log('Tạo category thành công:', result);
        // TODO: chuyển hướng hoặc hiển thị thông báo thành công
    } catch (error) {
        console.error('Lỗi khi tạo category:', error);
        // TODO: hiển thị thông báo lỗi cho người dùng
    }
};
