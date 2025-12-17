import { BaseAPI } from "./BaseAPI.js";

/**
 * Lớp API cho quản lý bề mặt (surfaces)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * @extends BaseAPI
 */

export class SurfacesAPI extends BaseAPI {
  /**
   * Khởi tạo SurfacesAPI
   * @param {object} [params] - Tham số truy vấn mặc định
   * @param {object} [data] - Dữ liệu mặc định
   */
  constructor(params, data) {
    var endpoint = "surfaces";
    super(endpoint, params, data);
  }

  /**
   * Lấy tất cả bề mặt
   * @returns {Promise<Array|any>} Mảng các bề mặt hoặc lỗi
   */
  async getAllSurfaces() {
    let resp = await this.getAll();
    return resp.data;
  }

  /**
   * Lấy thông tin một bề mặt theo ID
   * @param {string|number} id - ID của bề mặt cần lấy
   * @returns {Promise<object|any>} Đối tượng bề mặt hoặc lỗi
   */
  async getOneSurface(id) {
    let resp = await this.getOne(id);
    return resp.data;
  }

  /**
   * Tạo mới một bề mặt
   * @param {object} data - Dữ liệu bề mặt cần tạo
   * @returns {Promise<object|any>} Bề mặt vừa tạo hoặc lỗi
   */
  async storeSurface(data) {
    let resp = await this.store(data);
    return resp.data;
  }

  /**
   * Cập nhật thông tin bề mặt theo ID
   * @param {string|number} id - ID của bề mặt cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object|any>} Bề mặt đã cập nhật hoặc lỗi
   */
  async updateSurface(id, data) {
    let resp = await this.update(id, data);
    return resp.data;
  }

  /**
   * Xóa bề mặt theo ID
   * @param {string|number} id - ID của bề mặt cần xóa
   * @returns {Promise<object|any>} Kết quả xóa hoặc lỗi
   */
  async deleteSurface(id) {
    const resp = await this.delete(id);
    return resp.data;
  }

  /**
   * Bulk update surfaces
   * @param {Array<string>} ids
   * @param {object} data - field cần update
   */
  async bulkEdit(ids, data) {
    const payload = {};

    ids.forEach((id) => {
      payload[id] = data;
    });

    const resp = await this.patch("", payload);
    return resp.data;
  }

  /**
   * Inline edit (PATCH 1 surface)
   */
  async patchSurface(id, data) {
    const resp = await this.patch(id, data);
    return resp.data;
  }

  /**
   * Bulk delete surfaces
   */
  async bulkDelete(ids) {
    const payload = {};

    ids.forEach((id) => {
      payload[id] = null;
    });

    const resp = await this.patch("", payload);
    return resp.data;
  }

  /**
   * Import surfaces
   */
  async importSurfaces(data) {
    // data = object nhiều surface
    const resp = await this.patch("", data);
    return resp.data;
  }
  /**
   * Export surfaces
   */
  async exportSurfaces() {
    const resp = await this.getAll();
    return resp.data;
  }
}
