import { BaseAPI } from "./BaseAPI.js";
import { RoomValidate } from "./validate/RoomValidate.js";

/**
 * Lớp API cho quản lý phòng (rooms)
 * @extends BaseAPI
 */
export class RoomAPI extends BaseAPI {
    constructor(params, data) {
        const endpoint = "rooms";
        super(endpoint, params, data);
        this.validator = new RoomValidate();
    }

    async getAllRoom() {
        const resp = await super.getAll();
        if (resp.status === 200) {
            return resp.data;
        }
        return "Không thể lấy danh sách phòng";
    }

    async getOneRoom(id) {
        const resp = await super.getOne(id);
        if (resp.status !== 200) {
            return "Không tìm thấy phòng với id: " + id;
        }
        return resp.data;
    }

    /**
     * Tạo mới phòng
     * @param {object} data
     * @returns {Promise<object>}
     */
    async storeRoom(data) {
        const { isError, errors } = this.validator.checkValidate(data);
        if (isError) {
            return { error: true, errors };
        }

        const resp = await super.store(data);
        if (resp.status !== 200) {
            return "Không thể tạo phòng";
        }

        return resp.data;
    }

    /**
     * Cập nhật phòng
     * @param {string|number} id
     * @param {object} data
     */
    async updateRoom(id, data) {
        if (!id) {
            return { error: true, errors: { id: "ID phòng là bắt buộc." } };
        }

        const { isError, errors } = this.validator.checkValidate(data);
        if (isError) {
            return { error: true, errors };
        }

        const resp = await super.update(id, data);
        if (resp.status !== 200) {
            return "Không thể cập nhật phòng";
        }

        return resp.data;
    }

    /**
     * Xóa phòng
     * @param {string|number} id
     */
    async deleteRoom(id) {
        if (!id) {
            return "ID phòng là bắt buộc";
        }

        const resp = await super.delete(id);
        if (resp.status !== 200) {
            return "Không thể xóa phòng với id: " + id;
        }

        return resp.data;
    }
}
