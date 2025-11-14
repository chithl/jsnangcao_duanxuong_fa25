import { CategoryAPI } from "../../api/CategoryAPI.js";

(async () => {
    try {
        var categoryModule = new CategoryAPI();

        var categoryList = await categoryModule.getAllCategory();

        // categoryList có thể là mảng (resp.data) hoặc object { data: [...] }
        var data = Array.isArray(categoryList) ? categoryList : (categoryList && categoryList.data) || [];

        var content = '';
        data.forEach(element => {
            content += `<tr>
                    <td>${element.id}</td>
                    <td>${element.name}</td>
                    <td>${element.description}</td>
                    <td>${element.parent_id ?? ''}</td>
                    <td>${element.is_active==1?'Active':'Inactive'}</td>
                    <td>${element.created_at}</td>
                    <td>
                        <a href="#" class="btn btn-outline-info">Edit</a>
                        <a href="#" class="btn btn-outline-danger">Delete</a>
                    </td>
                </tr>`;
        });

        const listEl = document.getElementById('category-list');
        if (listEl) {
            listEl.innerHTML = content;
        } else {
            console.warn('Không tìm thấy phần tử có id "category-list".');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách categories:', error);
    }
})();