import { UserAPI } from "../../../api/UserAPI.js";

var UserModule = new UserAPI();

async function loadData() {
    try {
        var res = await UserModule.getAllUsers();

        if (!res.success) {
            console.error("Không lấy được user");
            return;
        }

        const users = res.data;

        const data = users
            ? Object.entries(users).map(([id, item]) => ({
                id,
                ...item
            }))
            : [];

        console.log(data);

        var content = ``;
        data.forEach(element => {
            content +=
                `
                        <tr>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                ${element.name}
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p>
                                ${element.role == "customer"
                                ? '<p class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Khách hàng</p>'
                                : '<p class="rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">Quản trị viên</p>'
                            } 
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p>
                                ${element.status == 1
                                    ? '<p class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Hoạt động</p>'
                                    : '<p class="rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">Vô hiệu hóa</p>'
                                } 
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center space-x-2">
                              <a href="edit-user.html?id=${element.id}"
                                class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">
                                Sửa
                              </a>

                              <a href="user-address.html?id=${element.id}"
                                class="inline-flex items-center justify-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-sm font-medium text-warning-500 dark:bg-warning-500/15 dark:text-warning-500">
                                <i class="bi bi-eye"></i>
                              </a>
                            </div>
                          </td>
                          
            `
        });
        const listData = document.querySelector('#list');
        if (listData) {
            listData.innerHTML = content;
            addDeleteListeners();
        } else {
            console.error('Lỗi', error);
        }
    } catch (error) {
        console.error('Lỗi không tải được danh sách', error);
    }
}

function addDeleteListeners() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;

            if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá: ${id} không?`)) return;

            try {
                const response = await ReviewModule.deleteReview(id);

                if (response && response.status === 200) {
                    alert('Xóa đánh giá thành công!');
                    loadData();
                } else {
                    console.error('Xóa thất bại', response);
                }
            } catch (error) {
                console.error('Lỗi khi xóa', error);
            }
        });
    });
}



(async () => {
    await loadData();
})();