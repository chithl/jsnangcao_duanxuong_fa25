import { BaseAPI } from "./BaseAPI.js";
import { RegisterValidate } from "./validate/RegisterValidate.js";

export class AuthAPI extends BaseAPI {
    constructor() {
        super("users"); // users.json
    }

    /**
     * Kiểm tra email tồn tại
     * GET /auth/check-email-exists
     */
    async checkEmailExists(email) {
        try {
            const res = await this.getAll();
            const users = res.data || {};

            const exists = Object.values(users).some(
                user => user.email == email
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
            // 0. Validate dữ liệu
            const validator = new RegisterValidate();
            const validateResult = validator.checkValidate(data);

            if (!validateResult.isValid) {
                return {
                    success: false,
                    errors: validateResult.errors
                };
            }

            // 1. Check email tồn tại
            const emailCheck = await this.checkEmailExists(data.email);

            if (!emailCheck.success) {
                return emailCheck;
            }

            if (emailCheck.data.exists) {

                return {
                    success: false,
                    errors: [
                        { field: "email", message: "Email đã tồn tại" }
                    ]
                };
            }


            // 3. Lưu user
            const response = await this.store({
                name: data.name,
                email: data.email,
                phone: data.phone || "",
                password: data.password,
                role: "customer",
                status: 1,
                createdAt: new Date().toLocaleString("vi-VN"),
                updatedAt: ""
            });

            // Firebase returns { name: "-Nx..." } when success
            if (response?.data?.error) {
            console.log("O day sai API");

                return {
                    success: false,
                    errors: [{ message: response.data.error.message || "Firebase error" }]
                };
            }

            const newId = response?.data?.name;
            if (!newId) {
                console.error("REGISTER STORE RESPONSE", response);
                
                return {
                    success: false,
                    errors: [{ message: "Không tạo được user (response rỗng)" }]
                };
            }

            console.log("Thanh cong API");

            return {
                success: true,
                data: {
                    id: newId,
                    message: "Đăng ký thành công"
                }
            };

        } catch (error) {
    console.error("REGISTER ERROR:", error);

    return {
        success: false,
        errors: [{ message: error.message || "Server error" }]
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
            const users = res.data || {};

            const userList = Object.keys(users).map(id => ({
                id,
                ...users[id]
            }));

            const user = userList.find(
                u =>
                    (u.email === data.email || u.phone === data.email) &&
                    u.password === data.password
            );

            if (!user) {
                return {
                    success: false,
                    errors: [
                        { message: "Sai email hoặc mật khẩu" }
                    ]
                };
            }

            // Fake token (demo)
            const token = btoa(
                JSON.stringify({
                    uid: user.id,
                    email: user.email,
                    time: Date.now()
                })
            );

            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        status: user.status
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
     * Lấy thông tin user hiện tại
     * GET /auth/me
     */
    async me(token) {
        try {
            if (!token) {
                return {
                    success: false,
                    errors: [{ message: "Unauthorized" }]
                };
            }

            const decoded = JSON.parse(atob(token));

            const res = await this.getOne(decoded.uid);
            const user = res.data;

            if (!user) {
                return {
                    success: false,
                    errors: [{ message: "User không tồn tại" }]
                };
            }

            // Ẩn password
            const { password, ...safeUser } = user;

            return {
                success: true,
                data: safeUser
            };

        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Token không hợp lệ" }]
            };
        }
    }

    /**
     * Đăng xuất
     */
    async logout() {
        return {
            success: true,
            data: {
                message: "Đã đăng xuất"
            }
        };
    }
}
