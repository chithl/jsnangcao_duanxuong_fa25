import { PromotionAPI } from "../../../api/PromotionAPI.js";

const promotionModule = new PromotionAPI();

async function loadPromotions() {
    try {
        const promotions = await promotionModule.getAllPromotion();
        let content = '';

        if (promotions && typeof promotions === 'object') {
            Object.keys(promotions).forEach(id => {
                const item = promotions[id];
                const statusLabel = item.is_active == 1 ? 
                    '<span class="text-success-600 bg-success-50 px-2.5 py-0.5 rounded-full text-xs font-medium">Hoạt động</span>' : 
                    '<span class="text-error-600 bg-error-50 px-2.5 py-0.5 rounded-full text-xs font-medium">Tạm dừng</span>';

                content += `
                <tr>
                    <td class="px-5 py-4 sm:px-6">
                        <p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">${item.code}</p>
                        <p class="text-gray-500 text-theme-xs dark:text-gray-400">Loại: ${item.type}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">${item.value}${item.type === '%' ? '%' : 'đ'}</p>
                        <p class="text-gray-500 text-theme-xs dark:text-gray-400">Tối thiểu: ${parseFloat(item.min_order).toLocaleString()}đ</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">${item.used_count} / ${item.usage_limit}</p>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <p class="text-gray-500 text-theme-xs dark:text-gray-400">${item.start_at || 'Bắt đầu ngay'} - ${item.end_at || 'Không hết hạn'}</p>
                        <div class="mt-1">${statusLabel}</div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                        <div class="flex items-center gap-3">
                            <a href="edit-promotion.html?id=${id}" class="text-blue-light-500 hover:underline text-sm font-medium">Sửa</a>
                            <button class="btn-delete text-error-600 hover:underline text-sm font-medium" data-id="${id}">Xóa</button>
                        </div>
                    </td>
                </tr>`;
            });
        }

        const listEl = document.getElementById('promotion-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        }
    } catch (error) {
        console.error(error);
    }
}

function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const idToDelete = e.target.getAttribute('data-id');
            if (confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi này không?`)) {
                try {
                    await promotionModule.deletePromotion(idToDelete);
                    alert("Xóa khuyến mãi thành công!");
                    loadPromotions();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadPromotions();
})();