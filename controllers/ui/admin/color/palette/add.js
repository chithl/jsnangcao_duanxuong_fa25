import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("add-color-palette");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Get form data
        const name = document.getElementById("name")?.value?.trim() || "";
        const notes = document.getElementById("notes")?.value?.trim() || "";
        const is_active = document.getElementById("is_active")?.value;

        // Basic validation
        if (!name) {
            showError("name", "Tên bảng màu là bắt buộc");
            return;
        }

        if (!is_active) {
            showError("status", "Trạng thái là bắt buộc");
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang xử lý...";

        try {
            const payload = {
                name,
                notes,
                is_active: is_active === "true"
            };

            const response = await paletteAPI.storePalette(payload);

            if (response && response.success) {
                alert("Thêm bảng màu thành công!");
                window.location.href = "color-palettes.html";
            } else {
                const errorMsg = response?.message || "Không thể thêm bảng màu";
                alert(errorMsg);
                console.error("Store error:", response);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Đã xảy ra lỗi khi thêm bảng màu");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function showError(fieldName, message) {
    const errorEl = document.getElementById(`error-${fieldName}`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    }
}

function clearErrors() {
    const errorEls = document.querySelectorAll("[id^='error-']");
    errorEls.forEach((el) => {
        el.textContent = "";
        el.classList.add("hidden");
    });
}
