import { BaseAPI } from "./BaseAPI.js";
import { RegisterValidate } from "./validate/RegisterValidate.js";

export class AuthAPI extends BaseAPI {
    constructor() {
        super("users"); // users.json
    }

    decodeGoogleToken(idToken) {
        try {
            const parts = idToken.split(".");
            if (parts.length < 2) return null;

            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("DECODE GOOGLE TOKEN ERROR:", error);
            return null;
        }
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
                        role: user.role
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
     * Đăng nhập/đăng ký bằng Google ID token
     * POST /auth/google
     */
    async loginWithGoogle(idToken) {
        try {
            const payload = this.decodeGoogleToken(idToken);

            if (!payload || !payload.email) {
                return {
                    success: false,
                    errors: [{ message: "Token Google không hợp lệ" }]
                };
            }

            const res = await this.getAll();
            const users = res.data || {};
            const userList = Object.keys(users).map((id) => ({ id, ...users[id] }));

            let user = userList.find((u) => u.email === payload.email);
            let userId = user?.id;

            if (!user) {
                const newUser = {
                    name: payload.name || payload.email.split("@")[0],
                    email: payload.email,
                    phone: payload.phone_number || "",
                    password: "",
                    role: "customer",
                    googleId: payload.sub || "",
                    avatar: payload.picture || "",
                    createdAt: new Date().toLocaleString("vi-VN"),
                    updatedAt: ""
                };

                const createRes = await this.store(newUser);

                if (createRes?.data?.error) {
                    return {
                        success: false,
                        errors: [{ message: createRes.data.error.message || "Firebase error" }]
                    };
                }

                userId = createRes?.data?.name;

                if (!userId) {
                    console.error("GOOGLE LOGIN STORE RESPONSE", createRes);

                    return {
                        success: false,
                        errors: [{ message: "Không tạo được user từ Google" }]
                    };
                }

                user = { id: userId, ...newUser };
            }

            const token = btoa(
                JSON.stringify({
                    uid: userId,
                    email: payload.email,
                    provider: "google",
                    time: Date.now()
                })
            );

            const { password, ...safeUser } = user;

            return {
                success: true,
                data: {
                    token,
                    user: safeUser
                }
            };
        } catch (error) {
            console.error("GOOGLE LOGIN ERROR:", error);

            return {
                success: false,
                errors: [{ message: error.message || "Server error" }]
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
