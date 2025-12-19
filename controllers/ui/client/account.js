import { AuthAPI } from "../../api/AuthAPI.js";
import { UserAPI } from "../../api/UserAPI.js";

const auth = new AuthAPI();
const userModel = new UserAPI();

/**
 * Kiểm tra đăng nhập
 */
const token = localStorage.getItem("token");
const userLocal = localStorage.getItem("user");

if (!token || !userLocal) {
    alert("Vui lòng đăng nhập");
    window.location.href = "login.html";
}

const decoded = JSON.parse(atob(token));
const userId = decoded.uid; 
const user = JSON.parse(userLocal);

/**
 * Hiển thị thông tin
 */
document.getElementById("user-name").innerText = user.name;
document.getElementById("name").value = user.name;
document.getElementById("email").value = user.email;
document.getElementById("phone").value = user.phone || "";
document.getElementById("password").value = user.password;

/**
 * Update profile
 */
document.querySelector(".profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name) {
        alert("Tên không được để trống");
        return;
    }

    const result = await userModel.updateUser(userId, {
        name,
        phone,
        password
    });

    if (!result.success) {
        alert(result.errors[0].message);
        return;
    }

    // Update localStorage
    user.name = name;
    user.phone = phone;
    user.password = password;
    localStorage.setItem("user", JSON.stringify(user));

    document.getElementById("user-name").innerText = `Chào, ${name}`;

    alert("Cập nhật thông tin thành công");
});

/**
 * Logout
 */
document.querySelector(".logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});
