import { CategoryAPI } from "../../../api/CategoryAPI.js";

var categoryModule = new CategoryAPI();

async function loadCategories() {
    try {
        var categoryList = await categoryModule.getAllCategory();
        var data = Array.isArray(categoryList) ? categoryList : (categoryList && categoryList.data) || [];
        var content = '';
        data.forEach(element => {
            content +=
            `<tr>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.id}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.name}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.description || '—'}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.product_count || 0}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="rounded-full bg-${element.is_active ? 'success' : 'warning'}-50 px-2 py-0.5 text-theme-xs font-medium text-${element.is_active ? 'success' : 'warning'}-700 dark:bg-${element.is_active ? 'success' : 'warning'}-500/15 dark:text-${element.is_active ? 'success' : 'warning'}-500">
                            ${element.is_active ? '✓ Hoạt động' : '○ Không hoạt động'}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${new Date(element.created_at).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <a href="edit-category.html?id=${element.id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                    <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${element.id}">Xóa</button>
                </td>
            </tr>`;
        });
        const listEl = document.getElementById('category-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        } else {
            console.warn('Không tìm thấy phần tử có id "category-list".');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
    }
}

function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const idToDelete = e.target.getAttribute('data-id');
            if (confirm(`Bạn có chắc chắn muốn xóa Danh mục có ID: ${idToDelete} không?`)) {
                try {
                    const response = await categoryModule.deleteCategory(idToDelete);
                    if (response && (response.status === 204 || response.status === 200)) {
                        alert("Xóa danh mục thành công!");
                        loadCategories();
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadCategories();
})();
