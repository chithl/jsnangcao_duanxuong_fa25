import { BaseAPI } from "./BaseAPI.js";

export class AuthAPI extends BaseAPI {
    constructor() {
        super("users"); // tương ứng users.json
    }

    /**
     * Kiểm tra email tồn tại
     * /auth/check-email-exists
     */
    async checkEmailExists(email) {
        try {
            const res = await this.getAll();
            const users = res.data || {};

            const exists = Object.values(users).some(
                user => user.email === email
            );

            return {
                success: true,
                data: { exists }
            };
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Server error" }]
            };
        }
    }

    /**
     * Đăng ký
     * POST /auth/register
     */
    async register(data) {
        try {
            // 1. Kiểm tra email tồn tại
            const emailCheck = await this.checkEmailExists(data.email);
            if (emailCheck.data.exists) {
                return {
                    success: false,
                    errors: [{ field: "email", message: "Email đã tồn tại" }]
                };
            }

            // 2. Hash password (phía client / không an toàn nhưng mô phỏng API)
            const hashedPassword = btoa(data.password);

            // 3. Lưu user vào Firebase
            const response = await this.store({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone || "",
                role: "user",
                createdAt: new Date().toLocaleString("vi-VN")
            });

            return {
                success: true,
                data: {
                    id: response.data.name,
                    message: "Đăng ký thành công"
                }
            };

        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Server error" }]
            };
        }
    }

    /**
     * Đăng nhập
     * POST /auth/login
     */
    async login(data) {
        try {
            const res = await this.getAll();
            const allUsers = res.data || {};

            const userList = Object.keys(allUsers).map(id => ({
                id,
                ...allUsers[id]
            }));

            // Hash lại mật khẩu người dùng nhập để so sánh
            const hashedInputPassword = btoa(data.password);

            const user = userList.find(
                u =>
                    (u.email === data.email || u.phone === data.email) &&
                    u.password === hashedInputPassword
            );

            if (!user) {
                return {
                    success: false,
                    errors: [{ message: "Sai email hoặc mật khẩu" }]
                };
            }

            // Tạo token fake (Firebase không có)
            const token = btoa(JSON.stringify({
                uid: user.id,
                email: user.email,
                time: Date.now()
            }));

            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    }
                }
            };

        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Server error" }]
            };
        }
    }

    /**
     * Lấy thông tin user /auth/me
     */
    async me(token) {
        try {
            if (!token) {
                return { success: false, errors: [{ message: "Unauthorized" }] };
            }

            const decoded = JSON.parse(atob(token));

            const user = await this.getOne(decoded.uid);
            return {
                success: true,
                data: user.data
            };

        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Token không hợp lệ" }]
            };
        }
    }

    /**
     * Đăng xuất – xóa token phía client
     */
    async logout() {
        return {
            success: true,
            data: { message: "Đã đăng xuất" }
        };
    }
}
