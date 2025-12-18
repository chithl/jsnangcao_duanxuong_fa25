import { ColorFormulasAPI } from "../../../../api/ColorFormulasAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const formulasAPI = new ColorFormulasAPI();
const paletteAPI = new ColorPalettesAPI();
const tbody = document.getElementById("color-formula-list");

const palettesCache = {};

async function loadPalettes() {
	try {
		const result = await paletteAPI.list();
		if (result && result.success && Array.isArray(result.data)) {
			result.data.forEach((p) => {
				palettesCache[p.id] = p.name;
			});
		}
	} catch (err) {
		console.error("Không thể tải bảng màu:", err);
	}
}

function getPaletteName(id) {
	return palettesCache[id] || id || "-";
}

function statusBadge(isActive) {
	if (isActive === false) {
		return '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800/30 dark:text-gray-300">Không hoạt động</span>';
	}
	return '<span class="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">Hoạt động</span>';
}

function renderRow(f) {
	const displayId = f.display_id || f.id || "-";
	const tolerance = f.tolerance_deltaE || f.tolerance || "-";
	return `
		<tr>
			<td class="px-5 py-4 sm:px-6">${displayId}</td>
			<td class="px-5 py-4 sm:px-6">${getPaletteName(f.palette_id)}</td>
			<td class="px-5 py-4 sm:px-6">${f.code || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${f.name || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${f.base || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${tolerance}</td>
			<td class="px-5 py-4 sm:px-6">${statusBadge(f.is_active)}</td>
			<td class="px-5 py-4 sm:px-6">
				<a href="edit-color-formulas.html?id=${f.id}"
					 class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
				<button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${f.id}">Xóa</button>
			</td>
		</tr>
	`;
}

function bindDelete() {
	const buttons = document.querySelectorAll(".btn-delete");
	buttons.forEach((btn) => {
		btn.addEventListener("click", async (e) => {
			const id = e.currentTarget.getAttribute("data-id");
			if (!id) return;
			if (!confirm(`Bạn có chắc chắn muốn xóa công thức có ID: ${id}?`)) return;
			try {
				const resp = await formulasAPI.deleteFormula(id);
				if (resp && resp.success) {
					alert("Xóa công thức thành công!");
					await loadFormulas();
				} else {
					alert(resp?.message || "Xóa công thức thất bại.");
				}
			} catch (err) {
				console.error("Lỗi xóa công thức:", err);
				alert("Có lỗi xảy ra khi xóa công thức.");
			}
		});
	});
}

async function loadFormulas() {
	if (!tbody) {
		console.warn("Không tìm thấy phần tử #color-formula-list");
		return;
	}

	tbody.innerHTML = `
		<tr>
			<td colspan="8" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</td>
		</tr>`;

	try {
		await loadPalettes();
		const result = await formulasAPI.list();
		const data = result && result.success && Array.isArray(result.data) ? result.data : [];

		if (data.length === 0) {
			tbody.innerHTML = `
				<tr>
					<td colspan="8" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Chưa có công thức nào.</td>
				</tr>`;
			return;
		}

		tbody.innerHTML = data.map(renderRow).join("");
		bindDelete();
	} catch (err) {
		console.error("Lỗi tải danh sách công thức:", err);
		tbody.innerHTML = `
			<tr>
				<td colspan="8" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu.</td>
			</tr>`;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadFormulas();
});

