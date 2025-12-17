import { AuthAPI } from "../../api/AuthAPI.js";

const auth = new AuthAPI();
const form = document.querySelector(".register-form");
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
    confirm_password: {
        required: true,
        errors: {
            mismatch: "Mật khẩu xác nhận không khớp"
        }
    }
};

/**
 * Validate form
 */
function validateForm() {
    const errors = {};

    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("reg_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    // Name
    if (validationRules.name.required && !name) {
        errors.fullname = validationRules.name.errors.required;
    } else if (name.length < validationRules.name.minLength) {
        errors.fullname = validationRules.name.errors.minLength;
    } else if (name.length > validationRules.name.maxLength) {
        errors.fullname = validationRules.name.errors.maxLength;
    }

    // Email
    if (validationRules.email.required && !email) {
        errors.email = validationRules.email.errors.required;
    } else if (!validationRules.email.regex.test(email)) {
        errors.email = validationRules.email.errors.invalid;
    } else if (email == auth.checkEmailExists(email)) {
        errors.email = validationRules.email.errors.duplicate;
    }

    // Password
    if (validationRules.password.required && !password) {
        errors.reg_password = validationRules.password.errors.required;
    } else if (password.length < validationRules.password.minLength) {
        errors.reg_password = validationRules.password.errors.minLength;
    }

    // Confirm password
    if (password !== confirmPassword) {
        errors.confirm_password = validationRules.confirm_password.errors.mismatch;
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
            errorEl.className = "error-message text-danger d-block mt-1";
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

    // Step 1: validate frontend
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }

    // Step 2: call API
    const data = {
        name: document.getElementById("fullname").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("reg_password").value,
    };

    const result = await auth.register(data);

    alert("Đăng ký thành công");
    window.location.href = "login.html";
});
