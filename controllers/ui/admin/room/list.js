import { RoomAPI } from "../../../api/RoomAPI.js";
import { ProjectAPI } from "../../../api/ProjectAPI.js";

const roomModule = new RoomAPI();
const projectModule = new ProjectAPI();

async function loadRooms() {
    try {
        const [roomData, projectData] = await Promise.all([
            roomModule.getAllRoom(),
            projectModule.getAllProject()
        ]);

        const rooms = roomData || {};
        const projects = projectData || {};
        let content = '';

        Object.keys(rooms).forEach(id => {
            const item = rooms[id];
            // Ánh xạ id dự án để lấy tên dự án
            const projectName = projects[item.project_id] ? projects[item.project_id].name : item.project_id;
            
            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.name}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${item.length_m} x ${item.width_m} x ${item.height_m}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">Cửa đi: ${item.door_area_m2} / Cửa sổ: ${item.window_area_m2}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${projectName}</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <a href="edit-room.html?id=${id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                    <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${id}">Xóa</button>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('room-list');
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
            if (confirm(`Bạn có chắc muốn xóa phòng này?`)) {
                try {
                    await roomModule.deleteRoom(idToDelete);
                    alert("Xóa phòng thành công!");
                    loadRooms();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadRooms();
})();