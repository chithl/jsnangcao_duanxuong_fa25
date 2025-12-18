import { ReviewAPI } from "../../../api/ReviewAPI.js";

var ReviewModule = new ReviewAPI();

async function loadData() {
  try {
    var list = await ReviewModule.getAllReview();
    const data = list
      ? Object.entries(list).map(([id, item]) => ({
        id,
        ...item
      }))
      : [];
    var content = ``;
    data.forEach(element => {
      content +=
        `
                        <tr>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                ${element.reviewerName}
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                ${element.rating}
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                                ${element.comment}
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center">
                              <p>
                                ${element.status == 1
          ? '<p class="rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">Hiện</p>'
          : '<p class="rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">Ẩn</p>'
        } 
                              </p>
                            </div>
                          </td>
                          <td class="px-5 py-4 sm:px-6">
                            <div class="flex items-center space-x-2">
                              <a href="edit-review.html?id=${element.id}"
                                class="inline-flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium text-success-500 rounded-lg bg-success-50 mr-1">
                                Sửa <i class="bi bi-pencil-square"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
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