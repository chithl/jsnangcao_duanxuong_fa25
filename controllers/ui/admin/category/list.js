import { CategoryAPI } from "../../../api/CategoryAPI.js";

var categoryModule = new CategoryAPI();

async function loadCategories() {
    try {
        // Lấy dữ liệu từ API
        var categoryData = await categoryModule.getAllCategory();
        
        // Nếu không có dữ liệu (Firebase trả về null nếu rỗng)
        if (!categoryData) {
            document.getElementById('category-list').innerHTML = '<tr><td colspan="6" class="p-5 text-center">Không có dữ liệu</td></tr>';
            return;
        }

        /**
         * Chuyển đổi Object của Firebase thành Array.
         * Firebase trả về: { "-Key1": {name: "..."}, "-Key2": {name: "..."} }
         * Chúng ta cần: [ { firebaseKey: "-Key1", name: "..." }, ... ]
         */
        var data = Object.keys(categoryData).map(key => {
            return {
                firebaseKey: key, // Dùng key này để thực hiện xóa/sửa trên Firebase
                ...categoryData[key]
            };
        });

        var content = '';
        data.forEach((element, index) => {
            content +=
            `<tr>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${index + 1}
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
                        <p class="rounded-full bg-${element.is_active ? 'success' : 'warning'}-50 px-2 py-0.5 text-theme-xs font-medium text-${element.is_active ? 'success' : 'warning'}-700 dark:bg-${element.is_active ? 'success' : 'warning'}-500/15 dark:text-${element.is_active ? 'success' : 'warning'}-500">
                            ${element.is_active ? 'Hiện' : 'Ẩn'}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.created_at ? new Date(element.created_at).toLocaleDateString('vi-VN') : '—'}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                        <a href="edit-category.html?id=${element.firebaseKey}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                        <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${element.firebaseKey}">Xóa</button>
                    </div>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('category-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
    }
}

function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const idToDelete = e.currentTarget.getAttribute('data-id');
            if (confirm(`Bạn có chắc chắn muốn xóa danh mục này?`)) {
                try {
                    // Gọi API delete với firebaseKey
                    await categoryModule.deleteCategory(idToDelete);
                    alert("Xóa danh mục thành công!");
                    loadCategories(); // Tải lại danh sách
                } catch (error) {
                    alert("Có lỗi xảy ra khi xóa!");
                    console.error(error);
                }
            }
        });
    });
}

// Khởi tạo tải dữ liệu khi trang web load
(async () => {
    await loadCategories();
})();