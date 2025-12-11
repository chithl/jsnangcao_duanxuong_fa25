import { CoverageRuleAPI } from "../../../api/CoverageRuleAPI.js";

(async () => {
    try {
        var coverageRuleModule = new CoverageRuleAPI();
        var coverageRuleList = await coverageRuleModule.getAllCoverageRules();
        var data = Array.isArray(coverageRuleList) ? coverageRuleList : (coverageRuleList && coverageRuleList.data) || [];
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
                            ${element.segment}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.surface_type}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.recommended_coats}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.wastage_pct}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <a href="edit-coverage-rule.html?id=${element.id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                    <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${element.id}">Xóa</button>
                </td>
            </tr>`;
        });
        const listEl = document.getElementById('coverage-rule-list');
        if (listEl) {
            listEl.innerHTML = content;
        } else {
            console.warn('Không tìm thấy phần tử có id "coverage-rule-list".');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách coverage-rules:', error);
    }
})();