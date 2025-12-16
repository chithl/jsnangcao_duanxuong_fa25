import { ValidateAPI } from "./validate.js";
export class RegisterValidate extends ValidateAPI {
    checkValidate(data) {
        let errors = [];

        if (!data.name || data.name.trim() === "") {
            errors.push({ field: "name", message: "Tên không được để trống" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push({ field: "email", message: "Email không hợp lệ" });
        }

        if (!data.phone || data.phone.trim() === "") {
            errors.push({ field: "phone", message: "Số điện thoại không được để trống" });
        }

        if (!data.password || data.password.length < 6) {
            errors.push({
                field: "password",
                message: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        return {
            isValid: errors.length == 0,
            errors
        };
    }
}