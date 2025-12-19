import { BaseAPI } from "./BaseAPI.js";
import { AuthAPI } from "./AuthAPI.js";
import { UserValidate } from "./validate/UserValidate.js";
export class UserAPI extends BaseAPI {
    constructor() {
        super("users"); // users.json
    }
    /**
     * Cập nhật thông tin người dùng
     * @param {string|number} id - id của người dùng
     * @param {object} data - dữ liệu cập nhật
     */
    async getAllUsers() {
        try {
            const res = await this.getAll();
            const users = res.data || {};
            console.log(users)
            return {
                success: true,
                data: users
            };
            
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "GetAllUsers failed" }]
            };
        }
    }

    async getUserById(id) {
        try {
            if (!id) {
                return {
                    success: false,
                    errors: [{ message: "Thiếu id người dùng" }]
                };
            }

            const res = await this.getOne(id);
            const user = res?.data;
            if (!user) {
                return {
                    success: false,
                    errors: [{ message: "User không tồn tại" }]
                };
            }
            return {
                success: true,
                data: { id, ...user }
            };
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "GetUserById failed" }]
            };
        }
    }

    async addUser(data) {
        try {
            // 0. Validate dữ liệu
            const validator = new UserValidate();
            const validateResult = validator.validateCreate(data);
            if (!validateResult.isValid) {
                return {
                    success: false,
                    errors: validateResult.errors
                };
            }
            // 1. Check email tồn tại
            const authAPI = new AuthAPI();
            const emailCheck = await authAPI.checkEmailExists(data.email);
            if (!emailCheck.success) {
                return emailCheck;
            }
            if (emailCheck.data.exists) {
                // alert("Email đã tồn tại!");
                return {
                    success: false,
                    errors: [{ field: "email", message: "Email đã tồn tại" }]
                };
            }
            // 3. Lưu user
            const response = await this.store({
                name: data.name,
                email: data.email,
                phone: data.phone || "",
                password: data.password,
                role: data.role || "customer",
                status: data.status || 1,
                createdAt: new Date().toLocaleString("vi-VN"),
                updatedAt: ""
            });

            const statusOk = response?.status === 200 || response?.status === 201;
            if (statusOk) {
                const newId = response?.data?.name; // Firebase trả name là id
                return {
                    success: true,
                    data: newId ? { id: newId } : response.data
                };
            }

            return {
                success: false,
                errors: [{ message: "Add user failed" }]
            };
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Add user failed" }]
            };
        }
    }

    async updateUser(id, data) {
        try {
            if (!id) {
                return {
                    success: false,
                    errors: [{ message: "Thiếu id người dùng" }]
                };
            }

            // Lấy dữ liệu hiện tại để merge và giữ lại các trường không được gửi lên
            const currentRes = await this.getOne(id);
            const current = currentRes?.data;
            if (!current) { 
                return {
                    success: false,
                    errors: [{ message: "User không tồn tại" }]
                };
            }

            const payload = {
                name: data.name || current.name,
                email: data.email || current.email,
                phone: data.phone || current.phone || "",
                password: data.password || current.password,
                role: data.role || current.role,
                status: data.status || current.status,
                createdAt: current.createdAt,
                updatedAt: new Date().toLocaleString("vi-VN")
            };

            // Validate dữ liệu sau khi merge để tránh thiếu password/name...
            const validator = new UserValidate();
            const validateResult = validator.validateUpdate(payload);
            if (!validateResult.isValid) {
                return {
                    success: false,
                    errors: validateResult.errors
                };
            }

            // Kiểm tra email trùng với user khác
            const allRes = await this.getAll();
            const users = allRes.data || {};
            const duplicate = Object.entries(users).some(
                ([uid, user]) => user.email === payload.email && uid !== id
            );
            if (duplicate) {
                return {
                    success: false,
                    errors: [{ field: "email", message: "Email đã tồn tại" }]
                };
            }

            const response = await this.update(id, payload);
            if (response?.status === 200) {
                return {
                    success: true,
                    data: { id, ...payload }
                };
            }

            return {
                success: false,
                errors: [{ message: "Cập nhật user thất bại" }]
            };
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Update user failed" }]
            };
        }
    }

    async deleteUser(id) {
        try {
            if (!id) {
                return {
                    success: false,
                    errors: [{ message: "Thiếu id người dùng" }]
                };
            }

            const currentRes = await this.getOne(id);
            if (!currentRes?.data) {
                return {
                    success: false,
                    errors: [{ message: "User không tồn tại" }]
                };
            }

            const response = await this.delete(id);
            if (response?.status === 200) {
                return {
                    success: true,
                    data: { id }
                };
            }

            return {
                success: false,
                errors: [{ message: "Xóa user thất bại" }]
            };
        } catch (error) {
            return {
                success: false,
                errors: [{ message: "Delete user failed" }]
            };
        }
    }
}