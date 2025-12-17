import { ValidateAPI } from "./validate.js";

// Validate dữ liệu Colors (sản phẩm màu hoàn thiện)
// Cấu trúc yêu cầu: base, code, hex, name, palette_id
export class ColorValidate extends ValidateAPI {
	/**
	 * Kiểm tra tính hợp lệ của dữ liệu color
	 * @param {object} data
	 * @param {boolean} isUpdate - true cho phép thiếu field bắt buộc
	 * @returns {{isValid: boolean, errors: Array}}
	 */
	checkValidate(data, isUpdate = false) {
		const errors = [];
		const validFields = ["base", "code", "hex", "name", "palette_id"];

		// Trường thừa
		const dataFields = Object.keys(data || {});
		const extraFields = dataFields.filter((field) => !validFields.includes(field));
		if (extraFields.length > 0) {
			errors.push({
				field: "structure",
				message: `Trường không hợp lệ: ${extraFields.join(", ")}. Chỉ chấp nhận: ${validFields.join(", ")}`
			});
		}

		// base
		if (!isUpdate || data.hasOwnProperty("base")) {
			if (!data?.base || typeof data.base !== "string" || data.base.trim() === "") {
				errors.push({ field: "base", message: "Base không được để trống" });
			} else if (data.base.length > 50) {
				errors.push({ field: "base", message: "Base không được vượt quá 50 ký tự" });
			}
		} else if (!isUpdate) {
			errors.push({ field: "base", message: "Thiếu trường bắt buộc: base" });
		}

		// code
		if (!isUpdate || data.hasOwnProperty("code")) {
			if (!data?.code || typeof data.code !== "string" || data.code.trim() === "") {
				errors.push({ field: "code", message: "Code không được để trống" });
			} else if (data.code.length > 100) {
				errors.push({ field: "code", message: "Code không được vượt quá 100 ký tự" });
			}
		} else if (!isUpdate) {
			errors.push({ field: "code", message: "Thiếu trường bắt buộc: code" });
		}

		// hex
		if (!isUpdate || data.hasOwnProperty("hex")) {
			if (!data?.hex || typeof data.hex !== "string" || data.hex.trim() === "") {
				errors.push({ field: "hex", message: "Mã hex không được để trống" });
			} else {
				const hexPattern = /^#([A-Fa-f0-9]{6})$/;
				if (!hexPattern.test(data.hex)) {
					errors.push({ field: "hex", message: "Mã hex phải dạng #RRGGBB" });
				}
			}
		} else if (!isUpdate) {
			errors.push({ field: "hex", message: "Thiếu trường bắt buộc: hex" });
		}

		// name
		if (!isUpdate || data.hasOwnProperty("name")) {
			if (!data?.name || typeof data.name !== "string" || data.name.trim() === "") {
				errors.push({ field: "name", message: "Tên màu không được để trống" });
			} else if (data.name.length > 255) {
				errors.push({ field: "name", message: "Tên màu không được vượt quá 255 ký tự" });
			}
		} else if (!isUpdate) {
			errors.push({ field: "name", message: "Thiếu trường bắt buộc: name" });
		}

		// palette_id
		if (!isUpdate || data.hasOwnProperty("palette_id")) {
			if (!data?.palette_id || typeof data.palette_id !== "string" || data.palette_id.trim() === "") {
				errors.push({ field: "palette_id", message: "Palette_id không được để trống" });
			} else if (data.palette_id.length > 255) {
				errors.push({ field: "palette_id", message: "Palette_id không được vượt quá 255 ký tự" });
			}
		} else if (!isUpdate) {
			errors.push({ field: "palette_id", message: "Thiếu trường bắt buộc: palette_id" });
		}

		return { isValid: errors.length === 0, errors };
	}

	/**
	 * Validate cho bulk operations
	 * @param {Array} items
	 * @param {boolean} isUpdate
	 */
	checkBulkValidate(items, isUpdate = false) {
		if (!Array.isArray(items)) {
			return { isValid: false, errors: [{ field: "bulk", message: "Dữ liệu bulk phải là một mảng" }] };
		}

		const bulkErrors = {};
		let hasError = false;

		items.forEach((item, index) => {
			const validation = this.checkValidate(item, isUpdate);
			if (!validation.isValid) {
				bulkErrors[index] = validation.errors;
				hasError = true;
			}
		});

		return { isValid: !hasError, errors: hasError ? bulkErrors : [] };
	}
}
