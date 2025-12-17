import { ValidateAPI } from "./validate.js";

export class RoomValidate extends ValidateAPI {
    /**
     * Kiểm tra dữ liệu phòng (room)
     * @param {object} data
     * @returns {{isError: boolean, errors: object}}
     */
    checkValidate(data) {
        const errors = {};

        // project_id - bắt buộc
        if (!data.project_id || typeof data.project_id !== "string") {
            errors.project_id = "Project ID là bắt buộc và phải là chuỗi.";
        }

        // name - bắt buộc
        if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
            errors.name = "Tên phòng là bắt buộc.";
        }

        // length_m - optional nhưng nếu có phải là number >= 0
        if (data.length_m !== undefined) {
            if (isNaN(data.length_m) || Number(data.length_m) < 0) {
                errors.length_m = "Chiều dài phải là số >= 0.";
            }
        }

        // width_m
        if (data.width_m !== undefined) {
            if (isNaN(data.width_m) || Number(data.width_m) < 0) {
                errors.width_m = "Chiều rộng phải là số >= 0.";
            }
        }

        // height_m
        if (data.height_m !== undefined) {
            if (isNaN(data.height_m) || Number(data.height_m) < 0) {
                errors.height_m = "Chiều cao phải là số >= 0.";
            }
        }

        // door_area_m2
        if (data.door_area_m2 !== undefined) {
            if (isNaN(data.door_area_m2) || Number(data.door_area_m2) < 0) {
                errors.door_area_m2 = "Diện tích cửa phải là số >= 0.";
            }
        }

        // window_area_m2
        if (data.window_area_m2 !== undefined) {
            if (isNaN(data.window_area_m2) || Number(data.window_area_m2) < 0) {
                errors.window_area_m2 = "Diện tích cửa sổ phải là số >= 0.";
            }
        }

        // paint_ceiling - bắt buộc boolean
        if (typeof data.paint_ceiling !== "boolean") {
            errors.paint_ceiling = "paint_ceiling là bắt buộc và phải là boolean.";
        }

        return {
            isError: Object.keys(errors).length > 0,
            errors
        };
    }
}
