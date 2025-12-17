import { ProductAPI } from "../../../api/ProductAPI.js";

var productModule = new ProductAPI();

async function loadProducts() {
  try {
    // Gọi API lấy danh sách sản phẩm
    var productList = await productModule.getAllProduct();

    // Kiểm tra cấu trúc dữ liệu trả về (giống cách bạn làm ở Formula)
    // console.log(productList);
    const data = Object.keys(productList).map(key => ({
      firebaseID: key,
      ...productList[key]
    }));
    console.log(data);
    // var data = Array.isArray(productList) ? productList : (productList && productList.data) || [];

    var content = '';
    // console.log(data);

    data.forEach(element => {
      // Sử dụng dữ liệu từ 'element' thay vì viết chữ cố định
      content += `
                <div class="col-md-4">
                    <div class="card mb-4 product-wap rounded-0">
                        <div class="card rounded-0">
                            <img
                                class="card-img rounded-0 img-fluid"
                             
                            />
                            <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                                <ul class="list-unstyled">
                                    <li><a class="btn btn-success text-white" href="shop-single.html?id=${element.firebaseID}" title="Yêu thích"><i class="far fa-heart"></i></a></li>
                                    <li><a class="btn btn-success text-white mt-2" href="shop-single.html?id=${element.firebaseID}" title="Xem chi tiết"><i class="far fa-eye"></i></a></li>
                                    <li><a class="btn btn-success text-white mt-2" href="#" title="Thêm vào giỏ"><i class="fas fa-cart-plus"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-body">

                            <a href="shop-single.html?id=${element.firebaseID}" class="h3 fw-bold text-decoration-none name_title">
                                ${element.name}
                            </a>
                            <p class="text-center mb-0 fw-bold text-danger">
                                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(element.price || 0)}
                            </p>
                        </div>
                    </div>
                </div>`;
    });

    const productListEl = document.getElementById('product-list');
    if (productListEl) {
      productListEl.innerHTML = content;
    }
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
  }
}

// Thực thi
loadProducts();