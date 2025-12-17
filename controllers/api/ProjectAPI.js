import { BaseAPI } from "./BaseAPI.js";
import { ProjectValidate } from "./validate/ProjectValidate.js";

/**
 * Lớp API cho quản lý dự án (projects)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * @extends BaseAPI
 */
export class ProjectAPI extends BaseAPI {
    /**
     * Khởi tạo ProjectAPI
     * @param {object} [params] - Tham số truy vấn mặc định
     * @param {object} [data] - Dữ liệu mặc định
     */
    constructor(params, data) {
        var endpoint = 'projects';
        super(endpoint, params, data);
        this.projectValidate = new ProjectValidate();
    }

    /**
     * Lấy tất cả dự án
     * @returns {Promise<Array|any>} Mảng các dự án hoặc lỗi
     */
    async getAllProject() {
        let resp = await this.getAll();
        if (resp.status == 200) {
            return resp.data;
        } else {
            return "Không thể lấy được dữ liệu";
        }
    }

    /**
     * Lấy thông tin một dự án theo ID
     * @param {string|number} id - ID của dự án cần lấy
     * @returns {Promise<object|any>} Đối tượng dự án hoặc lỗi
     */
    async getOneProject(id) {
        let resp = await this.getOne(id);
        return resp.data;
    }

    /**
     * Không cần truyền vào created_at
     * Tạo mới một dự án
     * @param {object} data - Dữ liệu dự án cần tạo
     * @returns {Promise<object|any>} dự án vừa tạo hoặc lỗi
     */
    async storeProject(data) {
        // Kiểm tra dữ liệu
        const { isError, errors } = this.projectValidate.checkValidate(data, true);

        if (isError) {
            // Nếu có lỗi, ném ra hoặc trả về object lỗi
            // Cách 1: ném lỗi
            throw new Error(JSON.stringify(errors));

            // Cách 2: trả về object lỗi (không gọi API)
            // return { error: true, errors };
        }

        // Nếu dữ liệu hợp lệ, gọi API để lưu
        const resp = await this.store(data);
        return resp.data;
    }

    /**
     * Không cần truyền vào created_at
     * Cập nhật thông tin dự án theo ID
     * @param {string|number} id - ID của dự án cần cập nhật
     * @param {object} data - Dữ liệu cập nhật
     * @returns {Promise<object|any>} dự án đã cập nhật hoặc lỗi
     */
    async updateProject(id, data) {
        // Kiểm tra id
        if (id === undefined || id === null || id === '') {
            throw new Error("ID dự án là bắt buộc để cập nhật.");
        }

        // Kiểm tra dữ liệu
        const { isError, errors } = this.projectValidate.checkValidate(data, true);
        if (isError) {
            throw new Error(JSON.stringify(errors));
        }

        // Nếu hợp lệ, gọi API update
        const resp = await this.update(id, data);
        return resp.data;
    }

    /**
     * Xóa dự án theo ID
     * @param {string|number} id - ID của dự án cần xóa
     * @returns {Promise<object|any>} Kết quả xóa hoặc lỗi
     */
    async deleteProject(id) {
        if (!id) {
            throw new Error("ID dự án là bắt buộc để xóa.");
        }

        const resp = await this.delete(id);

        if (resp.status === 200) {
            return true;
        }

        throw new Error("Xóa dự án không thành công.");
    }

}
