import { RoomAPI } from "../../../api/RoomAPI.js";
import { ProjectAPI } from "../../../api/ProjectAPI.js";

const roomModule = new RoomAPI();
const projectModule = new ProjectAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-room-form");

(async () => {
    try {
        // Lấy danh sách dự án trước để đổ vào select
        const projects = await projectModule.getAllProject();
        const select = document.getElementById("project_id");
        if (projects && select) {
            Object.keys(projects).forEach(pid => {
                const opt = document.createElement("option");
                opt.value = pid;
                opt.textContent = projects[pid].name;
                select.appendChild(opt);
            });
        }

        // Sau đó lấy dữ liệu phòng để điền vào form
        const roomData = await roomModule.getOneRoom(id);
        if (roomData && typeof roomData !== 'string') {
            document.getElementById("id").value = id;
            document.getElementById("name").value = roomData.name;
            document.getElementById("project_id").value = roomData.project_id;
            document.getElementById("length_m").value = roomData.length_m;
            document.getElementById("width_m").value = roomData.width_m;
            document.getElementById("height_m").value = roomData.height_m;
            document.getElementById("door_area_m2").value = roomData.door_area_m2;
            document.getElementById("window_area_m2").value = roomData.window_area_m2;
            document.getElementById("paint_ceiling").checked = roomData.paint_ceiling;
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
        const response = await roomModule.updateRoom(id, data);
        if (response && !response.error) {
            alert("Cập nhật phòng thành công!");
            window.location.href = "rooms.html";
        }
    } catch (error) {
        console.error(error);
    }
});