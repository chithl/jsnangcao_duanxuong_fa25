import { ProductAPI } from "../../../api/ProductAPI.js";

var productModule = new ProductAPI();

let currentPage = 1;
let pageSize = 10;
let totalItems = 0;

export async function loadList(page = 1, size = 10) {
  try {
    currentPage = page;
    pageSize = size;
    
    var productList = await productModule.getAllProduct();
    var data = [];

    if (Array.isArray(productList)) {
      data = productList.map((item) => ({
        id: item?.id || item?._id || item?.key || item?.product_id || "",
        ...item,
      }));
    } else {
      data = Object.entries(productList || {}).map(([id, item]) => ({
        id,
        ...item,
      }));
    }

    // Tính toán phân trang
    totalItems = data.length;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = data.slice(startIndex, endIndex);

    var content = "";

    paginatedData.forEach((element) => {
      content += `<tr>
                <td class="px-5 py-4 sm:px-6" hidden>
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.id}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.name}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.line}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                            ${element.segment}
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                    `;
      if (element.images && element.images.length > 0) {
        content += `<img src="${element.images[0]}" alt="${element.name}" class="w-10 h-10 rounded-full object-cover mr-1"/>`;
      } else {
        content += `<img src="https://via.placeholder.com/40" alt="${element.name}" class="w-10 h-10 rounded-full object-cover"/>`;
      }
      content += `
                    </div> 
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center">
                        <p class="${
                          element.is_active == true
                            ? "rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500"
                            : "rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500"
                        }">
                            ${
                              element.is_active == true
                                ? "Bán"
                                : "Ngừng"
                            }
                        </p>
                    </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                    <a href="product-detail.html?id=${element.id}"
                      class="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
                       <i class="bi bi-eye"></i>
                    </a>
                        <a href="edit-products.html?id=${element.id}"
                            class="inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 px-2.5 py-0.5 text-sm font-medium text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 hover:bg-blue-light-100">
                             <i class="bi bi-pencil-square"></i>
                        </a>

                        <button type="button" onclick="deleteProduct('${element.id}')"
                            class="inline-flex items-center justify-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-error-100">
                             <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });
    const listEl = document.getElementById("product-list");
    if (listEl) {
      listEl.innerHTML = content;
    } else {
      console.warn('Không tìm thấy phần tử có id "product-list".');
    }
    
    // Render phân trang
    renderPagination();
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
  }
}

// Hàm render phân trang
function renderPagination() {
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginationEl = document.getElementById("pagination");
  
  if (!paginationEl || totalPages <= 1) {
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Nút Previous
  paginationHTML += `
    <button 
      onclick="changePage(${currentPage - 1})" 
      ${currentPage === 1 ? 'disabled' : ''}
      class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
      Trước
    </button>
  `;
  
  // Các nút số trang
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  if (startPage > 1) {
    paginationHTML += `
      <button 
        onclick="changePage(1)" 
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
        1
      </button>
    `;
    if (startPage > 2) {
      paginationHTML += `<span class="px-2 py-2 text-gray-500">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button 
        onclick="changePage(${i})" 
        class="px-3 py-2 text-sm font-medium ${i === currentPage 
          ? 'text-white bg-brand-500 border border-brand-500' 
          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'} rounded-md">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="px-2 py-2 text-gray-500">...</span>`;
    }
    paginationHTML += `
      <button 
        onclick="changePage(${totalPages})" 
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
        ${totalPages}
      </button>
    `;
  }
  
  // Nút Next
  paginationHTML += `
    <button 
      onclick="changePage(${currentPage + 1})" 
      ${currentPage === totalPages ? 'disabled' : ''}
      class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
      Sau
    </button>
  `;
  
  paginationEl.innerHTML = paginationHTML;
}

// Hàm chuyển trang
window.changePage = function(page) {
  if (page < 1 || page > Math.ceil(totalItems / pageSize)) return;
  loadList(page, pageSize);
}

// Hàm xóa sản phẩm
window.deleteProduct = async function(productId) {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
    return;
  }

  try {
    await productModule.deleteProduct(productId);
    alert('Xóa sản phẩm thành công');
    // Tải lại danh sách
    await loadList();
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    alert('Có lỗi xảy ra khi xóa sản phẩm');
  }
}
