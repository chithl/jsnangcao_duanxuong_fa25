import { ValidateAPI } from "./validate.js";

/**
 * ColorPaletteValidate - Validation cho Color Palettes
 * Kiểm tra cấu trúc dữ liệu bảng màu:
 * - name: tên bảng màu (bắt buộc, không được trống)
 * - notes: ghi chú (không bắt buộc)
 * - is_active: trạng thái (bắt buộc, TRUE/FALSE)
 * 
 * Báo lỗi nếu:
 * - Thiếu trường bắt buộc
 * - Truyền thừa trường không nằm trong cấu trúc
 * - Dữ liệu không đúng định dạng
 */
export class ColorPaletteValidate extends ValidateAPI {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu Color Palette
     * @param {object} data - Dữ liệu cần validate
     * @param {boolean} isUpdate - true nếu đang update (cho phép thiếu một số field)
     * @returns {object} {isValid: boolean, errors: array}
     */
    checkValidate(data, isUpdate = false) {
        let errors = [];
        
        // Danh sách trường hợp lệ trong cấu trúc bảng
        const validFields = ['name', 'notes', 'is_active'];
        
        // Kiểm tra trường thừa (không nằm trong cấu trúc)
        const dataFields = Object.keys(data);
        const extraFields = dataFields.filter(field => !validFields.includes(field));
        
        if (extraFields.length > 0) {
            errors.push({
                field: "structure",
                message: `Trường không hợp lệ: ${extraFields.join(', ')}. Chỉ chấp nhận: ${validFields.join(', ')}`
            });
        }

        // Kiểm tra trường bắt buộc: name
        if (!isUpdate || data.hasOwnProperty('name')) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim() === "") {
                errors.push({
                    field: "name",
                    message: "Tên bảng màu không được để trống"
                });
            } else if (data.name.length > 255) {
                errors.push({
                    field: "name",
                    message: "Tên bảng màu không được vượt quá 255 ký tự"
                });
            }
        } else if (!isUpdate) {
            errors.push({
                field: "name",
                message: "Thiếu trường bắt buộc: name"
            });
        }

        // Kiểm tra notes (không bắt buộc)
        if (data.hasOwnProperty('notes')) {
            if (typeof data.notes !== 'string') {
                errors.push({
                    field: "notes",
                    message: "Ghi chú phải là chuỗi văn bản"
                });
            } else if (data.notes.length > 1000) {
                errors.push({
                    field: "notes",
                    message: "Ghi chú không được vượt quá 1000 ký tự"
                });
            }
        }

        // Kiểm tra is_active (bắt buộc)
        if (!isUpdate || data.hasOwnProperty('is_active')) {
            if (!data.hasOwnProperty('is_active')) {
                if (!isUpdate) {
                    errors.push({
                        field: "is_active",
                        message: "Thiếu trường bắt buộc: is_active"
                    });
                }
            } else {
                const validValues = ['TRUE', 'FALSE', true, false, 'true', 'false', '1', '0', 1, 0];
                if (!validValues.includes(data.is_active)) {
                    errors.push({
                        field: "is_active",
                        message: "Trạng thái is_active phải là TRUE hoặc FALSE"
                    });
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate cho bulk operations
     * @param {array} items - Mảng các object cần validate
     * @param {boolean} isUpdate - true nếu đang update
     * @returns {object} {isValid: boolean, errors: object}
     */
    checkBulkValidate(items, isUpdate = false) {
        if (!Array.isArray(items)) {
            return {
                isValid: false,
                errors: [{ field: "bulk", message: "Dữ liệu bulk phải là một mảng" }]
            };
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

        return {
            isValid: !hasError,
            errors: hasError ? bulkErrors : []
        };
    }

}
