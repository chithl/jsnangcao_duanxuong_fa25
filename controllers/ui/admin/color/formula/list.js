import { ColorFormulasAPI } from "../../../../api/ColorFormulasAPI.js";
import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";
import { FormulaComponentsAPI } from "../../../../api/FormulaComponentsAPI.js";
import { ColorantsAPI } from "../../../../api/ColorantsAPI.js";

const formulasAPI = new ColorFormulasAPI();
const paletteAPI = new ColorPalettesAPI();
const componentsAPI = new FormulaComponentsAPI();
const colorantsAPI = new ColorantsAPI();
const tbody = document.getElementById("color-formula-list");

const componentsCache = {};
const colorantsCache = {};

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

async function loadColorants() {
	try {
		const result = await colorantsAPI.list();
		if (result && result.success && Array.isArray(result.data)) {
			result.data.forEach((c) => {
				colorantsCache[c.id] = c.name || c.code || 'N/A';
			});
		}
	} catch (err) {
		console.error("Không thể tải colorants:", err);
	}
}

async function loadComponentsForFormula(formulaId) {
	if (componentsCache[formulaId]) {
		return componentsCache[formulaId];
	}
	
	try {
		const result = await componentsAPI.listByFormula(formulaId);
		if (result && result.success && Array.isArray(result.data)) {
			componentsCache[formulaId] = result.data;
			return result.data;
		}
	} catch (err) {
		console.error(`Không thể tải components cho formula ${formulaId}:`, err);
	}
	return [];
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

function renderRow(f, index = 0) {
	const tolerance = f.tolerance_deltaE || f.tolerance || "-";
	return `
		<tr>
			<td class="px-5 py-4 sm:px-6">${index + 1}</td>
			<td class="px-5 py-4 sm:px-6">${getPaletteName(f.palette_id)}</td>
			<td class="px-5 py-4 sm:px-6">${f.code || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${f.name || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${f.base || "-"}</td>
			<td class="px-5 py-4 sm:px-6">${tolerance}</td>
			<td class="px-5 py-4 sm:px-6">${statusBadge(f.is_active)}</td>
			<td class="px-5 py-4 sm:px-6">
				<button class="btn-view-components inline-flex items-center justify-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-sm font-medium text-purple-600 dark:bg-purple-500/15 dark:text-purple-400" data-id="${f.id}" data-name="${f.name || f.code}">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
					</svg>
					Xem
				</button>
			</td>
			<td class="px-5 py-4 sm:px-6">
				<a href="add-formula-component.html?formula_id=${f.id}&formula_name=${encodeURIComponent(f.name || '')}&formula_code=${encodeURIComponent(f.code || '')}" 
					 class="inline-flex items-center justify-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-600 dark:bg-green-500/15 dark:text-green-400">Thêm</a>
			</td>
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

function bindViewComponents() {
	const buttons = document.querySelectorAll(".btn-view-components");
	buttons.forEach((btn) => {
		btn.addEventListener("click", async (e) => {
			const formulaId = e.currentTarget.getAttribute("data-id");
			const formulaName = e.currentTarget.getAttribute("data-name");
			if (!formulaId) return;
			
			// Show loading
			const originalText = e.currentTarget.innerHTML;
			const button = e.currentTarget;
			button.innerHTML = 'Đang tải...';
			button.disabled = true;
			
			try {
				const components = await loadComponentsForFormula(formulaId);
				showComponentsModal(formulaName, components, button, originalText);
			} catch (err) {
				console.error("Lỗi tải components:", err);
				alert("Có lỗi xảy ra khi tải danh sách thành phần.");
				button.innerHTML = originalText;
				button.disabled = false;
			}
		});
	});
}

function showComponentsModal(formulaName, components, button, originalText) {
	const restoreButton = () => {
		if (button) {
			button.innerHTML = originalText;
			button.disabled = false;
		}
	};

	const closeModal = () => {
		const modal = document.getElementById('components-modal');
		const modalContent = modal?.querySelector('div:nth-child(1)');
		
		if (modal) {
			// Keep backdrop matte, only animate modal content
			if (modalContent) {
				modalContent.classList.add('animate-slideDown');
			}
			
			// Remove after animation completes, backdrop disappears with it
			setTimeout(() => {
				modal.remove();
			}, 300);
		}
		restoreButton();
	};

	const modalHtml = `
		<div id="components-modal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 animate-fadeIn">
			<div class="modal-formulas bg-white dark:bg-gray-900 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.7)] ring-4 ring-brand-500/20 dark:ring-brand-400/30 max-w-2xl max-h-[90vh] overflow-hidden transform transition-all animate-slideUp" onclick="event.stopPropagation()">
				<!-- Header -->
				<div class="bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-4 flex justify-between items-center">
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
							</svg>
						</div>
						<div>
							<h3 class="text-base font-bold text-white">Thành phần công thức</h3>
							<p class="text-xs text-white">${formulaName}</p>
						</div>
					</div>
					<button id="btn-close-modal" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>

				<!-- Content -->
				<div class="p-5 max-h-[calc(80vh-7rem)] overflow-y-auto">
					${components.length === 0 ? 
						`<div class="text-center py-10">
							<div class="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
								</svg>
							</div>
							<p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Chưa có thành phần nào</p>
							<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Hãy thêm thành phần cho công thức này</p>
						</div>` :
						`<div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
							<table class="w-full">
								<thead>
									<tr class="bg-gray-50 dark:bg-gray-800/50">
										<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Chất màu</th>
										<th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ml/L</th>
										<th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
									${components.map((c, index) => `
										<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
											<td class="px-4 py-3">
												<div class="flex items-center gap-2">
													<div class="w-7 h-7 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
														${index + 1}
													</div>
													<span class="text-sm font-medium text-gray-800 dark:text-gray-200">${colorantsCache[c.colorant_id] || c.colorant_id || '-'}</span>
												</div>
											</td>
											<td class="px-4 py-3 text-right">
												<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
													${c.ml_per_L || 0} ml/L
												</span>
											</td>
											<td class="px-4 py-3 text-center">
												<a href="edit-formula-component.html?id=${c.id}" 
													class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
													<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
													</svg>
													Sửa
												</a>
											</td>
										</tr>
									`).join('')}
								</tbody>
							</table>
						</div>
						
						<!-- Summary -->
						<div class="mt-2 p-3 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
									<span class="text-xs font-medium text-white dark:text-gray-300">Tổng số thành phần:</span>
								</div>
								<span class="text-base font-bold text-brand-600 dark:text-brand-400">${components.length}</span>
							</div>
						</div>`
					}
				</div>
			</div>
		</div>
		<style>
		.modal-formulas {
		background-color: #66708bff;
				}
			@keyframes fadeIn {
				from { 
					opacity: 0;
					backdrop-filter: blur(0px);
				}
				to { 
					opacity: 1;
					backdrop-filter: blur(12px);
				}
			}
			@keyframes slideUp {
				from { 
					opacity: 0;
					transform: translateY(30px) scale(0.92);
				}
				to { 
					opacity: 1;
					transform: translateY(0) scale(1);
				}
			}
			.animate-fadeIn {
				animation: fadeIn 0.2s ease-out;
			}
			.animate-slideUp {
				animation: slideUp 0.3s ease-out;
			}
			@keyframes fadeOut {
				from { 
					opacity: 1;
					backdrop-filter: blur(12px);
				}
				to { 
					opacity: 0;
					backdrop-filter: blur(0px);
				}
			}
			@keyframes slideDown {
				from { 
					opacity: 1;
					transform: translateY(0) scale(1);
				}
				to { 
					opacity: 0;
					transform: translateY(30px) scale(0.92);
				}
			}
			.animate-fadeOut {
				animation: fadeOut 0.3s ease-in;
			}
			.animate-slideDown {
				animation: slideDown 0.3s ease-in;
			}
		</style>
	`;
	
	document.body.insertAdjacentHTML('beforeend', modalHtml);
	
	// Bind close button and backdrop
	setTimeout(() => {
		const closeBtn = document.getElementById('btn-close-modal');
		const modal = document.getElementById('components-modal');
		
		if (closeBtn) {
			closeBtn.addEventListener('click', closeModal);
		}
		
		if (modal) {
			modal.addEventListener('click', closeModal);
		}
	}, 0);
}

async function loadFormulas() {
	if (!tbody) {
		console.warn("Không tìm thấy phần tử #color-formula-list");
		return;
	}

	tbody.innerHTML = `
		<tr>
			<td colspan="10" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</td>
		</tr>`;

	try {
		await Promise.all([loadPalettes(), loadColorants()]);
		const result = await formulasAPI.list();
		const data = result && result.success && Array.isArray(result.data) ? result.data : [];

		if (data.length === 0) {
			tbody.innerHTML = `
				<tr>
					<td colspan="10" class="px-5 py-6 text-center text-gray-500 dark:text-gray-400">Chưa có công thức nào.</td>
				</tr>`;
			return;
		}


		tbody.innerHTML = data.map(renderRow).join("");
		bindDelete();
		bindViewComponents();
	} catch (err) {
		console.error("Lỗi tải danh sách công thức:", err);
		tbody.innerHTML = `
			<tr>
				<td colspan="10" class="px-5 py-6 text-center text-red-500">Lỗi khi tải dữ liệu.</td>
			</tr>`;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadFormulas();
});

