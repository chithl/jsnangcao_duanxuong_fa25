import { ColorantsAPI } from "../../../../api/ColorantsAPI.js";

const colorantsAPI = new ColorantsAPI();

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
        result.data.forEach(colorant => {
            createColorantRow(colorant);
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
function createColorantRow(colorant) {
    const content = document.getElementById('colorant-list');
    
    // Xác định trạng thái
    const statusClass = colorant.is_active == true
        ? 'bg-success-50 text-success-600' 
        : 'bg-gray-100 text-gray-600';
    const statusText = colorant.is_active == true ? 'Hoạt động' : 'Ngưng hoạt động';
    console.log(colorant.is_active);
    
    content.innerHTML += `
        <tr>
        <td class="px-5 py-4 sm:px-6">${colorant.id || 'N/A'}</td>
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

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    renderColorantList();
});
