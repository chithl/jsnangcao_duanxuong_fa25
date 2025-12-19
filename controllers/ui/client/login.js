import { AuthAPI } from "../../api/AuthAPI.js";

const auth = new AuthAPI();
const form = document.querySelector(".login-form");

/**
 * Validation rules
 */
const validationRules = {
    email: {
        required: true,
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errors: {
            required: "Email không được để trống",
            invalid: "Email không hợp lệ",
        }
    },
    password: {
        required: true,
        // minLength: 6,
        errors: {
            required: "Mật khẩu không được để trống",
            // minLength: "Mật khẩu phải có ít nhất 6 ký tự"
        }
    },
};

/**
 * Validate form
 */
function validateForm() {
    const errors = {};

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Email
    if (!email) {
        errors.email = validationRules.email.errors.required;
    } else if (!validationRules.email.regex.test(email)) {
        errors.email = validationRules.email.errors.invalid;
    }

    // Password
    if (!password) {
        errors.password = validationRules.password.errors.required;
    } 
    // else if (password.length < validationRules.password.minLength) {
    //     errors.password = validationRules.password.errors.minLength;
    // }

    return errors;
}

/**
 * Display errors dưới input
 */
function displayErrors(errors) {
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
 * Submit login
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
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
    };

    const result = await auth.login(data);

    // ❌ Sai email hoặc mật khẩu
    if (!result.success) {
        displayErrors({
            email: result.errors[0].message
        });
        return;
    }

    localStorage.setItem("token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));

    alert("Đăng nhập thành công");
    window.location.href = "index.html";
});
