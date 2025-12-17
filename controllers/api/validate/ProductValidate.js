import { ValidateAPI } from "./validate";
import { ProductAPI } from "../ProductAPI.js";

export class ProductValidate extends ValidateAPI {
  constructor() {
    super();
    this.productAPI = new ProductAPI();
  }
  async checkValidate(data, mode = "create") {
    let errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push({
        field: "name",
        message: "Tên sản phẩm không được để trống",
      });
    } else {
      const isDuplicate = await this.productAPI.checkDuplicateName(
        data.name,
        mode === "update" ? data.id : null
      );

      if (isDuplicate) {
        errors.push({
          field: "name",
          message: "Tên sản phẩm đã tồn tại",
        });
      }
    }

    if (!data.sku || data.sku.trim() === "") {
      errors.push({
        field: "sku",
        message: "SKU không được để trống",
      });
    } else {
      const isDuplicateSku = await this.productAPI.checkDuplicateSKU(
        data.sku,
        mode === "update" ? data.id : null
      );

      if (isDuplicateSku) {
        errors.push({
          field: "sku",
          message: "SKU đã tồn tại",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
