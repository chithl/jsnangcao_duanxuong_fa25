import { ValidateAPI } from "./validate.js";
import { CategoryAPI } from "../CategoryAPI.js";

export class CategoryValidate extends ValidateAPI {
    constructor() {
        super();
        this.CategoryModule = new CategoryAPI();
    }

    async checkValidate(data, mode = "create") {
        let errors = [];
        
        if (!data.name || data.name.trim() === "") {
            errors.push({
                field: "name",
                message: "Tên danh mục không được để trống!",
            });
        } else {
            const isDuplicate = await this.CategoryModule.checkDuplicateName(
                data.name,
                mode === "update" ? data.id : null
            );

            if (isDuplicate) {
                errors.push({
                    field: "name",
                    message: "Tên danh mục đã tồn tại!",
                });
            }
        }

        if (!data.description || data.description.trim() === ""){
            errors.push({
                field: "description",
                message: "Mô tả không được để trống!",
            });
        }

        if (!data.is_active || data.is_active.trim() === "") {
            errors.push({
                field: "is_active",
                message: "Trạng thái không được để trống!",
            })
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}