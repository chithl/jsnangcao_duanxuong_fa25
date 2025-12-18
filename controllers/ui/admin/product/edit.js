import { ProductAPI } from "../../../api/ProductAPI.js";

function findProductById(productId, allProducts) {
    if (!allProducts) return null;

    const normalize = (val) => decodeURIComponent((val || "").trim());
    const normId = normalize(productId);

    // Nếu là object kiểu Firebase {id: {..}}
    if (!Array.isArray(allProducts) && typeof allProducts === "object") {
        if (allProducts[productId]) return { id: productId, ...allProducts[productId] };

        // fallback: tìm trong values nếu có field id trùng
        const hitExact = Object.entries(allProducts).find(([key, item]) =>
            normalize(item?.id || item?._id || item?.key || item?.product_id) === normId
        );
        if (hitExact) return { id: hitExact[0], ...hitExact[1] };

        // fallback: so khớp key sau normalize/strip dấu gạch dưới
        const normMatches = Object.entries(allProducts).find(([key, item]) => {
            const nk = normalize(key);
            const nkNoUnderscore = nk.replace(/_/g, "");
            const idNoUnderscore = normId.replace(/_/g, "");
            return nk === normId || nkNoUnderscore === idNoUnderscore || nk.includes(normId) || normId.includes(nk);
        });
        if (normMatches) return { id: normMatches[0], ...normMatches[1] };
    }

    // Nếu là mảng
    if (Array.isArray(allProducts)) {
        return allProducts.find((p) => normalize(p?.id || p?._id || p?.key || p?.product_id) === normId) || null;
    }

    return null;
}

document.addEventListener('DOMContentLoaded', async () => {
    let productModule = new ProductAPI();
    let form = document.getElementById('edit-product');
    let currentProductId = null;
    let originalName = '';
    let existingImages = [];
    let pendingFiles = [];

    // Dữ liệu sản phẩm để kiểm tra trùng tên
    let existingProducts = [];

    // Validation rules
    const validationRules = {
        name: { required: true, minLength: 2, maxLength: 255 },
        is_active: { required: true }
    };

    // 1. Lấy product ID từ URL
    function getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return decodeURIComponent(urlParams.get('id') || "").trim();
    }

    // 2. Tải danh sách sản phẩm để check trùng
    async function loadProducts() {
        try {
            const productResponse = await productModule.getAllProduct();
            if (Array.isArray(productResponse)) {
                existingProducts = productResponse;
            } else if (productResponse && typeof productResponse === 'object') {
                // Firebase trả object {id: {...}} => chuyển sang array với id
                existingProducts = Object.entries(productResponse).map(([id, data]) => ({
                    id,
                    ...data
                }));
            } else {
                existingProducts = [];
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            existingProducts = [];
        }
    }

    // 3. Tải chi tiết sản phẩm và điền vào form
    async function loadProductDetails(productId) {
        try {
            let product = await productModule.getOneProduct(productId);

            if (!product || typeof product !== "object") {
                // Fallback: fetch all and pick by id
                const allProducts = await productModule.getAllProduct();
                product = findProductById(productId, allProducts);
            }

            if (product && typeof product === 'object') {
                // Điền dữ liệu vào form
                document.getElementById('product_id').value = productId;
                document.getElementById('name').value = product.name || '';
                document.getElementById('brand').value = product.brand || '';
                document.getElementById('line').value = product.line || '';
                document.getElementById('segment').value = product.segment || '';
                document.getElementById('finish').value = product.finish || '';
                document.getElementById('base').value = product.base || '';
                document.getElementById('sku').value = product.sku || '';
                document.getElementById('cover_m2_per_L').value = product.cover_m2_per_L || '';
                
                // Tags: chuyển array thành string
                if (Array.isArray(product.tags)) {
                    document.getElementById('tags').value = product.tags.join(', ');
                } else {
                    document.getElementById('tags').value = '';
                }

                // Trạng thái
                document.getElementById('is_active').value = product.is_active ? '1' : '0';

                // Lưu tên gốc để so sánh khi validate
                originalName = product.name || '';
                currentProductId = productId;

                // Ảnh đã có
                existingImages = Array.isArray(product.images)
                    ? product.images.map(url => ({ url }))
                    : [];
            } else {
                console.warn('Product not found for edit', { productId });
                alert('Không tìm thấy sản phẩm');
                window.location.href = 'products.html';
            }
        } catch (error) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', error);
            alert('Có lỗi xảy ra khi tải sản phẩm');
            window.location.href = 'products.html';
        }
    }

    // 4. Hàm kiểm tra lỗi
    function validateForm() {
        const errors = {};
        const nameValue = document.getElementById('name').value.trim();
        const brandValue = document.getElementById('brand').value.trim();
        const lineValue = document.getElementById('line').value.trim();
        const segmentValue = document.getElementById('segment').value.trim();
        const finishValue = document.getElementById('finish').value.trim();
        const baseValue = document.getElementById('base').value.trim();
        const coverValue = document.getElementById('cover_m2_per_L').value;
        const tagsText = document.getElementById('tags')?.value || '';
        const parsedTags = parseTags(tagsText);
        const isActiveValue = document.getElementById('is_active').value;

        if (!nameValue) {
            errors.name = 'Tên sản phẩm là bắt buộc';
        } else if (nameValue.length < validationRules.name.minLength) {
            errors.name = `Tên sản phẩm phải có ít nhất ${validationRules.name.minLength} ký tự`;
        } else if (nameValue.toLowerCase() !== originalName.toLowerCase()) {
            // Chỉ check trùng nếu tên đã thay đổi
            const duplicate = existingProducts.find(p => 
                p.id !== currentProductId && 
                (p.name || '').toLowerCase() === nameValue.toLowerCase()
            );
            if (duplicate) {
                errors.name = 'Tên sản phẩm này đã tồn tại';
            }
        }

        if (!brandValue) errors.brand = 'Thương hiệu không được để trống';
        if (!lineValue) errors.line = 'Dòng sản phẩm không được để trống';
        if (!segmentValue) errors.segment = 'Segment không được để trống';
        if (!finishValue) errors.finish = 'Finish không được để trống';
        if (!baseValue) errors.base = 'Base không được để trống';

        if (!coverValue) {
            errors.cover_m2_per_L = 'Độ phủ không được để trống';
        } else if (Number(coverValue) <= 0) {
            errors.cover_m2_per_L = 'Độ phủ phải lớn hơn 0';
        }

        if (parsedTags.length === 0) {
            errors.tags = 'Vui lòng nhập ít nhất 1 tag';
        }

        if (isActiveValue === '') {
            errors.is_active = 'Vui lòng chọn trạng thái';
        }

        // Yêu cầu phải có ít nhất 1 ảnh (đang có hoặc pending upload)
        const hasPending = pendingFiles && pendingFiles.length > 0;
        const hasExisting = existingImages && existingImages.length > 0;
        if (!hasPending && !hasExisting) {
            errors.images = 'Vui lòng upload ít nhất 1 ảnh sản phẩm';
        }

        return errors;
    }

    // 5. Hiển thị lỗi lên giao diện
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
    }

    function displayErrors(errors) {
        Object.keys(errors).forEach(field => {
            if (field === 'images') {
                const imageError = document.getElementById('images-error');
                if (imageError) {
                    imageError.textContent = errors[field];
                    imageError.classList.remove('hidden');
                    return;
                }

                const container = document.getElementById('image-preview')?.parentElement;
                if (container) {
                    const errorEl = document.createElement('small');
                    errorEl.className = 'error-message mt-1 text-red-500';
                    errorEl.textContent = errors[field];
                    container.appendChild(errorEl);
                }
                return;
            }

            const input = document.getElementById(field);
            if (input) {
                const container = input.closest('div');
                if (!container) return;
                let errorEl = container.querySelector('.error-message');
                if (!errorEl) {
                    errorEl = document.createElement('small');
                    errorEl.className = 'error-message mt-1 text-red-500';
                    container.appendChild(errorEl);
                }
                errorEl.textContent = errors[field];
                errorEl.classList.remove('hidden');
            }
        });
    }

    // 6. Parse tags từ string thành array
    function parseTags(tagsText) {
        return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    function validateFiles(files) {
        const errors = [];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Định dạng không được hỗ trợ`);
            }
            if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: Vượt quá 5MB`);
            }
        });

        return errors;
    }

    // Upload ảnh lên Cloudinary
    async function uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "XBacupload");
        formData.append("folder", "SonJotun");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dfcjq3cpd/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();
        if (!res.ok || !data.secure_url) {
            throw new Error(data.error?.message || 'Upload ảnh thất bại');
        }

        return {
            url: data.secure_url,
            public_id: data.public_id
        };
    }

    // Render preview (gồm ảnh đã có + ảnh vừa chọn)
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('image-preview');
    const imageCount = document.getElementById('image-count');
    const uploadBtn = document.getElementById('btn-upload-images');
    const uploadStatus = document.getElementById('upload-status');

    function createThumb(src, label) {
        const wrap = document.createElement('div');
        wrap.className = 'relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm';

        const img = document.createElement('img');
        img.src = src;
        img.alt = label || '';
        img.className = 'w-full h-28 object-cover';

        const caption = document.createElement('div');
        caption.className = 'px-2 py-1 text-xs text-gray-600 truncate border-top border-gray-100 bg-gray-50';
        caption.textContent = label || '';

        wrap.appendChild(img);
        wrap.appendChild(caption);
        return wrap;
    }

    function renderPreview(selectedFiles = [], showExisting = true) {
        if (!previewContainer) return;
        previewContainer.innerHTML = '';

        if (showExisting) {
            existingImages.forEach((img, idx) => {
                previewContainer.appendChild(createThumb(img.url, `Ảnh hiện tại ${idx + 1}`));
            });
            if (imageCount) {
                imageCount.textContent = existingImages.length > 0 ? `${existingImages.length} ảnh hiện tại` : 'Chưa có ảnh';
            }
        }

        // Ảnh đang chọn (sẽ thay thế) hiển thị bằng FileReader
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                previewContainer.appendChild(createThumb(e.target.result, file.name));
            };
            reader.readAsDataURL(file);
        });

        if (selectedFiles.length > 0 && imageCount) {
            imageCount.textContent = `${selectedFiles.length} ảnh sẽ thay thế ảnh hiện tại`;
        }
    }

    // Khởi tạo
    await loadProducts();
    
    const productId = getProductIdFromURL();
    if (!productId) {
        alert('Không tìm thấy ID sản phẩm');
        window.location.href = 'products.html';
        return;
    }

    await loadProductDetails(productId);

    // Sau khi load sản phẩm, hiển thị ảnh sẵn có
    renderPreview();

    // Preview ảnh khi chọn mới
    if (imageInput) {
        imageInput.addEventListener('change', () => {
            pendingFiles = Array.from(imageInput.files || []);
            if (uploadStatus) uploadStatus.textContent = '';

            const fileErrors = validateFiles(pendingFiles);
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                pendingFiles = [];
                if (imageInput) imageInput.value = '';
            }

            const imageError = document.getElementById('images-error');
            if (imageError) {
                imageError.textContent = '';
                imageError.classList.add('hidden');
            }

            renderPreview(pendingFiles, pendingFiles.length === 0); // nếu có file mới, chỉ hiển thị preview thay thế
        });
    }

    // Nút upload ảnh
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            if (pendingFiles.length === 0) {
                alert('Vui lòng chọn ảnh trước khi upload');
                return;
            }

            const fileErrors = validateFiles(pendingFiles);
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                return;
            }
            try {
                uploadBtn.disabled = true;
                uploadBtn.classList.add('opacity-60', 'cursor-not-allowed');
                if (uploadStatus) uploadStatus.textContent = 'Đang upload...';

                const uploaded = await Promise.all(pendingFiles.map(uploadToCloudinary));
                // Thay thế toàn bộ ảnh hiện tại bằng ảnh mới
                existingImages = uploaded;
                pendingFiles = [];

                // Clear input & preview
                if (imageInput) imageInput.value = '';
                renderPreview();

                if (uploadStatus) uploadStatus.textContent = `Đã upload ${uploaded.length} ảnh mới (đã thay thế)`;
                alert('Upload ảnh thành công');
            } catch (err) {
                console.error('Upload ảnh lỗi:', err);
                if (uploadStatus) uploadStatus.textContent = 'Upload thất bại, vui lòng thử lại';
                alert('Upload ảnh thất bại, vui lòng thử lại.');
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        });
    }

    // 7. Xử lý submit form
    const btn = document.getElementById('button_submit');
    btn.addEventListener('click', async function (e) {
        e.preventDefault();

        // Xóa lỗi cũ
        clearErrors();

        // Kiểm tra hợp lệ
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return;
        }

        // Thu thập dữ liệu từ form
        const name = document.getElementById('name').value.trim();
        const brand = document.getElementById('brand')?.value.trim() || '';
        const line = document.getElementById('line')?.value.trim() || '';
        const segment = document.getElementById('segment')?.value.trim() || '';
        const finish = document.getElementById('finish')?.value.trim() || '';
        const base_val = document.getElementById('base')?.value.trim() || '';
        const sku = document.getElementById('sku')?.value.trim() || '';
        const cover = document.getElementById('cover_m2_per_L')?.value || '';
        const tagsText = document.getElementById('tags')?.value || '';
        const parsedTags = parseTags(tagsText);
        const isActiveValue = document.getElementById('is_active').value;
        // Nếu có file mới chưa upload, upload trước khi submit và thay thế ảnh hiện tại
        if (pendingFiles.length > 0) {
            const fileErrors = validateFiles(pendingFiles);
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                return;
            }
            try {
                const uploaded = await Promise.all(pendingFiles.map(uploadToCloudinary));
                existingImages = uploaded;
                pendingFiles = [];
            } catch (err) {
                console.error('Upload ảnh lỗi:', err);
                alert('Upload ảnh thất bại, vui lòng thử lại.');
                return;
            }
        }

        // Yêu cầu phải có ít nhất 1 ảnh
        if (!existingImages || existingImages.length === 0) {
            alert('Vui lòng upload ít nhất 1 ảnh sản phẩm.');
            return;
        }

        const payload = {
            name,
            brand,
            line,
            segment,
            finish,
            base: base_val,
            sku,
            cover_m2_per_L: cover === '' ? null : Number(cover),
            tags: parsedTags,
            is_active: isActiveValue === '1',
            images: existingImages.map(i => i.url),
            updated_at: new Date().toISOString()
        };

        // Gọi API cập nhật sản phẩm
        try {
            btn.disabled = true;
            btn.classList.add('opacity-60', 'cursor-not-allowed');
            
            const resp = await productModule.updateProduct(currentProductId, payload);
            
            if (resp) {
                alert('Cập nhật sản phẩm thành công');
                window.location.href = 'products.html';
            } else {
                alert('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            alert('Có lỗi xảy ra khi cập nhật sản phẩm.');
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });

    return;
});
