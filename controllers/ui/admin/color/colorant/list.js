import { ColorantsAPI } from "../../../../api/ColorantsAPI.js";

const colorantsAPI = new ColorantsAPI();
let cachedColorants = [];

/**
 * Render danh sách colorants vào bảng
 */
async function renderColorantList() {
    try {
        const result = await colorantsAPI.list();
        console.log(result);
        
        if (!result.success) {
            console.error('Không thể tải danh sách colorants');
            return;
        }

        cachedColorants = result.data || [];

        const tbody = document.getElementById('colorant-list');
        if (!tbody) {
            console.error('Không tìm thấy element #colorant-list');
            return;
        }

        // Xóa nội dung cũ
        tbody.innerHTML = '';

        // Nếu không có dữ liệu
        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-5 py-4 sm:px-6 text-center text-gray-500">
                        Không có dữ liệu colorant
                    </td>
                </tr>
            `;
            return;
        }

        // Render từng colorant
        cachedColorants.forEach((colorant, index) => {
            createColorantRow(colorant, index + 1);
        });

        // Gắn event listener cho nút xóa
        attachDeleteHandlers();

    } catch (error) {
        console.error('Lỗi khi render danh sách colorants:', error);
    }
}

/**
 * Tạo một hàng trong bảng cho colorant
 */
function createColorantRow(colorant, index) {
    const content = document.getElementById('colorant-list');
    // Xác định trạng thái
    const statusClass = colorant.is_active == true
        ? 'bg-success-50 text-success-600' 
        : 'bg-gray-100 text-gray-600';
    const statusText = colorant.is_active == true ? 'Hoạt động' : 'Ngưng hoạt động';
    console.log(colorant.is_active);
    
    content.innerHTML += `
        <tr>
        <td class="px-5 py-4 sm:px-6">${index}</td>
        <td class="px-5 py-4 sm:px-6">${colorant.name || 'N/A'}</td>
        <td class="px-5 py-4 sm:px-6">${colorant.unit || 'ml'}</td>
        <td class="px-5 py-4 sm:px-6">${formatPrice(colorant.price_per_ml)}</td>
        <td class="px-5 py-4 sm:px-6">
            <span class="inline-flex rounded-full ${statusClass} px-2 py-0.5 text-xs font-medium">
                ${statusText}
            </span>
        </td>
        <td class="px-5 py-4 sm:px-6">
            <a href="edit-colorants.html?id=${colorant.id}" 
               class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">
                Sửa
            </a>
            <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" 
                    data-id="${colorant.id}">
                Xóa
            </button>
        </td>
        </tr>
    `;

    return content;
}

/**
 * Format giá tiền
 */
function formatPrice(price) {
    if (!price && price !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN').format(price);
}

/**
 * Gắn event handler cho các nút xóa
 */
function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (!id) return;

            if (confirm('Bạn có chắc chắn muốn xóa colorant này?')) {
                try {
                    const result = await colorantsAPI.deleteColorant(id);
                    if (result.success) {
                        alert('Xóa thành công!');
                        renderColorantList(); // Reload lại danh sách
                    } else {
                        alert('Xóa thất bại!');
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa:', error);
                    alert('Có lỗi xảy ra khi xóa!');
                }
            }
        });
    });
}

function bindImportExportControls() {
    const btnExportJson = document.getElementById('btn-export-json');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnImport = document.getElementById('btn-import');
    const inputImport = document.getElementById('input-import-file');

    if (btnExportJson) {
        btnExportJson.addEventListener('click', exportToJson);
    }

    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', exportToCsv);
    }

    if (btnImport && inputImport) {
        btnImport.addEventListener('click', () => inputImport.click());
        inputImport.addEventListener('change', async (e) => {
            const [file] = e.target.files || [];
            if (file) {
                await handleImportFile(file);
            }
            inputImport.value = '';
        });
    }
}

function exportToJson() {
    if (!cachedColorants.length) {
        alert('Không có dữ liệu để export');
        return;
    }

    const payload = JSON.stringify(cachedColorants, null, 2);
    triggerDownload(payload, `colorants-${Date.now()}.json`, 'application/json');
}

function exportToCsv() {
    if (!cachedColorants.length) {
        alert('Không có dữ liệu để export');
        return;
    }

    const csv = convertToCsv(cachedColorants);
    if (!csv) {
        alert('Không thể tạo nội dung CSV');
        return;
    }

    triggerDownload('\uFEFF' + csv, `colorants-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

async function handleImportFile(file) {
    try {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const text = await file.text();
        let rows = [];

        if (ext === 'json') {
            rows = parseJson(text);
        } else if (ext === 'csv') {
            rows = parseCsv(text);
        } else {
            alert('Chỉ hỗ trợ định dạng CSV hoặc JSON');
            return;
        }

        const sanitized = rows.map(sanitizeColorant).filter(Boolean);
        if (!sanitized.length) {
            alert('Không có bản ghi hợp lệ để import');
            return;
        }

        const resp = await colorantsAPI.import(sanitized);
        const items = resp?.data || [];
        const successCount = items.filter(i => i?.success).length;
        const failedCount = items.length - successCount;

        alert(`Import hoàn tất: ${successCount} thành công, ${failedCount} thất bại.`);
        renderColorantList();
    } catch (error) {
        console.error('Lỗi khi import:', error);
        alert('Không thể import file này.');
    }
}

function sanitizeColorant(raw) {
    if (!raw || !raw.name) return null;

    const price = Number(raw.price_per_ml);
    const quantity = raw.quantity != null ? Number(raw.quantity) : undefined;

    return {
        name: raw.name,
        unit: raw.unit || 'ml',
        price_per_ml: Number.isFinite(price) ? price : 0,
        is_active: normalizeBoolean(raw.is_active, true),
        code: raw.code,
        base: raw.base,
        quantity: Number.isFinite(quantity) ? quantity : undefined
    };
}

function normalizeBoolean(value, defaultValue = false) {
    if (typeof value === 'boolean') return value;
    const str = (value ?? '').toString().toLowerCase().trim();
    if (['1', 'true', 'yes', 'y', 'on', 'active'].includes(str)) return true;
    if (['0', 'false', 'no', 'n', 'off', 'inactive'].includes(str)) return false;
    return defaultValue;
}

function parseJson(text) {
    try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    } catch (error) {
        console.error('Không thể parse JSON:', error);
        return [];
    }
}

function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const rawValues = lines[i].split(',');
        const values = rawValues.map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((key, idx) => {
            row[key] = values[idx];
        });
        rows.push(row);
    }

    return rows;
}

function convertToCsv(rows) {
    if (!Array.isArray(rows) || !rows.length) return '';
    const headers = ['id', 'name', 'unit', 'price_per_ml', 'is_active'];
    const lines = [headers.join(',')];

    rows.forEach(item => {
        const values = headers.map(key => safeCsvValue(item?.[key] ?? ''));
        lines.push(values.join(','));
    });

    return lines.join('\n');
}

function safeCsvValue(value) {
    const str = String(value ?? '');
    const escaped = str.replace(/"/g, '""');
    if (/[",\n]/.test(escaped)) {
        return `"${escaped}"`;
    }
    return escaped;
}

function triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    bindImportExportControls();
    renderColorantList();
});
