import { ProjectAPI } from "../../../api/ProjectAPI.js";
import { UserAPI } from "../../../api/UserAPI.js";

const projectModule = new ProjectAPI();
const userModule = new UserAPI();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("edit-project-form");

(async () => {
    try {
        const userRes = await userModule.getAllUsers();
        if (userRes.success) {
            const users = userRes.data;
            const select = document.getElementById("user_id");
            Object.keys(users).forEach(uid => {
                const opt = document.createElement("option");
                opt.value = uid;
                opt.textContent = users[uid].name;
                select.appendChild(opt);
            });
        }

        const projectData = await projectModule.getOneProject(id);
        if (projectData) {
            document.getElementById("id").value = id;
            document.getElementById("name").value = projectData.name;
            document.getElementById("user_id").value = projectData.user_id;
            document.getElementById("status").value = projectData.status;
            document.getElementById("notes").value = projectData.notes;
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
        notes: document.getElementById("notes").value
    };
    try {
        await projectModule.updateProject(id, data);
        alert("Cập nhật dự án thành công!");
        window.location.href = "projects.html";
    } catch (error) {
        console.error(error);
        alert("Cập nhật thất bại!");
    }
});