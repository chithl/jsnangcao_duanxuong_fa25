import { BaseAPI } from "./BaseAPI.js";

/**
 * API quản lý biến thể sản phẩm (Variants)
 * Mỗi variant thuộc về 1 product
 *
 * @extends BaseAPI
 */
export class VariantAPI extends BaseAPI {
  constructor(params, data) {
    super("product_variants", params, data);
  }

  /**
   * Lấy danh sách biến thể của 1 sản phẩm
   * GET /api/products/:productId/variants
   */
// File: VariantAPI.js
async getVariantsByProduct(productId) {
    let resp = await this.getAll();
    const payload = resp.data;
    if (!payload) return [];

    let normalized = [];
    
    // Kiểm tra nếu payload là một Object (Firebase thường trả về Object với ID là Key)
    if (typeof payload === 'object' && !Array.isArray(payload)) {
        // Kiểm tra xem đây là một danh sách các biến thể hay chỉ là MỘT biến thể duy nhất
        const keys = Object.keys(payload);
        const isMultiple = keys.length > 0 && typeof payload[keys[0]] === 'object';

        if (isMultiple) {
            // Trường hợp nhiều biến thể: { id1: {data}, id2: {data} }
            normalized = Object.entries(payload).map(([key, value]) => ({
                id: key,
                ...value
            }));
        } else {
            // Trường hợp chỉ có 1 biến thể duy nhất: { price: ..., sku: ... }
            normalized = [{ id: "single", ...payload }];
        }
    } else if (Array.isArray(payload)) {
        normalized = payload.filter(Boolean);
    }

    console.log("Dữ liệu đã chuẩn hóa:", normalized);

    // Lọc theo product_id
    return normalized.filter(item => 
        String(item.product_id || item.productId || "") === String(productId)
    );
}

  /**
   * Lấy chi tiết 1 biến thể
   * GET /api/variants/:id
   */
  async getOneVariant(id) {
    let resp = await this.getOne(id);
    return resp.data;
  }

  /**
   * Tạo biến thể cho sản phẩm
   * POST /api/products/:productId/variants
   */
  async storeVariant(productId, data) {
    let resp = await this.store({
      ...data,
      product_id: productId,
    });
    return resp.data;
  }

  /**
   * Cập nhật biến thể
   * PUT /api/variants/:id
   */
  async updateVariant(id, data) {
    let resp = await this.update(id, data);
    return resp.data;
  }

  /**
   * Cập nhật nhanh (status / price / image)
   * PATCH /api/variants/:id
   */
  async patchVariant(id, data) {
    let resp = await this.patch(id, data);
    return resp.data;
  }

  /**
   * Xóa biến thể
   * DELETE /api/variants/:id
   * (backend xử lý soft / hard + check order / inventory)
   */
  async deleteVariant(id) {
    let resp = await this.delete(id);
    return resp.data;
  }

  /**
   * Kiểm tra trùng SKU trong cùng product
   */
  async checkDuplicateSKU(sku, productId, variantId = null) {
    let params = { sku, product_id: productId };
    if (variantId) params.exclude_id = variantId;

    let resp = await this.getAll(params);
    return resp.data.length > 0;
  }

  /**
   * Kiểm tra trùng tổ hợp variant (color + size + material)
   */
  async checkDuplicateVariantKey(productId, attrs, variantId = null) {
    let params = {
      product_id: productId,
      ...attrs, // color, size, material...
    };

    if (variantId) params.exclude_id = variantId;

    let resp = await this.getAll(params);
    return resp.data.length > 0;
  }

  /**
   * Import variants
   */
  async importVariants(data) {
    let resp = await this.post("variants/import", data);
    return resp.data;
  }

  /**
   * Export variants
   */
  async exportVariants(params) {
    let resp = await this.post("variants/export", params);
    return resp.data;
  }
}
