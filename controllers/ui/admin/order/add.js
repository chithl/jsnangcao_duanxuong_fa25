import { OrderAPI } from "../../../api/OrderAPI.js";

var orderModule = new OrderAPI();
var form = document.getElementById("add-order");

/**
 * Validation rules
 */
const validationRules = {
    customer_name: {
        minLength: 2,
        maxLength: 100,
        required: true,
        errors: {
            required: 'Tên khách hàng không được để trống',
            minLength: 'Tên khách hàng phải có ít nhất 2 ký tự',
            maxLength: 'Tên khách hàng không được vượt quá 100 ký tự'
        }
    },
    customer_email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errors: {
            required: 'Email không được để trống',
            pattern: 'Email không hợp lệ'
        }
    },
    customer_phone: {
        minLength: 10,
        maxLength: 11,
        required: true,
        pattern: /^[0-9]{10,11}$/,
        errors: {
            required: 'Số điện thoại không được để trống',
            minLength: 'Số điện thoại phải có ít nhất 10 ký tự',
            maxLength: 'Số điện thoại không được vượt quá 11 ký tự',
            pattern: 'Số điện thoại chỉ chứa chữ số'
        }
    },
    total: {
        required: true,
        min: 0,
        errors: {
            required: 'Tổng tiền không được để trống',
            min: 'Tổng tiền phải lớn hơn hoặc bằng 0'
        }
    },
    status: {
        required: true,
        errors: {
            required: 'Trạng thái không được để trống'
        }
    }
};

/**
 * Validate form data
 */
function validateForm() {
    const errors = {};

    // Validate customer_name
    const nameValue = document.getElementById("customer_name").value.trim();
    if (validationRules.customer_name.required && !nameValue) {
        errors.customer_name = validationRules.customer_name.errors.required;
    } else if (nameValue.length < validationRules.customer_name.minLength) {
        errors.customer_name = validationRules.customer_name.errors.minLength;
    } else if (nameValue.length > validationRules.customer_name.maxLength) {
        errors.customer_name = validationRules.customer_name.errors.maxLength;
    }

    // Validate customer_email
    const emailValue = document.getElementById("customer_email").value.trim();
    if (validationRules.customer_email.required && !emailValue) {
        errors.customer_email = validationRules.customer_email.errors.required;
    } else if (emailValue && !validationRules.customer_email.pattern.test(emailValue)) {
        errors.customer_email = validationRules.customer_email.errors.pattern;
    }

    // Validate customer_phone
    const phoneValue = document.getElementById("customer_phone").value.trim();
    if (validationRules.customer_phone.required && !phoneValue) {
        errors.customer_phone = validationRules.customer_phone.errors.required;
    } else if (phoneValue.length < validationRules.customer_phone.minLength) {
        errors.customer_phone = validationRules.customer_phone.errors.minLength;
    } else if (phoneValue.length > validationRules.customer_phone.maxLength) {
        errors.customer_phone = validationRules.customer_phone.errors.maxLength;
    } else if (!validationRules.customer_phone.pattern.test(phoneValue)) {
        errors.customer_phone = validationRules.customer_phone.errors.pattern;
    }

    // Validate total
    const totalValue = parseFloat(document.getElementById("total").value);
    if (isNaN(totalValue) || totalValue < validationRules.total.min) {
        errors.total = validationRules.total.errors.min;
    }

    // Validate status
    const statusValue = document.getElementById("status").value;
    if (!statusValue) {
        errors.status = validationRules.status.errors.required;
    }

    return errors;
}

/**
 * Display validation errors
 */
function displayErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('is-invalid'));

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

    var customerNameValue = document.getElementById("customer_name").value.trim();
    var customerEmailValue = document.getElementById("customer_email").value.trim();
    var customerPhoneValue = document.getElementById("customer_phone").value.trim();
    var totalValue = parseFloat(document.getElementById("total").value);
    var statusValue = document.getElementById("status").value;
    var notesValue = document.getElementById("notes").value.trim();

    var data = {
        customer_name: customerNameValue,
        customer_email: customerEmailValue,
        customer_phone: customerPhoneValue,
        total: totalValue,
        status: statusValue,
        notes: notesValue
    };

    try {
        var response = await orderModule.storeOrder(data);
        if (response && response.status === 201) {
            alert("Thêm đơn hàng thành công!");
            window.location.href = "orders.html"; 
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + (error.message || 'Không thể thêm đơn hàng'));
    }
});
