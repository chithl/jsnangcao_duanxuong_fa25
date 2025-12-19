document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("user-menu");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    menu.innerHTML = `
                                <li><a href="register.html" class="dropdown-item">Đăng ký</a></li>
            <li><a href="login.html" class="dropdown-item">Đăng nhập</a></li>
                `;
    return;
  }

  // Đã đăng nhập
  menu.innerHTML = `
                    <li>
                        <a href="account.html" style="text-decoration: none;" class="dropdown-item-text">
                            <strong>${user.name}</strong>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button class="dropdown-item text-danger" id="logout-btn">
                            Đăng xuất
                        </button>
                    </li>
                `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
});
