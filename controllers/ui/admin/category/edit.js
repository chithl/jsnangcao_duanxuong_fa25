import { CategoryAPI } from "../../../api/CategoryAPI.js";
const api = new CategoryAPI();
const categoryId = new URLSearchParams(window.location.search).get("id");
const form = document.getElementById("edit-category");
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
/* ===== Load category data ===== */
async function loadCategoryData() {
    try {
        const data = await api.getOneCategory(categoryId);
        if (data) {
            form.name.value = data.name || "";
            form.description.value = data.description || "";
            //select option
            form.is_active.value = data.is_active ? "true" : "false";

        }
        else {
            alert("Danh mục không tồn tại!");
            window.location.href = "categories.html";
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu danh mục:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
}
loadCategoryData();
/* ===== Form submission ===== */
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();
    const oldData = await api.getOneCategory(categoryId);
    const formData = new FormData(form);
    const data = {
        name: formData.get("name").trim(),
        description: formData.get("description").trim(),
        is_active: formData.get("is_active") === "true" ? true : false,
        // giữ nguyên created_at cũ
        created_at: oldData.created_at
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
        const res = await api.updateCategory(categoryId, data);
        if (res) {
            alert("Cập nhật danh mục thành công!");
            window.location.href = "categories.html";
        }
        else {
            console.error("Lỗi cập nhật danh mục:", res);
            alert(res.error || "Cập nhật danh mục thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
});