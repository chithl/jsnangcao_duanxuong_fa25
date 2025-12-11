import { FormulaComponentAPI } from "../../../api/FormulaComponentAPI.js";

var formulaComponentModule = new FormulaComponentAPI();

async function loadFormulaComponents() {
    try {
        var formulaComponentList = await formulaComponentModule.getAllFormulaComponents();
        var data = Array.isArray(formulaComponentList) ? formulaComponentList : (formulaComponentList && formulaComponentList.data) || [];
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
                            ${element.formula_id}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.colorant_id}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.ml_per_L}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <a href="edit-formula-component.html?id=${element.id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                    <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${element.id}">Xóa</button>
                </td>
            </tr>`;
        });
        const listEl = document.getElementById('formula-component-list');
        if (listEl) {
            listEl.innerHTML = content;
            addDeleteListeners();
        } else {
            console.warn('Không tìm thấy phần tử có id "formula-component-list".');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách thành phần công thức:', error);
    }
}

function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const idToDelete = e.target.getAttribute('data-id');
            if (confirm(`Bạn có chắc chắn muốn xóa Thành phần Công thức có ID: ${idToDelete} không?`)) {
                try {
                    const response = await formulaComponentModule.deleteFormulaComponent(idToDelete);
                    if (response && (response.status === 204 || response.status === 200)) {
                        alert("Xóa thành phần công thức thành công!");
                        loadFormulaComponents();
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadFormulaComponents();
})();