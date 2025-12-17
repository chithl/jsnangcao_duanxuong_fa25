import { ValidateAPI } from "./validate";

export class SurfacesValidate extends ValidateAPI {
  checkValidate(data, mode = "create") {
    let errors = [];
    const isPatch = mode === "patch";
    const shouldCheck = (field) => !isPatch || field in data;

    if (shouldCheck("room_id")) {
      if (!data.room_id || data.room_id.toString().trim() === "") {
        errors.push({
          field: "room_id",
          message: "ID phòng không được để trống",
        });
      }
    }

    if (shouldCheck("type")) {
      if (!data.type || data.type.trim() === "") {
        errors.push({
          field: "type",
          message: "Loại bề mặt không được để trống",
        });
      }
    }

    if (shouldCheck("area_m2")) {
      const area = Number(data.area_m2);
      if (!Number.isFinite(area) || area <= 0) {
        errors.push({
          field: "area_m2",
          message: "Diện tích bề mặt phải là số lớn hơn 0",
        });
      }
    }

    if (shouldCheck("surface_type")) {
      if (!data.surface_type || data.surface_type.trim() === "") {
        errors.push({
          field: "surface_type",
          message: "Loại vật liệu bề mặt không được để trống",
        });
      }
    }

    if (shouldCheck("product_id")) {
      if (!data.product_id || data.product_id.toString().trim() === "") {
        errors.push({
          field: "product_id",
          message: "ID sản phẩm không được để trống",
        });
      }
    }

    if (shouldCheck("coats")) {
      const coats = Number(data.coats);
      if (!Number.isInteger(coats) || coats < 1) {
        errors.push({
          field: "coats",
          message: "Số lớp sơn phải là số nguyên ≥ 1",
        });
      }
    }

    if (shouldCheck("wastage_pct")) {
      const wastage = Number(data.wastage_pct);
      if (!Number.isFinite(wastage) || wastage < 0) {
        errors.push({
          field: "wastage_pct",
          message: "Tỷ lệ hao hụt phải là số không âm",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
