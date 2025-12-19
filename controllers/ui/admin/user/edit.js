import { UserAPI } from "../../../api/UserAPI.js";

var UserModule = new UserAPI();
var params = new URLSearchParams(window.location.search);
var id = params.get("id");
var form = document.getElementById("edit-user");

(async () => {
    if (!id) {
        alert("Thiếu ID review");
        return;
    }

    var data = await UserModule.getUserById(id);
    const users = data.data;
    console.log(users);
    const roleText =
        users.role === "admin"
            ? "Quản trị viên"
            : users.role === "customer"
                ? "Khách hàng"
                : users.role ?? "Không xác định";
    document.getElementById("user-role").innerHTML = roleText;

    if (users) {
        document.getElementById("name").value = users.name ?? "";
        document.getElementById("email").value = users.email ?? "";
        document.getElementById("phone").value = users.phone || "Chưa cập nhật.";
        document.getElementById("status").value = String(users.status);
        document.getElementById("createdAt").value = users.createdAt ?? "";
        document.getElementById("updatedAt").value = new Date().toLocaleString("vi-VN");
        document.getElementById("role").value = users.role ?? "";



    }

})();



form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        status: document.getElementById("status").value,
        phone: document.getElementById("phone").value,
        role: document.getElementById("role").value,
        createdAt: document.getElementById("createdAt").value,
        updatedAt: document.getElementById("updatedAt")?.value,

    };

    await UserModule.updateUser(id, data);

    alert("Cập nhật đánh giá thành công!");
    window.location.href = "user.html";
});

