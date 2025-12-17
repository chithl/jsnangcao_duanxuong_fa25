import { ValidateAPI } from "./validate.js";

export class ReviewValidate extends ValidateAPI {
  checkValidate(data) {
    let errors = [];

    if(!data.sku || data.sku.trim() === "") {
      errors.push({ field: "sku", message: "SKU không được để trống"});
    }

    if (!data.content || data.content.trim() === "") {
      errors.push({ field: "content", message: "Nội dung không được để trống"});
    }

    if (data.rating === undefined || data.rating === null || data.rating === "") {
      errors.push({field: "rating", message: "Đánh giá không được để trống"});
    } else {
      const rating = Number(data.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.push({field: "rating",message: "Đánh giá phải là số từ 1 đến 5"});
      }
    }
    return {
      isValid: errors.length == 0,
      errors,
    };
  }
}
