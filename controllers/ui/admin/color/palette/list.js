import { ColorPalettesAPI } from "../../../../api/ColorPalettesAPI.js";

const colorPalettesAPI = new ColorPalettesAPI();

/**
 * Render danh sách color palettes vào bảng
 */
async function renderPaletteList() {
    try {
        const result = await colorPalettesAPI.list();
        console.log(result);

        if (!result.success) {
            console.error('Không thể tải danh sách bảng màu');
            return;
        }

        const tbody = document.getElementById('palette-list');
        if (!tbody) {
            console.error('Không tìm thấy element #palette-list');
            return;
        }

        // Xóa nội dung cũ
        tbody.innerHTML = '';

        // Nếu không có dữ liệu
        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-5 py-4 sm:px-6 text-center text-gray-500">
                        Không có dữ liệu bảng màu
                    </td>
                </tr>
            `;
            return;
        }

        // Render từng palette
        result.data.forEach(palette => {
            createPaletteRow(palette);
        });

        // Gắn event listener cho nút xóa
        attachDeleteHandlers();

    } catch (error) {
        console.error('Lỗi khi render danh sách bảng màu:', error);
    }
}

/**
 * Tạo một hàng trong bảng cho color palette
 */
function createPaletteRow(palette) {
    // Xác định trạng thái
    const isActive = palette.is_active === 'TRUE' || palette.is_active === true || palette.is_active === 'true';
    const statusClass = isActive
        ? 'bg-success-50 text-success-600'
        : 'bg-gray-100 text-gray-600';
    const statusText = isActive ? 'Hoạt động' : 'Ngưng hoạt động';

    const content = document.getElementById('palette-list');
    content.innerHTML += `
    <tr>
        <td class="px-5 py-4 sm:px-6">${palette.id || 'N/A'}</td>
        <td class="px-5 py-4 sm:px-6">${palette.name || 'N/A'}</td>
        <td class="px-5 py-4 sm: px-6">${palette.notes || '-'}</td>
        <td class="px-5 py-4 sm:px-6">
            <span class="inline-flex rounded-full ${statusClass} px-2 py-0.5 text-xs font-medium">
                ${statusText}
            </span>
        </td>
        <td class="px-5 py-4 sm: px-6">
            <a href="edit-color-palettes.html?id=${palette.id}" 
               class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark: bg-blue-light-500/15 dark: text-blue-light-500">
                Sửa
            </a>
            <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" 
                    data-id="${palette.id}">
                Xóa
            </button>
        </td>
    </tr>
    `;

    return content;
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

            if (confirm('Bạn có chắc chắn muốn xóa bảng màu này?')) {
                try {
                    const result = await colorPalettesAPI.deletePalette(id, false);
                    if (result.success) {
                        alert('Xóa thành công!');
                        renderPaletteList(); // Reload lại danh sách
                    } else {
                        alert('Xóa thất bại:  ' + (result.message || result.error));
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa:', error);
                    alert('Có lỗi xảy ra khi xóa! ');
                }
            }
        });
    });
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    renderPaletteList();
});