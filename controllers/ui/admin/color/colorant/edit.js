import { ColorantsAPI } from "../../../../api/ColorantsAPI.js";

const api = new ColorantsAPI();
const form = document.getElementById("add-colorant");

/* ================= ERROR HELPERS ================= */
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

/* ================= GET ID ================= */
function getId() {
    return new URLSearchParams(window.location.search).get("id");
}

/* ================= LOAD COLORANT ================= */
async function loadColorant() {
    const id = getId();

    if (!id) {
        alert("Không tìm thấy colorant");
        return location.href = "colorants.html";
    }

    try {
        const res = await api.getOneColorant(id);

        if (!res.success || !res.data) {
            alert("Colorant không tồn tại");
            return location.href = "colorants.html";
        }

        fillForm(res.data);
        form.dataset.id = id;

    } catch (err) {
        console.error(err);
        alert("Lỗi khi tải dữ liệu colorant");
    }
}

/* ================= FILL FORM ================= */
function fillForm(data) {
    document.getElementById("name").value = data.name ?? "";
    document.getElementById("unit").value = data.unit ?? "ml";
    document.getElementById("price_per_ml").value = data.price_per_ml ?? "";
    document.getElementById("is_active").value = data.isActive ? "true" : "false";

    document.querySelector('[x-text="pageName"]').textContent = "Chỉnh sửa Colorant";
    form.querySelector("button[type='submit']").textContent = "Cập nhật";
}

/* ================= GET DATA ================= */
function getData() {
    return {
        name: document.getElementById("name").value.trim(),
        unit: "ml",
        price_per_ml: Number(document.getElementById("price_per_ml").value),
        is_active: document.getElementById("is_active").value
    };
}

/* ================= VALIDATE ================= */
function validate(data) {
    let valid = true;

    if (!data.name) {
        showError("name", "Vui lòng nhập tên colorant");
        valid = false;
    }

    if (data.price_per_ml === "") {
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

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const id = form.dataset.id;
    if (!id) {
        alert("Thiếu ID colorant");
        return;
    }

    const data = getData();
    if (!validate(data)) return;

    // convert string → boolean
    data.is_active = data.is_active === "true";
    
    try {
        const res = await api.updateColorant(id, data);

        if (res.success) {
            alert("Cập nhật colorant thành công");
            window.location.href = "colorants.html";
        } else {
            alert(res.error || "Cập nhật thất bại");
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi cập nhật");
    }
});

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadColorant);
