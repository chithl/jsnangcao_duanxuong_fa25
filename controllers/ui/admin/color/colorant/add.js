import { ColorantsAPI } from "../../../../api/ColorantsAPI.js";

const api = new ColorantsAPI();
const form = document.getElementById("add-colorant");

/* ===== Error helpers ===== */
function showError(id, message = "") {
    const el = document.getElementById(`error-${id}`);
    if (!el) return;

    if (message) {
        el.textContent = message;
        el.classList.remove("hidden");
    } else {
        el.textContent = "";
        el.classList.add("hidden");
    }
}

function clearErrors() {
    ["name", "price", "status"].forEach(id => showError(id));
}

/* ===== Get data ===== */
function getData() {
    return {
        name: document.getElementById("name").value.trim(),
        unit: "ml",
        price_per_ml: Number(document.getElementById("price_per_ml").value),
        is_active: document.getElementById("is_active").value
    };
}

/* ===== Validate ===== */
function validate(data) {
    let valid = true;

    if (!data.name) {
        showError("name", "Vui lòng nhập tên colorant");
        valid = false;
    }

    if (!data.price_per_ml) {
        showError("price", "Vui lòng nhập giá colorant");
        valid = false;
    }

    if (isNaN(data.price_per_ml) || data.price_per_ml < 0) {
        showError("price", "Giá phải là số ≥ 0");
        valid = false;
    }

    if (data.is_active === "") {
        showError("status", "Vui lòng chọn trạng thái");
        valid = false;
    }

    return valid;
}

/* ===== Submit ===== */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const data = getData();
    if (!validate(data)) return;

    // convert string → boolean
    data.is_active = data.is_active === "true";

    try {
        const res = await api.storeColorant(data);
        if (res.success) {
            alert("Thêm colorant thành công");
            window.location.href = "colorants.html";
        } else {
            alert(res.error || "Thêm thất bại");
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra");
    }
});
