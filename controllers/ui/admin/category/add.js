import { CategoryAPI } from "../../../api/CategoryAPI.js";

var categoryModule = new CategoryAPI();
var form = document.getElementById("add-category");
var allCategories = [];

// Load all categories for duplicate check
(async () => {
    try {
        var categories = await categoryModule.getAllCategory();
        allCategories = Array.isArray(categories) ? categories : (categories && categories.data) || [];
    } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
    }
})();

/**
 * Validation rules
 */
const validationRules = {
    name: {
        minLength: 2,
        maxLength: 255,
        required: true,
        errors: {
            required: 'Tên danh mục không được để trống',
            minLength: 'Tên danh mục phải có ít nhất 2 ký tự',
            maxLength: 'Tên danh mục không được vượt quá 255 ký tự',
            duplicate: 'Tên danh mục này đã tồn tại'
        }
    },
    description: {
        maxLength: 500,
        required: false,
        errors: {
            maxLength: 'Mô tả không được vượt quá 500 ký tự'
        }
    }
};

/**
 * Validate form data
 */
function validateForm() {
    const nameValue = document.getElementById("name").value.trim();
    const descriptionValue = document.getElementById("description").value.trim();
    const errors = {};

    // Validate name
    if (validationRules.name.required && !nameValue) {
        errors.name = validationRules.name.errors.required;
    } else if (nameValue.length < validationRules.name.minLength) {
        errors.name = validationRules.name.errors.minLength;
    } else if (nameValue.length > validationRules.name.maxLength) {
        errors.name = validationRules.name.errors.maxLength;
    } else if (isDuplicateName(nameValue)) {
        errors.name = validationRules.name.errors.duplicate;
    }

    // Validate description
    if (descriptionValue && descriptionValue.length > validationRules.description.maxLength) {
        errors.description = validationRules.description.errors.maxLength;
    }

    return errors;
}

/**
 * Check if name already exists
 */
function isDuplicateName(name) {
    return allCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
}

/**
 * Display validation errors
 */
function displayErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('is-invalid'));

    // Display new errors
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.classList.add('is-invalid');
            const errorEl = document.createElement('small');
            errorEl.className = 'error-message text-danger d-block mt-1';
            errorEl.textContent = errors[field];
            input.parentElement.appendChild(errorEl);
        }
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }

    var nameValue = document.getElementById("name").value.trim();
    var descriptionValue = document.getElementById("description").value.trim();
    var isActiveValue = document.getElementById("is_active").value === "1" ? true : false;
    var data = {
        name: nameValue,
        description: descriptionValue,
        is_active: isActiveValue
    };
    try {
        var response = await categoryModule.storeCategory(data);
        if (response && response.status === 201) {
            alert("Thêm danh mục thành công!");
            window.location.href = "categories.html"; 
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + (error.message || 'Không thể thêm danh mục'));
    }
});
