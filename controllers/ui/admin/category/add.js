import { CategoryAPI } from "../../../api/CategoryAPI.js";
const api = new CategoryAPI();
const form = document.getElementById("add-category");
/* ===== Error helpers ===== */
function showError(id, message = "") {
    const el = document.getElementById(`error-${id}`);
    if (!el) return;
    if (message) {
        el.textContent = message;
        el.classList.remove("hidden");
    }
    else {
        el.textContent = "";
        el.classList.add("hidden");
    }
}
function clearErrors() {
    ["name", "description", "is_active"].forEach(id => showError(id));
}
/* ===== Form submission ===== */
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();
    const formData = new FormData(form);
    const data = {
        name: formData.get("name").trim(),
        description: formData.get("description").trim(),
        is_active: formData.get("is_active") === "true" ? true : false,
        created_at: new Date().toISOString()
    };
    // Validate
    let hasError = false;
    if (!data.name) {
        showError("name", "Tên danh mục không được để trống");
        hasError = true;
    }
    if (!data.description) {
        showError("description", "Mô tả không được để trống");
        hasError = true;
    }
    if (data.is_active === "") {
        showError("is_active", "Vui lòng chọn trạng thái");
        hasError = true;
    }
    if (hasError) return;
    // Submit to API
    try {
        const res = await api.storeCategory(data);
        if (res) {
            alert("Tạo danh mục thành công!");
            window.location.href = "categories.html";
        } else {
            console.error("Lỗi tạo danh mục:", res);
            alert(res.error || "Tạo danh mục thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi tạo danh mục:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
});