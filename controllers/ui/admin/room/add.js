import { RoomAPI } from "../../../api/RoomAPI.js";
import { ProjectAPI } from "../../../api/ProjectAPI.js";

const roomModule = new RoomAPI();
const projectModule = new ProjectAPI();
const form = document.getElementById("add-room-form");

(async () => {
    try {
        const projects = await projectModule.getAllProject();
        const select = document.getElementById("project_id");
        if (projects && select) {
            Object.keys(projects).forEach(id => {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = projects[id].name;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error(error);
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById("name").value,
        project_id: document.getElementById("project_id").value,
        length_m: parseFloat(document.getElementById("length_m").value),
        width_m: parseFloat(document.getElementById("width_m").value),
        height_m: parseFloat(document.getElementById("height_m").value),
        door_area_m2: parseFloat(document.getElementById("door_area_m2").value),
        window_area_m2: parseFloat(document.getElementById("window_area_m2").value),
        paint_ceiling: document.getElementById("paint_ceiling").checked
    };
    try {
        const response = await roomModule.storeRoom(data);
        if (response && !response.error) {
            alert("Thêm phòng thành công!");
            window.location.href = "rooms.html";
        }
    } catch (error) {
        console.error(error);
    }
});