import { ProjectAPI } from "../../../api/ProjectAPI.js";
import { UserAPI } from "../../../api/UserAPI.js";

const projectModule = new ProjectAPI();
const userModule = new UserAPI();
const form = document.getElementById("add-project-form");

(async () => {
    try {
        const res = await userModule.getAllUsers();
        if (res.success) {
            const users = res.data;
            const select = document.getElementById("user_id");
            Object.keys(users).forEach(id => {
                const opt = document.createElement("option");
                opt.value = id;
                opt.textContent = users[id].name;
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
        user_id: document.getElementById("user_id").value,
        status: document.getElementById("status").value,
        notes: document.getElementById("notes").value,
        create_at: new Date().toISOString()
    };
    try {
        await projectModule.storeProject(data);
        alert("Thêm dự án thành công!");
        window.location.href = "projects.html";
    } catch (error) {
        console.error(error);
        alert("Thêm dự án thất bại!");
    }
});