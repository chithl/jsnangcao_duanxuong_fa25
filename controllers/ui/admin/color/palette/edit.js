import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("edit-color-palette");

// Get palette ID from URL query params
function getPaletteIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Load palette data and populate form
async function loadPaletteData() {
    const id = getPaletteIdFromUrl();

    if (!id) {
        alert("Không tìm thấy ID bảng màu");
        window.location.href = "color-palettes.html";
        return;
    }

    try {
        const response = await paletteAPI.getOnePalette(id);

        if (response && response.success && response.data) {
            const palette = response.data;
            document.getElementById("palette-id").value = palette.id;
            document.getElementById("name").value = palette.name || "";
            document.getElementById("notes").value = palette.notes || "";
            
            // Set status
            const isActive = palette.is_active === "TRUE" || palette.is_active === true || palette.is_active === "true";
            document.getElementById("is_active").value = isActive ? "true" : "false";
        } else {
            alert("Không thể tải thông tin bảng màu");
            window.location.href = "color-palettes.html";
        }
    } catch (error) {
        console.error("Error loading palette:", error);
        alert("Đã xảy ra lỗi khi tải thông tin bảng màu");
        window.location.href = "color-palettes.html";
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", loadPaletteData);

// Handle form submission
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearErrors();

        const id = document.getElementById("palette-id")?.value;
        const name = document.getElementById("name")?.value?.trim() || "";
        const notes = document.getElementById("notes")?.value?.trim() || "";
        const is_active = document.getElementById("is_active")?.value;

        // Validation
        if (!id) {
            alert("Lỗi: Không tìm thấy ID bảng màu");
            return;
        }

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

            const response = await paletteAPI.updatePalette(id, payload);

            if (response && response.success) {
                alert("Cập nhật bảng màu thành công!");
                window.location.href = "color-palettes.html";
            } else {
                const errorMsg = response?.message || "Không thể cập nhật bảng màu";
                alert(errorMsg);
                console.error("Update error:", response);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Đã xảy ra lỗi khi cập nhật bảng màu");
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
