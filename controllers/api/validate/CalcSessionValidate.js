import { ValidateAPI } from "./validate.js";

/**
 * Lớp validate cho Calculation Session API
 * Kiểm tra tính hợp lệ của dữ liệu phiên tính toán sơn
 * 
 * @extends ValidateAPI
 */
export class CalcSessionValidate extends ValidateAPI {
  /**
   * Kiểm tra validate dữ liệu calc_session
   * @param {object} data - Dữ liệu cần validate
   * @param {string} [mode='create'] - Mode: 'create', 'update', 'patch'
   * @returns {Array<object>} Mảng các lỗi validate (rỗng nếu hợp lệ)
   */
  checkValidate(data, mode = "create") {
    let errors = [];
    const isPatch = mode === "patch";
    const isCreate = mode === "create";

    // Helper function để kiểm tra xem có cần validate field này không
    const shouldCheck = (field) => !isPatch || field in data;

    // ============ VALIDATE SURFACE_ID (Required - Foreign Key) ============
    if (shouldCheck("surface_id")) {
      if (!data.surface_id || data.surface_id.toString().trim() === "") {
        errors.push({
          field: "surface_id",
          message: "ID bề mặt (surface_id) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (typeof data.surface_id !== "string") {
        errors.push({
          field: "surface_id",
          message: "ID bề mặt (surface_id) phải là chuỗi ký tự",
          code: "INVALID_TYPE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "surface_id",
        message: "ID bề mặt (surface_id) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE COVERAGE_RULE_ID (Required) ============
    if (shouldCheck("coverage_rule_id")) {
      if (
        !data.coverage_rule_id ||
        data.coverage_rule_id.toString().trim() === ""
      ) {
        errors.push({
          field: "coverage_rule_id",
          message: "ID quy tắc phủ (coverage_rule_id) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (typeof data.coverage_rule_id !== "string") {
        errors.push({
          field: "coverage_rule_id",
          message: "ID quy tắc phủ (coverage_rule_id) phải là chuỗi ký tự",
          code: "INVALID_TYPE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "coverage_rule_id",
        message: "ID quy tắc phủ (coverage_rule_id) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE COVER_M2_PER_L (Required, Positive Number) ============
    if (shouldCheck("cover_m2_per_L")) {
      const coverM2PerL = Number(data.cover_m2_per_L);

      if (
        data.cover_m2_per_L === null ||
        data.cover_m2_per_L === undefined ||
        data.cover_m2_per_L === ""
      ) {
        errors.push({
          field: "cover_m2_per_L",
          message: "Độ phủ (cover_m2_per_L) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (!Number.isFinite(coverM2PerL)) {
        errors.push({
          field: "cover_m2_per_L",
          message: "Độ phủ (cover_m2_per_L) phải là số hợp lệ",
          code: "INVALID_TYPE",
        });
      } else if (coverM2PerL <= 0) {
        errors.push({
          field: "cover_m2_per_L",
          message: "Độ phủ (cover_m2_per_L) phải lớn hơn 0",
          code: "INVALID_RANGE",
        });
      } else if (coverM2PerL > 100) {
        // Reasonable upper limit
        errors.push({
          field: "cover_m2_per_L",
          message: "Độ phủ (cover_m2_per_L) không hợp lý (tối đa 100 m²/L)",
          code: "INVALID_RANGE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "cover_m2_per_L",
        message: "Độ phủ (cover_m2_per_L) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE COATS (Required, Positive Integer) ============
    if (shouldCheck("coats")) {
      const coats = Number(data.coats);

      if (
        data.coats === null ||
        data.coats === undefined ||
        data.coats === ""
      ) {
        errors.push({
          field: "coats",
          message: "Số lớp sơn (coats) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (!Number.isFinite(coats)) {
        errors.push({
          field: "coats",
          message: "Số lớp sơn (coats) phải là số hợp lệ",
          code: "INVALID_TYPE",
        });
      } else if (!Number.isInteger(coats) || coats < 1) {
        errors.push({
          field: "coats",
          message: "Số lớp sơn (coats) phải là số nguyên dương (tối thiểu 1)",
          code: "INVALID_RANGE",
        });
      } else if (coats > 10) {
        // Reasonable upper limit
        errors.push({
          field: "coats",
          message: "Số lớp sơn (coats) không hợp lý (tối đa 10 lớp)",
          code: "INVALID_RANGE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "coats",
        message: "Số lớp sơn (coats) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE WASTAGE_PCT (Required, 0-1 or 0-100%) ============
    if (shouldCheck("wastage_pct")) {
      const wastagePct = Number(data.wastage_pct);

      if (
        data.wastage_pct === null ||
        data.wastage_pct === undefined ||
        data.wastage_pct === ""
      ) {
        errors.push({
          field: "wastage_pct",
          message: "Tỷ lệ hao hụt (wastage_pct) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (!Number.isFinite(wastagePct)) {
        errors.push({
          field: "wastage_pct",
          message: "Tỷ lệ hao hụt (wastage_pct) phải là số hợp lệ",
          code: "INVALID_TYPE",
        });
      } else if (wastagePct < 0) {
        errors.push({
          field: "wastage_pct",
          message: "Tỷ lệ hao hụt (wastage_pct) không được âm",
          code: "INVALID_RANGE",
        });
      } else if (wastagePct > 1 && wastagePct <= 100) {
        // Warning: looks like percentage instead of decimal
        errors.push({
          field: "wastage_pct",
          message:
            "Tỷ lệ hao hụt (wastage_pct) nên là giá trị thập phân (0.0-1.0). Ví dụ: 0.08 cho 8%",
          code: "INVALID_FORMAT",
        });
      } else if (wastagePct > 1) {
        errors.push({
          field: "wastage_pct",
          message:
            "Tỷ lệ hao hụt (wastage_pct) phải nằm trong khoảng 0.0-1.0 (0%-100%)",
          code: "INVALID_RANGE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "wastage_pct",
        message: "Tỷ lệ hao hụt (wastage_pct) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE LITRES_NEEDED (Required, Positive Number) ============
    if (shouldCheck("litres_needed")) {
      const litresNeeded = Number(data.litres_needed);

      if (
        data.litres_needed === null ||
        data.litres_needed === undefined ||
        data.litres_needed === ""
      ) {
        errors.push({
          field: "litres_needed",
          message: "Số lít cần thiết (litres_needed) không được để trống",
          code: "REQUIRED_FIELD",
        });
      } else if (!Number.isFinite(litresNeeded)) {
        errors.push({
          field: "litres_needed",
          message: "Số lít cần thiết (litres_needed) phải là số hợp lệ",
          code: "INVALID_TYPE",
        });
      } else if (litresNeeded <= 0) {
        errors.push({
          field: "litres_needed",
          message: "Số lít cần thiết (litres_needed) phải lớn hơn 0",
          code: "INVALID_RANGE",
        });
      } else if (litresNeeded > 10000) {
        // Reasonable upper limit
        errors.push({
          field: "litres_needed",
          message:
            "Số lít cần thiết (litres_needed) vượt quá giới hạn hợp lý (10000L)",
          code: "INVALID_RANGE",
        });
      }
    } else if (isCreate) {
      errors.push({
        field: "litres_needed",
        message: "Số lít cần thiết (litres_needed) là trường bắt buộc",
        code: "REQUIRED_FIELD",
      });
    }

    // ============ VALIDATE SUGGESTION (Optional, String) ============
    if (shouldCheck("suggestion") && data.suggestion !== undefined && data.suggestion !== null) {
      if (typeof data.suggestion !== "string") {
        errors.push({
          field: "suggestion",
          message: "Gợi ý (suggestion) phải là chuỗi ký tự",
          code: "INVALID_TYPE",
        });
      } else if (data.suggestion.length > 1000) {
        errors.push({
          field: "suggestion",
          message: "Gợi ý (suggestion) không được vượt quá 1000 ký tự",
          code: "INVALID_LENGTH",
        });
      }
    }

    // ============ VALIDATE CREATE_AT (Optional for create, auto-generated) ============
    if (shouldCheck("create_at") && data.create_at) {
      const createAt = new Date(data.create_at);
      if (isNaN(createAt.getTime())) {
        errors.push({
          field: "create_at",
          message: "Ngày tạo (create_at) không hợp lệ",
          code: "INVALID_DATE",
        });
      }
    }

    // ============ CROSS-FIELD VALIDATION ============
    // Validate calculation logic if all required fields are present
    if (
      data.cover_m2_per_L &&
      data.coats &&
      data.wastage_pct !== undefined &&
      data.litres_needed &&
      data.area_m2
    ) {
      const coverM2PerL = Number(data.cover_m2_per_L);
      const coats = Number(data.coats);
      const wastagePct = Number(data.wastage_pct);
      const litresNeeded = Number(data.litres_needed);
      const areaM2 = Number(data.area_m2);

      if (
        Number.isFinite(coverM2PerL) &&
        Number.isFinite(coats) &&
        Number.isFinite(wastagePct) &&
        Number.isFinite(litresNeeded) &&
        Number.isFinite(areaM2)
      ) {
        const expectedLitres =
          ((areaM2 * coats) / coverM2PerL) * (1 + wastagePct);
        const tolerance = 0.1; // 10% tolerance

        if (
          Math.abs(litresNeeded - expectedLitres) / expectedLitres >
          tolerance
        ) {
          errors.push({
            field: "litres_needed",
            message: `Số lít tính toán không khớp. Dự kiến: ${expectedLitres.toFixed(2)}L, nhận được: ${litresNeeded}L`,
            code: "CALCULATION_MISMATCH",
          });
        }
      }
    }

    return errors;
  }

  /**
   * Kiểm tra validate cho bulk operations
   * @param {Array<object>} dataArray - Mảng dữ liệu cần validate
   * @param {string} [mode='create'] - Mode validate
   * @returns {object} Object chứa kết quả validate cho từng item
   */
  validateBulk(dataArray, mode = "create") {
    if (!Array.isArray(dataArray)) {
      return {
        success: false,
        error: "Data must be an array",
      };
    }

    const results = dataArray.map((data, index) => {
      const errors = this.checkValidate(data, mode);
      return {
        index,
        data,
        valid: errors.length === 0,
        errors,
      };
    });

    const validCount = results.filter((r) => r.valid).length;

    return {
      success: true,
      total: dataArray.length,
      valid: validCount,
      invalid: dataArray.length - validCount,
      results,
    };
  }

  /**
   * Validate import data
   * @param {Array<object>} importData - Dữ liệu import
   * @returns {object} Kết quả validate
   */
  validateImport(importData) {
    return this.validateBulk(importData, "create");
  }

  /**
   * Validate calculation parameters
   * @param {object} params - Tham số tính toán
   * @returns {Array<object>} Mảng lỗi
   */
  validateCalculationParams(params) {
    const errors = [];

    if (!params.area_m2 || Number(params.area_m2) <= 0) {
      errors.push({
        field: "area_m2",
        message: "Diện tích (area_m2) phải lớn hơn 0",
        code: "INVALID_PARAM",
      });
    }

    if (!params.cover_m2_per_L || Number(params.cover_m2_per_L) <= 0) {
      errors.push({
        field: "cover_m2_per_L",
        message: "Độ phủ (cover_m2_per_L) phải lớn hơn 0",
        code: "INVALID_PARAM",
      });
    }

    if (!params.coats || Number(params.coats) < 1) {
      errors.push({
        field: "coats",
        message: "Số lớp sơn (coats) phải từ 1 trở lên",
        code: "INVALID_PARAM",
      });
    }

    if (params.wastage_pct === undefined || Number(params.wastage_pct) < 0) {
      errors.push({
        field: "wastage_pct",
        message: "Tỷ lệ hao hụt (wastage_pct) không được âm",
        code: "INVALID_PARAM",
      });
    }

    return errors;
  }
}
