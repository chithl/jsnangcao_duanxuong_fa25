import { ColorsAPI } from "../../../../api/ColorsAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const colorsAPI = new ColorsAPI();
const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("add-color");

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

function normalizeHex(hex) {
	if (!hex) return "";
	const v = hex.trim().toUpperCase();
	return v.startsWith("#") ? v : `#${v}`;
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

		const palette_id = document.getElementById("palette_id")?.value || "";
		const code = document.getElementById("code")?.value?.trim() || "";
		const name = document.getElementById("name")?.value?.trim() || "";
		const base = document.getElementById("base")?.value || "";
		let hex = document.getElementById("hex")?.value?.trim() || "";
		const hexPicker = document.getElementById("hex-picker");

		if (!hex && hexPicker && hexPicker.value) {
			hex = hexPicker.value;
		}
		hex = normalizeHex(hex);

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
		if (hex && !/^#[0-9A-F]{6}$/i.test(hex)) {
			showError("hex", "Mã HEX không hợp lệ (vd: #FF5733)");
			return;
		}

		const submitBtn = form.querySelector('button[type="submit"]');
		const originalText = submitBtn?.textContent || "Xác nhận";
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = "Đang xử lý...";
		}

		try {
			const payload = { palette_id, code, name, base };
			if (hex) payload.hex = hex;

			const resp = await colorsAPI.storeColor(payload);
			if (resp && resp.success) {
				alert("Thêm màu thành công!\n\nTiếp theo: Thêm công thức pha cho màu này.");
				
				// Redirect to formula form with color info (mandatory)
				const params = new URLSearchParams({
					code: code,
					name: name,
					palette_id: palette_id,
					base: base || ''
				});
				window.location.href = `add-color-formulas.html?${params.toString()}`;
			} else {
				const msg = resp?.message || "Không thể tạo màu";
				alert(msg);
				console.error("Store color error:", resp);
			}
		} catch (err) {
			console.error("Lỗi tạo màu:", err);
			alert("Đã xảy ra lỗi khi tạo màu");
		} finally {
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;
			}
		}
	});
}

