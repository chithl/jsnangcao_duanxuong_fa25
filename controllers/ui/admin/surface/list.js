import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";
import { RoomAPI } from "../../../api/RoomAPI.js";

const surfaceModule = new SurfacesAPI();
const productModule = new ProductAPI();
const roomModule = new RoomAPI();

async function loadSurfaces() {
    try {
        const [surfaceData, productData, roomData] = await Promise.all([
            surfaceModule.getAllSurfaces(),
            productModule.getAllProduct(),
            roomModule.getAllRoom()
        ]);

        const surfaces = surfaceData || {};
        const products = productData || {};
        const rooms = roomData || {};
        let content = '';

        Object.keys(surfaces).forEach(id => {
            const item = surfaces[id];
            const productName = products[item.product_id] ? products[item.product_id].name : "N/A";
            const roomName = rooms[item.room_id] ? rooms[item.room_id].name : "N/A";
            
            content += `
            <tr>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">${item.surface_type}</p>
                    <p class="text-gray-500 text-theme-xs dark:text-gray-400">${item.type}</p>
                </td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${productName}</p></td>
                <td class="px-5 py-4 sm:px-6"><p class="text-gray-500 text-theme-sm dark:text-gray-400">${roomName}</p></td>
                <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 text-theme-sm dark:text-gray-400">DT: ${item.area_m2}m2</p>
                    <p class="text-gray-500 text-theme-xs dark:text-gray-400">Lớp: ${item.coats} | Hao hụt: ${item.wastage_pct}%</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-3">
                        <a href="edit-surface.html?id=${id}" class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500">Sửa</a>
                        <button class="btn-delete inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500" data-id="${id}">Xóa</button>
                    </div>
                </td>
            </tr>`;
        });

        const listEl = document.getElementById('surface-list');
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
            if (confirm(`Bạn có chắc muốn xóa bề mặt này?`)) {
                try {
                    await surfaceModule.deleteSurface(idToDelete);
                    alert("Xóa thành công!");
                    loadSurfaces();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
}

(async () => {
    await loadSurfaces();
})();