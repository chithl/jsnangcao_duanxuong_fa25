const BASE_URL = 'CHEN_LINK_API';

/**
 * BaseAPI - Lớp cơ sở để gọi API RESTful.
 *
 * Sử dụng:
 *   const api = new BaseAPI('users');
 *   await api.getAll();
 *
 * @param {string} endpoint - đường dẫn endpoint (ví dụ 'users')
 * @param {object} [params] - tham số query mặc định (không bắt buộc)
 * @param {object} [data] - dữ liệu mặc định (không bắt buộc)
 */
export class BaseAPI {
    constructor(endpoint, params, data) {
        this.endpoint = endpoint + '.json';
        this.params = params;
        this.data = data;
    }

    /**
     * Lấy tất cả bản ghi từ endpoint
     * @returns {Promise<AxiosResponse|any>} Response của axios hoặc error.response nếu có lỗi
     */
    async getAll() {
        try {
            var response = await axios.get(BASE_URL + this.endpoint)
            return response;
        } catch (error) {
            return error.response || error;
        }
    }
    /**
     * Lấy một bản ghi theo id
     * @param {string|number} id - id của bản ghi cần lấy
     * @returns {Promise<AxiosResponse|any>}
     */
    async getOne(id) {
        try {
            var response = await axios.get(BASE_URL + this.endpoint + '/' + id)
            return response;
        } catch (error) {
            return error.response || error;
        }
    }
    /**
     * Tạo mới bản ghi
     * @param {object} data - dữ liệu gửi lên server
     * @returns {Promise<AxiosResponse|any>}
     */
    async store(data) {
        try {
            var response = await axios.post(BASE_URL + this.endpoint, data)
            return response;
        } catch (error) {
            return error.response || error;
        }
    }
    /**
     * Cập nhật bản ghi theo id
     * @param {string|number} id - id của bản ghi
     * @param {object} data - dữ liệu cập nhật
     * @returns {Promise<AxiosResponse|any>}
     */
    async update(id, data) {
        try {
            var response = await axios.put(BASE_URL + this.endpoint + '/' + id, data)
            return response;
        } catch (error) {
            return error.response || error;
        }
    }
    /**
     * Xóa bản ghi theo id
     * @param {string|number} id - id của bản ghi cần xóa
     * @returns {Promise<AxiosResponse|any>}
     */
    async delete(id) {
        try {
            var response = await axios.delete(BASE_URL + this.endpoint + '/' + id)
            return response;
        } catch (error) {
            return error.response || error;
        }
    }
}