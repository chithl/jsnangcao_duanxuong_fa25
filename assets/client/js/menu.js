  document.addEventListener("DOMContentLoaded", () => {

    const menu = document.getElementById("user-menu");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      menu.innerHTML = `
                    
                `;
      return;
    }

    // Đã đăng nhập
    menu.innerHTML = `
                    <li>
                        <span class="dropdown-item-text">
                            <strong>${user.name}</strong>
                        </span>
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
