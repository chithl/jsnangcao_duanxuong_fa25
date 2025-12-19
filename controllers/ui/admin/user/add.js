import { UserAPI } from "../../../api/UserAPI.js";

const UserModule = new UserAPI();
const form = document.querySelector(".add-form");
/**
 * Validation rules
 */
const validationRules = {
    name: {
        required: true,
        minLength: 2,
        maxLength: 255,
        errors: {
            required: "Họ và tên không được để trống",
            minLength: "Họ và tên phải có ít nhất 2 ký tự",
            maxLength: "Họ và tên không được vượt quá 255 ký tự"
        }
    },
    email: {
        required: true,
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errors: {
            required: "Email không được để trống",
            invalid: "Email không hợp lệ",
            duplicate: "Email đã tồn tại"
        }
    },
    password: {
        required: true,
        minLength: 6,
        errors: {
            required: "Mật khẩu không được để trống",
            minLength: "Mật khẩu phải có ít nhất 6 ký tự"
        }
    },

    phone: {
        required: true,
        minLength: 10,
        errors: {
            required: "Số điện thoại không được để trống",
            minLength: "Số điện thoại phải đủ 10 ký tự"
        }
    },

    role: {
        required: true,
        errors: {
            required: "Vai trò không được để trống",
        }
    },

    status: {
        required: true,
        errors: {
            required: "Trạng thái không được để trống",
        }
    },
};

/**
 * Validate form
 */
function validateForm() {
    const errors = {};

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const status = document.getElementById("status").value;
    const role = document.getElementById("role").value;

    // Name
    if (validationRules.name.required && !name) {
        errors.name = validationRules.name.errors.required;
    } else if (name.length < validationRules.name.minLength) {
        errors.name = validationRules.name.errors.minLength;
    } else if (name.length > validationRules.name.maxLength) {
        errors.name = validationRules.name.errors.maxLength;
    }

    // Email
    if (validationRules.email.required && !email) {
        errors.email = validationRules.email.errors.required;
    } else if (!validationRules.email.regex.test(email)) {
        errors.email = validationRules.email.errors.invalid;
    }
    // } else if (email == UserModule.checkEmailExists(email)) {
    //     errors.email = validationRules.email.errors.duplicate;
    // }

    // Password
    if (validationRules.password.required && !password) {
        errors.password = validationRules.password.errors.required;
    } else if (password.length < validationRules.password.minLength) {
        errors.password = validationRules.password.errors.minLength;
    }

    // Phone
    if (validationRules.phone.required && !phone) {
        errors.phone = validationRules.phone.errors.required;
    } else if (phone.length < validationRules.phone.minLength) {
        errors.phone = validationRules.phone.errors.minLength;
    }

    // Role
    if (validationRules.role.required && !role) {
        errors.role = validationRules.role.errors.required;
    }

    // Phone
    if (validationRules.status.required && !status) {
        errors.status = validationRules.status.errors.required;
    }

    return errors;
}

/**
 * Display errors dưới input (giống Category)
 */
function displayErrors(errors) {
    // clear old errors
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll("input").forEach(el => el.classList.remove("is-invalid"));

    Object.keys(errors).forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add("is-invalid");
            const errorEl = document.createElement("small");
            errorEl.className = "error-message text-sm font-medium text-error-600 d-block mt-1";
            errorEl.innerText = errors[fieldId];
            input.parentElement.appendChild(errorEl);
        }
    });
}

/**
 * Submit
 */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // validate frontend
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }

    const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value.trim(),
        role: document.getElementById("role").value,
        status: Number(document.getElementById("status").value),
    };

    const result = await UserModule.addUser(data);

        if (!result.success) {
        const backendErrors = {};
        result.errors.forEach(err => {
            backendErrors[err.field] = err.message;
        });

        displayErrors(backendErrors);
        return; // ⛔ KHÔNG alert
    }

    alert("Thêm người dùng thành công");
    window.location.href = "user.html";
});

