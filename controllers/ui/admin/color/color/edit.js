import { ColorsAPI } from "../../../../api/ColorsAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const colorsAPI = new ColorsAPI();
const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("edit-color");

function setInputValue(id, value) {
	const el = document.getElementById(id);
	if (el) {
		el.value = value ?? "";
		return true;
	}
	return false;
}

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

function getColorIdFromUrl() {
	try {
		const raw = window.location.search || "";
		const cleaned = raw.replace(/^\?\s*/, "?").replace(/\s+/g, "");
		const params = new URLSearchParams(cleaned);
		const id = params.get("id") || params.get("colorId") || params.get("color_id");
		if (id) return id;
		const match = (window.location.href || "").match(/[?&]\s*id=([^&]+)/i);
		return match ? decodeURIComponent(match[1]) : null;
	} catch (e) {
		console.warn("Không thể đọc tham số id từ URL:", e, window.location.href);
		return null;
	}
}

async function loadPalettes(selectedId = null) {
	try {
		const result = await paletteAPI.list();
		const select = document.getElementById("palette_id");
		if (!select) return;
		select.innerHTML = '<option value="">-- Chọn bảng màu --</option>';
		if (result && result.success && Array.isArray(result.data)) {
			result.data.forEach((p) => {
				const opt = document.createElement("option");
				opt.value = p.id;
				opt.textContent = p.name;
				if (p.id === selectedId) opt.selected = true;
				select.appendChild(opt);
			});
		}
	} catch (err) {
		console.error("Lỗi tải danh sách bảng màu:", err);
	}
}

async function loadColorData() {
	const colorId = getColorIdFromUrl();
	if (!colorId) {
		alert("Không tìm thấy ID màu");
		window.location.href = "colors.html";
		return;
	}

	try {
		const resp = await colorsAPI.getOneColor(colorId);
		if (!resp || !resp.success || !resp.data) {
			alert("Không thể tải thông tin màu");
			window.location.href = "colors.html";
			return;
		}

		const color = resp.data;
		setInputValue("display-id", color.id || "");
		setInputValue("color-id", color.id || "");
		setInputValue("code", color.code || "");
		setInputValue("name", color.name || "");
		setInputValue("base", color.base || "");
		if (color.hex) {
			setInputValue("hex", color.hex);
			const hexPicker = document.getElementById("hex-picker");
			if (hexPicker) hexPicker.value = color.hex;
		}

		await loadPalettes(color.palette_id);
	} catch (err) {
		console.error("Lỗi tải màu:", err);
		alert("Đã xảy ra lỗi khi tải thông tin màu");
		window.location.href = "colors.html";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadColorData();
});

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		clearErrors();

		const colorId = getColorIdFromUrl();
		if (!colorId) {
			alert("Lỗi: Không tìm thấy ID màu");
			return;
		}

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

			const resp = await colorsAPI.updateColor(colorId, payload);
			if (resp && resp.success) {
				alert("Cập nhật màu thành công!");
				window.location.href = "colors.html";
			} else {
				const msg = resp?.message || "Không thể cập nhật màu";
				alert(msg);
				console.error("Update color error:", resp);
			}
		} catch (err) {
			console.error("Lỗi cập nhật màu:", err);
			alert("Đã xảy ra lỗi khi cập nhật màu");
		} finally {
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;
			}
		}
	});
}

