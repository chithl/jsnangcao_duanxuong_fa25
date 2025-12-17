import { ValidateAPI } from "./validate";
import { VariantAPI } from "../VariantAPI.js";

export class VariantValidate extends ValidateAPI {
  constructor() {
    super();
    this.variantAPI = new VariantAPI();
  }

  /**
   * @param {object} data
   * @param {"create"|"update"} mode
   */
  async checkValidate(data, mode = "create") {
    let errors = [];

    /* ===== SKU ===== */
    if (!data.sku || data.sku.trim() === "") {
      errors.push({
        field: "sku",
        message: "SKU không được để trống",
      });
    } else {
      const isDuplicate = await this.variantAPI.checkDuplicateSKU(
        data.sku,
        data.product_id,
        mode === "update" ? data.id : null
      );

      if (isDuplicate) {
        errors.push({
          field: "sku",
          message: "SKU đã tồn tại trong sản phẩm này",
        });
      }
    }

    /* ===== SIZE ===== */
    if (!data.size || data.size.trim() === "") {
      errors.push({
        field: "size",
        message: "Kích thước không được để trống",
      });
    }

    /* ===== VARIANT KEY (size + color) ===== */
    if (data.size && data.color) {
      const isDuplicateVariant = await this.variantAPI.checkDuplicateVariantKey(
        data.product_id,
        {
          size: data.size,
          color: data.color,
        },
        mode === "update" ? data.id : null
      );

      if (isDuplicateVariant) {
        errors.push({
          field: "variant",
          message: "Biến thể này đã tồn tại",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
