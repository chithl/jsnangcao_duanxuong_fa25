import { SurfacesAPI } from "../../../api/SurfacesAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";
import { RoomAPI } from "../../../api/RoomAPI.js";

const surfaceModule = new SurfacesAPI();
const productModule = new ProductAPI();
const roomModule = new RoomAPI();
const form = document.getElementById("add-surface-form");

(async () => {
    try {
        const [products, rooms] = await Promise.all([
            productModule.getAllProduct(),
            roomModule.getAllRoom()
        ]);

        const prodSelect = document.getElementById("product_id");
        if (products && prodSelect) {
            Object.keys(products).forEach(id => {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = products[id].name;
                prodSelect.appendChild(opt);
            });
        }

        const roomSelect = document.getElementById("room_id");
        if (rooms && roomSelect) {
            Object.keys(rooms).forEach(id => {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = rooms[id].name;
                roomSelect.appendChild(opt);
            });
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
        await surfaceModule.storeSurface(data);
        alert("Thêm bề mặt thành công!");
        window.location.href = "surfaces.html";
    } catch (error) {
        console.error(error);
    }
});