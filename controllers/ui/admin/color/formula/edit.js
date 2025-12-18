import { ColorFormulasAPI } from "../../../../api/ColorFormulasAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const formulasAPI = new ColorFormulasAPI();
const paletteAPI = new ColorPalettesAPI();
const form = document.getElementById("edit-color-formula");

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

function getIdFromUrl() {
	try {
		const raw = window.location.search || "";
		const cleaned = raw.replace(/^\?\s*/, "?").replace(/\s+/g, "");
		const params = new URLSearchParams(cleaned);
		const id = params.get("id") || params.get("formulaId") || params.get("formula_id");
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
		const select = document.getElementById("palette_id");
		if (!select) return;
		select.innerHTML = '<option value="">-- Chọn bảng màu --</option>';
		const result = await paletteAPI.list();
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

async function loadFormula() {
	const id = getIdFromUrl();
	if (!id) {
		alert("Không tìm thấy ID công thức");
		window.location.href = "color-formulas.html";
		return;
	}

	try {
		const resp = await formulasAPI.getOneFormula(id);
		if (!resp || !resp.success || !resp.data) {
			alert("Không thể tải thông tin công thức");
			window.location.href = "color-formulas.html";
			return;
		}

		const f = resp.data;
		setInputValue("display-id", f.id || "");
		setInputValue("formula-id", f.id || "");
		setInputValue("code", f.code || "");
		setInputValue("name", f.name || "");
		setInputValue("base", f.base || "");
		setInputValue("tolerance_deltaE", f.tolerance_deltaE || f.tolerance || "");
		if (typeof f.is_active !== "undefined") {
			setInputValue("is_active", String(!!f.is_active));
		}

		await loadPalettes(f.palette_id);
	} catch (err) {
		console.error("Lỗi tải công thức:", err);
		alert("Đã xảy ra lỗi khi tải thông tin công thức");
		window.location.href = "color-formulas.html";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadFormula();
});

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		clearErrors();

		const id = getIdFromUrl();
		if (!id) {
			alert("Lỗi: Không tìm thấy ID công thức");
			return;
		}

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
			const resp = await formulasAPI.updateFormula(id, payload);
			if (resp && resp.success) {
				alert("Cập nhật công thức thành công!");
				window.location.href = "color-formulas.html";
			} else {
				const msg = resp?.message || resp?.error || "Không thể cập nhật công thức";
				alert(msg);
				console.error("Update formula error:", resp);
			}
		} catch (err) {
			console.error("Lỗi cập nhật công thức:", err);
			alert("Đã xảy ra lỗi khi cập nhật công thức");
		} finally {
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;
			}
		}
	});
}

