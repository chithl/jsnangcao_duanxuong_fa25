import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";
import { RoomAPI } from "../../../api/RoomAPI.js";

const surfaceModule = new SurfacesAPI();
const productModule = new ProductAPI();
const roomModule = new RoomAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-surface-form");

(async () => {
    try {
        const [products, rooms, surfaceData] = await Promise.all([
            productModule.getAllProduct(),
            roomModule.getAllRoom(),
            surfaceModule.getOneSurface(id)
        ]);

        const prodSelect = document.getElementById("product_id");
        if (products && prodSelect) {
            Object.keys(products).forEach(pid => {
                const opt = document.createElement("option");
                opt.value = pid;
                opt.textContent = products[pid].name;
                prodSelect.appendChild(opt);
            });
        }

        const roomSelect = document.getElementById("room_id");
        if (rooms && roomSelect) {
            Object.keys(rooms).forEach(rid => {
                const opt = document.createElement("option");
                opt.value = rid;
                opt.textContent = rooms[rid].name;
                roomSelect.appendChild(opt);
            });
        }

        if (surfaceData) {
            document.getElementById("id").value = id;
            document.getElementById("surface_type").value = surfaceData.surface_type;
            document.getElementById("type").value = surfaceData.type;
            document.getElementById("product_id").value = surfaceData.product_id;
            document.getElementById("room_id").value = surfaceData.room_id;
            document.getElementById("area_m2").value = surfaceData.area_m2;
            document.getElementById("coats").value = surfaceData.coats;
            document.getElementById("wastage_pct").value = surfaceData.wastage_pct;
            document.getElementById("status").checked = surfaceData.status;
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        surface_type: document.getElementById("surface_type").value,
        type: document.getElementById("type").value,
        product_id: document.getElementById("product_id").value,
        room_id: document.getElementById("room_id").value,
        area_m2: parseFloat(document.getElementById("area_m2").value),
        coats: parseInt(document.getElementById("coats").value),
        wastage_pct: parseFloat(document.getElementById("wastage_pct").value),
        status: document.getElementById("status").checked
    };
    try {
        await surfaceModule.updateSurface(id, data);
        alert("Cập nhật bề mặt thành công!");
        window.location.href = "surfaces.html";
    } catch (error) {
        console.error(error);
    }
});