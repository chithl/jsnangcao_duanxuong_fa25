import { ValidateAPI } from "./validate.js";

export class AddressesValidate extends ValidateAPI {
	/**
	 * Validate payload cho địa chỉ người dùng
	 * @param {object} data
	 * @param {boolean} isNew - true khi tạo mới, false khi cập nhật
	 * @returns {{isValid: boolean, errors: Array<{field?: string, message: string}>}}
	 */
	checkValidate(data, isNew = true) {
		const errors = [];

		const requireField = (value, field, message) => {
			if (value === undefined || value === null) {
				errors.push({ field, message });
				return;
			}

			if (typeof value === "string" && value.trim() === "") {
				errors.push({ field, message });
			}
		};

		if (isNew) {
			requireField(data.user_id, "user_id", "User không được để trống");
			requireField(data.receiver_name, "receiver_name", "Tên người nhận không được để trống");
			requireField(data.phone, "phone", "Số điện thoại không được để trống");
			requireField(data.line1, "line1", "Địa chỉ chi tiết không được để trống");
			requireField(data.ward, "ward", "Quận/Huyện không được để trống");
			requireField(data.city, "city", "Thành phố không được để trống");
		} else {
			if (data.user_id !== undefined) {
				requireField(data.user_id, "user_id", "User không được để trống");
			}
			if (data.receiver_name !== undefined) {
				requireField(data.receiver_name, "receiver_name", "Tên người nhận không được để trống");
			}
			if (data.phone !== undefined) {
				requireField(data.phone, "phone", "Số điện thoại không được để trống");
			}
			if (data.line1 !== undefined) {
				requireField(data.line1, "line1", "Địa chỉ chi tiết không được để trống");
			}
			if (data.ward !== undefined) {
				requireField(data.ward, "ward", "Quận/Huyện không được để trống");
			}
			if (data.city !== undefined) {
				requireField(data.city, "city", "Thành phố không được để trống");
			}
		}

		const phoneToCheck = data.phone ?? "";
		if (phoneToCheck !== "") {
			const phone = String(phoneToCheck).trim();
			const phoneRegex = /^0\d{9,10}$/;
			if (!phoneRegex.test(phone)) {
				errors.push({ field: "phone", message: "Số điện thoại phải có 10-11 số và bắt đầu bằng 0" });
			}
		}

		if (data.is_default !== undefined && typeof data.is_default !== "boolean") {
			errors.push({ field: "is_default", message: "is_default phải là boolean" });
		}

		if (data.note !== undefined && typeof data.note !== "string") {
			errors.push({ field: "note", message: "Ghi chú phải là chuỗi" });
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
}
