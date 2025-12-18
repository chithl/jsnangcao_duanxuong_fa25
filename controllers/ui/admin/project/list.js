import { ProjectAPI } from "../../../api/ProjectAPI.js";
import { UserAPI } from "../../../api/UserAPI.js";

const projectModule = new ProjectAPI();
const userModule = new UserAPI();

async function loadProjects() {
    try {
        const [projectResp, userResp] = await Promise.all([
            projectModule.getAllProject(),
            userModule.getAllUsers()
        ]);

        const projects = projectResp || {};
        const users = userResp.success ? userResp.data : {};
        let content = '';

        Object.keys(projects).forEach(id => {
            const item = projects[id];
            const user = users[item.user_id];
            const userName = user ? user.name : "N/A";

            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.name}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${userName}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.status}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.create_at}</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <a href="edit-project.html?id=${id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                    <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${id}">Xóa</button>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('project-list');
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
            if (confirm(`Bạn có chắc muốn xóa dự án này?`)) {
                try {
                    await projectModule.deleteProject(idToDelete);
                    alert("Xóa dự án thành công!");
                    loadProjects();
                } catch (error) {
                    console.error(error);
                    alert("Xóa thất bại!");
                }
            }
        });
    });
}

(async () => {
    await loadProjects();
})();