import { ValidateAPI } from "./validate.js";

export class UserValidate extends ValidateAPI {

    validateCreate(data) {
        let errors = [];

        if (!data.name || data.name.trim() === "") {
            errors.push({ field: "name", message: "Tên không được để trống" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push({ field: "email", message: "Email không hợp lệ" });
        }

        if (!data.password) {
            errors.push({
                field: "password",
                message: "Mật khẩu không được để trống"
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateUpdate(data) {
        let errors = [];

        if (data.name !== undefined && data.name.trim() === "") {
            errors.push({ field: "name", message: "Tên không được để trống" });
        }

        if (data.email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.push({ field: "email", message: "Email không hợp lệ" });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
