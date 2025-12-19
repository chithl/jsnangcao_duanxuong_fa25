import { UserAPI } from "../../../api/UserAPI.js";
import { AddressesAPI } from "../../../api/AddressesAPI.js";

const UserModule = new UserAPI();
const AddressModule = new AddressesAPI();

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

if (!userId) {
    alert("Thiếu ID người dùng");
    throw new Error("Missing user ID");
}

// USER ELEMENTS
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userRole = document.getElementById("user-role");
const userStatus = document.getElementById("user-status");

// ADDRESS LIST
const addressList = document.getElementById("address-list");

(async () => {
    await loadUserInfo();
    await loadUserAddresses();
})();

// LOAD USER INFO
async function loadUserInfo() {
    const res = await UserModule.getUserById(userId);
    const user = res.data;

    userName.innerText = user.name ?? "—";
    userEmail.innerText = user.email ?? "—";

    userRole.innerText =
        user.role === "admin"
            ? "Quản trị viên"
            : user.role === "customer"
                ? "Khách hàng"
                : "Không xác định";

    userStatus.innerText = user.status == 1 ? "Hoạt động" : "Vô hiệu";
}

// LOAD ADDRESSES
async function loadUserAddresses() {
    const addresses = await AddressModule.getAddressesByUser(userId);
    renderAddresses(addresses);
}

// RENDER ADDRESS LIST
function renderAddresses(addresses) {
    if (!addresses || addresses.length === 0) {
        addressList.innerHTML = `
            <div class="text-sm italic text-gray-500">
                Người dùng chưa có địa chỉ nào
            </div>
        `;
        return;
    }

    addressList.innerHTML = addresses
        .map((address, index) => addressItem(address, index))
        .join("");
}

// ADDRESS ITEM TEMPLATE
function addressItem(address, index) {
    return `
        <div class="rounded-xl border border-gray-200 p-4 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div class="mb-3 flex items-center justify-between">
                <div class="font-medium text-gray-800 dark:text-white">
                    Địa chỉ #${index + 1}
                </div>

                ${
                    address.is_default
                        ? `<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Mặc định
                           </span>`
                        : ""
                }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div><b>Người nhận:</b> ${address.receiver_name ?? "—"}</div>
                <div><b>SĐT:</b> ${address.phone ?? "—"}</div>
                <div><b>Thành phố:</b> ${address.city ?? "—"}</div>
                <div><b>Phường:</b> ${address.ward ?? "—"}</div>
                <div class="md:col-span-2"><b>Địa chỉ:</b> ${address.line1 ?? "—"}</div>
                <div class="md:col-span-2"><b>Ghi chú:</b> ${address.note ?? "—"}</div>
            </div>
        </div>
    `;
}
