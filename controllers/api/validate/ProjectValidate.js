import { ValidateAPI } from "./validate.js";

export class ProjectValidate extends ValidateAPI {
    /**
     * Kiểm tra dữ liệu dự án
     * @param {object} data
     * @param {any} data.user_id - bắt buộc
     * @param {string} data.name
     * @param {string} [data.notes]
     * @param {string} data.status - 'draft', 'published', 'archived'
     * @param {string|Date} [data.create_at]
     * @param {boolean} isNew - true nếu là dữ liệu tạo mới
     * @returns {{isError: boolean, errors: object}}
     */
    checkValidate(data, isNew = false) {
        const errors = {};

        // user_id bắt buộc, không để trống
        if (data.user_id === undefined || data.user_id === null || data.user_id === '') {
            errors.user_id = "User ID là bắt buộc.";
        }

        // name bắt buộc, string, max 255 ký tự
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.name = "Tên dự án là bắt buộc.";
        } else if (data.name.length > 255) {
            errors.name = "Tên dự án không được vượt quá 255 ký tự.";
        }

        // notes tùy chọn, nếu có phải là string
        if (data.notes && typeof data.notes !== 'string') {
            errors.notes = "Ghi chú phải là chuỗi.";
        }

        // status bắt buộc, phải là 1 trong các giá trị cho phép
        const allowedStatus = ['draft', 'published', 'archived'];
        if (!data.status || !allowedStatus.includes(data.status)) {
            errors.status = `Trạng thái phải là một trong: ${allowedStatus.join(', ')}.`;
        }

        // create_at: nếu tạo mới và chưa có, tự gán ngày hiện tại
        if (isNew && !data.create_at) {
            data.create_at = new Date().toISOString();
        }

        // nếu create_at có giá trị, kiểm tra hợp lệ
        if (data.create_at) {
            const date = new Date(data.create_at);
            if (isNaN(date.getTime())) {
                errors.create_at = "Ngày tạo không hợp lệ.";
            }
        }

        return {
            isError: Object.keys(errors).length > 0,
            errors
        };
    }
}
