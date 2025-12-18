import { ColorsAPI } from "../../../../api/ColorsAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const colorsAPI = new ColorsAPI();
const paletteAPI = new ColorPalettesAPI();
const tbody = document.getElementById("color-list");

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

function colorPreview(hex) {
	const value = hex || "#FFFFFF";
	return `
		<div class="flex items-center gap-2">
			<div class="h-6 w-6 rounded border border-gray-300 dark:border-gray-700" style="background-color: ${value};"></div>
			<span class="text-sm text-gray-600 dark:text-gray-400">${value}</span>
		</div>
	`;
}

function renderRow(color) {
	return `
		<tr>
			<td class="px-5 py-4 sm:px-6">${color.id || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${getPaletteName(color.palette_id)}</td>
			<td class="px-5 py-4 sm:px-6">${color.code || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${color.name || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${colorPreview(color.hex)}</td>
			<td class="px-5 py-4 sm:px-6">${color.base || "-"}</td>
			<td class="px-5 py-4 sm:px-6">
				<a href="edit-colors.html?id=${color.id}"
					 class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">
					Sửa
				</a>
				<button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${color.id}">
					Xóa
				</button>
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
			if (!confirm(`Bạn có chắc chắn muốn xóa màu có ID: ${id}?`)) return;
			try {
				const resp = await colorsAPI.deleteColor(id);
				if (resp && resp.success) {
					alert("Xóa màu thành công!");
					await loadColors();
				} else {
					const msg = resp?.message || "Xóa màu thất bại.";
					alert(msg);
				}
			} catch (err) {
				console.error("Lỗi xóa màu:", err);
				alert("Có lỗi xảy ra khi xóa màu.");
			}
		});
	});
}

async function loadColors() {
	if (!tbody) {
		console.warn("Không tìm thấy phần tử #color-list");
		return;
	}

	tbody.innerHTML = `
		<tr>
			<td colspan="7" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</td>
		</tr>`;

	try {
		await loadPalettes();
		const result = await colorsAPI.list();
		const data = result && result.success && Array.isArray(result.data) ? result.data : [];

		if (data.length === 0) {
			tbody.innerHTML = `
				<tr>
					<td colspan="7" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Chưa có màu nào.</td>
				</tr>`;
			return;
		}

		tbody.innerHTML = data.map(renderRow).join("");
		bindDelete();
	} catch (err) {
		console.error("Lỗi tải danh sách màu:", err);
		tbody.innerHTML = `
			<tr>
				<td colspan="7" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu.</td>
			</tr>`;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadColors();
});

