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

    const placeholderImage = "https://via.placeholder.com/640x640?text=Sản+phẩm";
    const visibleProducts = data.filter(item => item.is_active === true);
    visibleProducts.forEach(element => {
      const productImage = (Array.isArray(element.images) && element.images.length ? element.images[0] : null) || element.image || element.thumbnail || placeholderImage;
      const imageAlt = element.name ? element.name : "Sản phẩm";
      const brandName = element.brand || "Jotun";

      content += `
        <div class="col-md-4">
            <div class="card mb-4 product-wap rounded-0 shadow-sm border-0">
                <div class="card rounded-0">
                    <img
                        class="card-img rounded-0 img-fluid"
                        src="${productImage}"
                        alt="${imageAlt}"
                        loading="lazy"
                        onerror="this.src='${placeholderImage}'"
                        style="width: 100%; height: 280px; object-fit: cover;"
                    />
                    <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                        <ul class="list-unstyled">
                            <li><a class="btn btn-success text-white mt-2" href="shop-single.html?id=${element.firebaseID}" title="Xem chi tiết"><i class="far fa-eye"></i></a></li>
                            <li><a class="btn btn-success text-white mt-2" href="#" title="Thêm vào giỏ"><i class="fas fa-cart-plus"></i></a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body bg-white p-3">
                    <div class="text-uppercase text-muted small mb-1 fw-bold" style="letter-spacing: 1px;">
                        ${brandName}
                    </div>
                    
                    <a href="shop-single.html?id=${element.firebaseID}" class="h5 d-block text-decoration-none text-dark fw-bold mb-2 name_title">
                        ${element.name}
                    </a>

                    
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