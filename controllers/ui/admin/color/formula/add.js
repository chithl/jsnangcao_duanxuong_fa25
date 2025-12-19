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
	
	// Auto-populate from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const name = urlParams.get('name');
	const palette_id = urlParams.get('palette_id');
	const base = urlParams.get('base');
	
	if (code) {
		// Show info message
		const infoDiv = document.createElement('div');
		infoDiv.className = 'mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800';
		infoDiv.innerHTML = `
			<p class="text-sm text-blue-800 dark:text-blue-200">
				<strong>📌 Tạo công thức cho màu:</strong> ${name || code}
			</p>
		`;
		
		const formContainer = document.querySelector('#add-color-formula');
		if (formContainer) {
			formContainer.parentElement.insertBefore(infoDiv, formContainer);
		}
		
		// Pre-fill form fields
		setTimeout(() => {
			const codeInput = document.getElementById('code');
			const nameInput = document.getElementById('name');
			const paletteSelect = document.getElementById('palette_id');
			const baseInput = document.getElementById('base');
			
			if (codeInput) codeInput.value = code;
			if (nameInput && name) nameInput.value = name;
			if (paletteSelect && palette_id) paletteSelect.value = palette_id;
			if (baseInput && base) baseInput.value = base;
		}, 300); // Wait for palettes to load
	}
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
				const formulaId = resp.data.id;
				alert("Thêm công thức thành công!\n\nTiếp theo: Thêm thành phần màu cho công thức này.");
				
				// Redirect to formula component form (mandatory)
				const params = new URLSearchParams({
					formula_id: formulaId,
					formula_name: name,
					formula_code: code
				});
				window.location.href = `add-formula-component.html?${params.toString()}`;
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

