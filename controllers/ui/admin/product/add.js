import { ProductAPI } from "../../../api/ProductAPI.js";

document.addEventListener('DOMContentLoaded', async () => {
    let productModule = new ProductAPI();
    let form = document.getElementById('add-product');

    // Dữ liệu sản phẩm để kiểm tra trùng tên
    let existingProducts = [];

    // Validation rules
    const validationRules = {
        name: { required: true, minLength: 2, maxLength: 255 },
        is_active: { required: true }
    };

    // 1. Tải danh sách sản phẩm để check trùng
    async function loadProducts() {
        try {
            const productResponse = await productModule.getAllProduct();
            if (Array.isArray(productResponse)) {
                existingProducts = productResponse;
            } else if (productResponse && typeof productResponse === 'object') {
                // Firebase trả object {id: {...}} => chuyển sang array value
                existingProducts = Object.values(productResponse);
            } else {
                existingProducts = [];
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            existingProducts = [];
        }
    }

    // 2. Hàm kiểm tra lỗi
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
        const isActiveValue = document.getElementById('is_active').value;
        const parsedTags = parseTags(tagsText);

        if (!nameValue) {
            errors.name = 'Tên sản phẩm là bắt buộc';
        } else if (nameValue.length < validationRules.name.minLength) {
            errors.name = `Tên sản phẩm phải có ít nhất ${validationRules.name.minLength} ký tự`;
        } else if (existingProducts.some(p => p.name.toLowerCase() === nameValue.toLowerCase())) {
            errors.name = 'Tên sản phẩm này đã tồn tại';
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

        // Ảnh: phải có ít nhất 1 ảnh (đã upload hoặc đang chọn)
        if (!uploadedImages || uploadedImages.length === 0) {
            const files = document.getElementById('images')?.files || [];
            if (!files || files.length === 0) {
                errors.images = 'Vui lòng upload ít nhất 1 ảnh sản phẩm';
            }
        }

        return errors;
    }

    // 3. Hiển thị lỗi lên giao diện
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
                    errorEl.className = 'error-message mt-1 block text-red-500';
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
                    errorEl.className = 'error-message mt-1 block text-red-500';
                    container.appendChild(errorEl);
                }
                errorEl.textContent = errors[field];
                errorEl.classList.remove('hidden');
            }
        });
    }

    // 4. Chuyển ảnh sang Base64
    function readFilesAsBase64(fileList) {
        const readers = [];
        for (let i = 0; i < fileList.length; i++) {
            readers.push(new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(fileList[i]);
            }));
        }
        return Promise.all(readers);
    }

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

    // Tạo SKU tự động dựa trên tên
    function slugify(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function generateSKU(name) {
        const base = slugify(name);
        const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `${base}-${rand}`;
    }

    // Khởi tạo dữ liệu
    await loadProducts();

    // Preview ảnh khi chọn
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('image-preview');
    const imageCount = document.getElementById('image-count');
    const uploadBtn = document.getElementById('btn-upload-images');
    const uploadStatus = document.getElementById('upload-status');

    let uploadedImages = []; // lưu URL đã upload

    if (imageInput && previewContainer) {
        imageInput.addEventListener('change', () => {
            previewContainer.innerHTML = '';
            const files = Array.from(imageInput.files || []);
            const fileErrors = validateFiles(files);
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                if (imageInput) imageInput.value = '';
                if (imageCount) imageCount.textContent = 'Chưa chọn ảnh';
                if (uploadStatus) uploadStatus.textContent = '';
                return;
            }
            const imageError = document.getElementById('images-error');
            if (imageError) {
                imageError.textContent = '';
                imageError.classList.add('hidden');
            }
            if (imageCount) {
                imageCount.textContent = files.length > 0 ? `${files.length} ảnh đã chọn` : 'Chưa chọn ảnh';
            }
            if (uploadStatus) uploadStatus.textContent = '';
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = e => {
                    const wrap = document.createElement('div');
                    wrap.className = 'relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm';

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    img.className = 'w-full h-28 object-cover';

                    const caption = document.createElement('div');
                    caption.className = 'px-2 py-1 text-xs text-gray-600 truncate border-t border-gray-100 bg-gray-50';
                    caption.textContent = file.name;

                    wrap.appendChild(img);
                    wrap.appendChild(caption);
                    previewContainer.appendChild(wrap);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Nút upload ảnh riêng
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const files = Array.from(imageInput?.files || []);
            if (files.length === 0) {
                alert('Vui lòng chọn ảnh trước khi upload');
                return;
            }

            const fileErrors = validateFiles(files);
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                return;
            }
            try {
                uploadBtn.disabled = true;
                uploadBtn.classList.add('opacity-60', 'cursor-not-allowed');
                if (uploadStatus) uploadStatus.textContent = 'Đang upload...';
                uploadedImages = await Promise.all(files.map(uploadToCloudinary));
                if (uploadStatus) uploadStatus.textContent = `Đã upload ${uploadedImages.length} ảnh`;
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
        const cover = document.getElementById('cover_m2_per_L')?.value || '';
        const tagsText = document.getElementById('tags')?.value || '';
        const isActiveValue = document.getElementById('is_active').value;
        const files = document.getElementById('images')?.files || [];
        const parsedTags = parseTags(tagsText);

        // Nếu chưa upload thủ công mà vẫn còn file chọn => upload trước khi submit
        if (files.length > 0 && uploadedImages.length === 0) {
            const fileErrors = validateFiles(Array.from(files));
            if (fileErrors.length > 0) {
                alert(`Lỗi file:\n${fileErrors.join('\n')}`);
                return;
            }
            try {
                uploadedImages = await Promise.all(Array.from(files).map(uploadToCloudinary));
            } catch (err) {
                console.error('Upload ảnh lỗi:', err);
                alert('Upload ảnh thất bại, vui lòng thử lại.');
                return;
            }
        }

        // Bắt buộc phải có ít nhất 1 ảnh
        if (!uploadedImages || uploadedImages.length === 0) {
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
            cover_m2_per_L: cover === '' ? null : Number(cover),
            tags: parsedTags,
            is_active: isActiveValue === '1',
            sku: generateSKU(name),
            images: uploadedImages.map(i => i.url),
            created_at: new Date().toISOString()
        };

        // Kiểm tra trùng tên lần cuối (phòng đua điều kiện)
        if (existingProducts.some(p => (p.name || '').toLowerCase() === name.toLowerCase())) {
            displayErrors({ name: 'Tên sản phẩm này đã tồn tại' });
            return;
        }

        // Gọi API lưu sản phẩm
        try {
            btn.disabled = true;
            btn.classList.add('opacity-60', 'cursor-not-allowed');
            const resp = await productModule.storeProduct(payload);
            // Firebase trả về { name: "generatedId" } khi push thành công
            if (resp && resp.name) {
                alert('Thêm sản phẩm thành công');
                window.location.href = 'products.html';
            } else {
                alert('Không thể thêm sản phẩm. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm.');
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });

    return;
});