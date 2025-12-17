import { BaseAPI } from "./BaseAPI.js";

/**
 * Lớp API cho quản lý sản phẩm (products)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 *
 * Chức năng:
 * - CRUD sản phẩm
 * - Search / Filter / Sort / Paginate
 * - Validate trùng name / sku / slug
 * - Soft delete / restore
 * - Bulk action
 * - Import / Export
 * - Upload ảnh sản phẩm
 *
 * @extends BaseAPI
 */
export class ProductAPI extends BaseAPI {
  /**
   * Khởi tạo ProductAPI
   * @param {object} [params] - Tham số truy vấn mặc định
   * @param {object} [data] - Dữ liệu mặc định
   */
  constructor(params, data) {
    super("products", params, data);
  }

  /* ===================== BASIC CRUD ===================== */

  /**
   * Lấy danh sách sản phẩm
   * Hỗ trợ search / filter / sort / paginate
   * @param {object} params
   * @returns {Promise<Array|any>}
   */
  async getAllProduct(params = {}) {
    let resp = await this.getAll(params);
    return resp.data;
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string|number} id
   * @returns {Promise<object|any>}
   */
  async getOneProduct(id) {
    let resp = await this.getOne(id);
    console.log(resp.data);
    
    return resp.data;
  }

  /**
   * Tạo mới sản phẩm
   * @param {object} data
   * @returns {Promise<object|any>}
   */
  async storeProduct(data) {
    let resp = await this.store(data);
    return resp.data;
  }

  /**
   * Cập nhật toàn bộ thông tin sản phẩm
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<object|any>}
   */
  async updateProduct(id, data) {
    let resp = await this.update(id, data);
    return resp.data;
  }

  /**
   * Cập nhật nhanh 1 hoặc vài field (PATCH)
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<object|any>}
   */
  async patchProduct(id, data) {
    let resp = await this.patch(id, data);
    return resp.data;
  }

  /**
   * Xóa sản phẩm
   * Mặc định là soft delete
   * @param {string|number} id
   * @param {boolean} hard - true = hard delete
   * @returns {Promise<object|any>}
   */
  async deleteProduct(id, hard = false) {
    let resp = await this.delete(id, { hard });
    return resp.data;
  }

  /**
   * Khôi phục sản phẩm đã xóa (soft delete)
   * @param {string|number} id
   * @returns {Promise<object|any>}
   */
  async restoreProduct(id) {
    let resp = await this.patch(id, { deleted_at: null });
    return resp.data;
  }

  /* ===================== VALIDATION ===================== */

  /**
   * Kiểm tra trùng tên sản phẩm
   * @param {string} name
   * @param {string|number|null} excludeId - id hiện tại (khi update)
   * @returns {Promise<boolean>}
   */
  async checkDuplicateName(name, excludeId = null) {
    let params = { name };
    if (excludeId) params.exclude_id = excludeId;

    let resp = await this.getAll(params);
    return resp.data.length > 0;
  }

  /**
   * Kiểm tra trùng SKU
   * @param {string} sku
   * @param {string|number|null} excludeId
   * @returns {Promise<boolean>}
   */
  async checkDuplicateSKU(sku, excludeId = null) {
    let params = { sku };
    if (excludeId) params.exclude_id = excludeId;

    let resp = await this.getAll(params);
    return resp.data.length > 0;
  }

  /**
   * Kiểm tra trùng slug
   * @param {string} slug
   * @param {string|number|null} excludeId
   * @returns {Promise<boolean>}
   */
  async checkDuplicateSlug(slug, excludeId = null) {
    let params = { slug };
    if (excludeId) params.exclude_id = excludeId;

    let resp = await this.getAll(params);
    return resp.data.length > 0;
  }

  /* ===================== SEARCH / FILTER ===================== */

  /**
   * Tìm kiếm sản phẩm theo tên
   * @param {string} keyword
   * @returns {Promise<Array|any>}
   */
  async searchProductByName(keyword) {
    let resp = await this.getAll({ name_like: keyword });
    return resp.data;
  }

  /**
   * Lọc sản phẩm theo nhiều điều kiện
   * @param {object} filters
   * @returns {Promise<Array|any>}
   */
  async filterProducts(filters) {
    let resp = await this.getAll(filters);
    return resp.data;
  }

  /* ===================== BULK ACTION ===================== */

  /**
   * Thao tác hàng loạt (update / delete / change status)
   * @param {object} data
   * @returns {Promise<object|any>}
   */
  async bulkAction(data) {
    let resp = await this.post("bulk", data);
    return resp.data;
  }

  /* ===================== IMPORT / EXPORT ===================== */

  /**
   * Import sản phẩm từ file CSV / JSON
   * @param {FormData} formData
   * @returns {Promise<object|any>}
   */
  async importProducts(formData) {
    let resp = await this.post("import", formData);
    return resp.data;
  }

  /**
   * Export sản phẩm ra CSV / JSON
   * @param {object} params
   * @returns {Promise<object|any>}
   */
  async exportProducts(params = {}) {
    let resp = await this.post("export", params);
    return resp.data;
  }

  /* ===================== UPLOAD ===================== */

  /**
   * Upload ảnh sản phẩm
   * @param {FormData} formData
   * @returns {Promise<object|any>}
   */
  async uploadProductImage(formData) {
    let resp = await this.post("upload", formData);
    return resp.data;
  }
}
