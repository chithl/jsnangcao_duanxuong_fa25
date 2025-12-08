import { ProductAPI } from "../../api/ProductAPI.js";

(async () => {
    try {
        var productModule = new ProductAPI();

        var productList = await productModule.getAllProduct();

        // productList có thể là mảng (resp.data) hoặc object { data: [...] }
        var data = Array.isArray(productList) ? productList : (productList && productList.data) || [];

        var content = '';
        data.forEach(element => {
            content += `<div class="col-md-4">
              <div class="card mb-4 product-wap rounded-0">
                <div class="card rounded-0">
                  <img
                    class="card-img rounded-0 img-fluid"
                    src="https://www.jotun.com/contentassetsjot03/af443d70809345a59207cf3e54139820/jotun-livingroom-2149-coffee-1303-observe-1974-golden-walnut_1408x1760.jpg?format=webp&width=752&height=940&quality=70"
                    alt="Hình ảnh sản phẩm"
                  />
                  <div
                    class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center"
                  >
                    <ul class="list-unstyled">
                      <li>
                        <a
                          class="btn btn-success text-white"
                          href="shop-single.html"
                          title="Yêu thích"
                          ><i class="far fa-heart"></i
                        ></a>
                      </li>
                      <li>
                        <a
                          class="btn btn-success text-white mt-2"
                          href="shop-single.html"
                          title="Xem chi tiết"
                          ><i class="far fa-eye"></i
                        ></a>
                      </li>
                      <li>
                        <a
                          class="btn btn-success text-white mt-2"
                          href="shop-single.html"
                          title="Thêm vào giỏ"
                          ><i class="fas fa-cart-plus"></i
                        ></a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="card-body">
                  <p>1303</p>
                  <a href="shop-single.html" class="h3 fw-bold text-decoration-none name_title"
                    >Cappuccino</a 
                  >
                  <p class="text-center mb-0">300.000đ</p>
                </div>
              </div>
            </div>`;
        });

        const listEl = document.getElementById('product-list');
        if (listEl) {
            listEl.innerHTML = content;
        } else {
            console.warn('Không tìm thấy phần tử có id "product-list".');
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách products:', error);
    }
})();