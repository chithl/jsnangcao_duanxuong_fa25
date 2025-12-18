import { ColorFormulasAPI } from "../../../../api/ColorFormulasAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const formulasAPI = new ColorFormulasAPI();
const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("add-color-formula");

function showError(field, message) {
	const el = document.getElementById(`error-${field}`);
	if (el) {
		el.textContent = message;
		el.classList.remove("hidden");
	}
}

function clearErrors() {
	document.querySelectorAll("[id^='error-']").forEach((el) => {
		el.textContent = "";
		el.classList.add("hidden");
	});
}

async function loadPalettes() {
	try {
		const select = document.getElementById("palette_id");
		if (!select) return;
		select.innerHTML = '<option value="">-- Chọn bảng màu --</option>';
		const result = await paletteAPI.list();
		if (result && result.success && Array.isArray(result.data)) {
			result.data.forEach((p) => {
				const opt = document.createElement("option");
				opt.value = p.id;
				opt.textContent = p.name;
				select.appendChild(opt);
			});
		}
	} catch (err) {
		console.error("Lỗi tải danh sách bảng màu:", err);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadPalettes();
});

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		clearErrors();

		const display_id = document.getElementById("id")?.value?.trim() || "";
		const palette_id = document.getElementById("palette_id")?.value || "";
		const code = document.getElementById("code")?.value?.trim() || "";
		const name = document.getElementById("name")?.value?.trim() || "";
		const base = document.getElementById("base")?.value || "";
		const tolerance_deltaE = document.getElementById("tolerance_deltaE")?.value?.trim() || "";
		const is_active_val = document.getElementById("is_active")?.value || "true";
		const is_active = String(is_active_val).toLowerCase() === "true";

		// Validation
		if (!palette_id) {
			showError("palette_id", "Bảng màu là bắt buộc");
			return;
		}
		if (!code) {
			showError("code", "Mã code là bắt buộc");
			return;
		}
		if (!name) {
			showError("name", "Tên màu là bắt buộc");
			return;
		}

		const submitBtn = form.querySelector('button[type="submit"]');
		const originalText = submitBtn?.textContent || "Xác nhận";
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = "Đang xử lý...";
		}

		try {
			const payload = { palette_id, code, name, base, tolerance_deltaE, is_active };
			if (display_id) payload.display_id = display_id;

			const resp = await formulasAPI.storeFormula(payload);
			if (resp && resp.success) {
				alert("Thêm công thức thành công!");
				window.location.href = "color-formulas.html";
			} else {
				const msg = resp?.message || resp?.error || "Không thể tạo công thức";
				alert(msg);
				console.error("Store formula error:", resp);
			}
		} catch (err) {
			console.error("Lỗi tạo công thức:", err);
			alert("Đã xảy ra lỗi khi tạo công thức");
		} finally {
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;
			}
		}
	});
}

