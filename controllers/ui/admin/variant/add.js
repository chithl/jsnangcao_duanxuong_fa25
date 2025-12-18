import { VariantAPI } from "../../../api/VariantAPI.js";
import { ProductAPI } from "../../../api/ProductAPI.js";

document.addEventListener('DOMContentLoaded', async () => {
    const variantModule = new VariantAPI();
    const productModule = new ProductAPI();
    const form = document.getElementById('add-variant');

    // Lấy product_id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = decodeURIComponent(urlParams.get('product_id') || '').trim();

    if (!productId) {
        alert('Không tìm thấy ID sản phẩm');
        window.location.href = 'products.html';
        return;
    }

    document.getElementById('product_id').value = productId;

    // Validation rules
    const validationRules = {
        sku: { required: true, minLength: 2 },
        size_L: { required: true, min: 0 },
        price: { required: true, min: 0 },
        hex_preview: { required: true, pattern: /^#[0-9A-Fa-f]{6}$/ },
        supported_palettes: { required: true },
        is_active: { required: true }
    };

    // Load product info
    async function loadProductInfo() {
        try {
            const product = await productModule.getOneProduct(productId);
            if (product && product.name) {
                document.getElementById('product_name').value = product.name;
            } else {
                document.getElementById('product_name').value = `Sản phẩm ${productId}`;
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin sản phẩm:', error);
            document.getElementById('product_name').value = `Sản phẩm ${productId}`;
        }
    }

    // Parse palettes từ string
    function parsePalettes(text) {
        return text.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }

    // Validate form
    function validateForm() {
        const errors = {};
        const skuValue = document.getElementById('sku').value.trim();
        const sizeLValue = document.getElementById('size_L').value;
        const priceValue = document.getElementById('price').value;
        const hexValue = document.getElementById('hex_preview').value.trim();
        const palettesText = document.getElementById('supported_palettes').value.trim();
        const isActiveValue = document.getElementById('is_active').value;

        if (!skuValue) {
            errors.sku = 'SKU là bắt buộc';
        } else if (skuValue.length < validationRules.sku.minLength) {
            errors.sku = `SKU phải có ít nhất ${validationRules.sku.minLength} ký tự`;
        }

        if (!sizeLValue) {
            errors.size_L = 'Dung tích là bắt buộc';
        } else if (Number(sizeLValue) <= 0) {
            errors.size_L = 'Dung tích phải lớn hơn 0';
        }

        if (!priceValue) {
            errors.price = 'Giá bán là bắt buộc';
        } else if (Number(priceValue) <= 0) {
            errors.price = 'Giá bán phải lớn hơn 0';
        }

        if (!hexValue) {
            errors.hex_preview = 'Màu mẫu là bắt buộc';
        } else if (!validationRules.hex_preview.pattern.test(hexValue)) {
            errors.hex_preview = 'Màu mẫu phải có định dạng #RRGGBB (ví dụ: #FF5733)';
        }

        const palettes = parsePalettes(palettesText);
        if (palettes.length === 0) {
            errors.supported_palettes = 'Vui lòng nhập ít nhất 1 bảng màu';
        }

        if (isActiveValue === '') {
            errors.is_active = 'Vui lòng chọn trạng thái';
        }

        return errors;
    }

    // Clear errors
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
    }

    // Display errors
    function displayErrors(errors) {
        Object.keys(errors).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                const container = input.closest('div');
                if (!container) return;
                let errorEl = container.querySelector('.error-message');
                if (!errorEl) {
                    errorEl = document.createElement('small');
                    errorEl.className = 'error-message mt-1 block';
                    container.appendChild(errorEl);
                }
                errorEl.textContent = errors[field];
                errorEl.classList.remove('hidden');
            }
        });
    }

    // Color preview
    const hexInput = document.getElementById('hex_preview');
    const colorPreview = document.getElementById('color-preview');
    
    if (hexInput && colorPreview) {
        hexInput.addEventListener('input', () => {
            const hex = hexInput.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorPreview.style.background = hex;
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.href = `product-detail.html?id=${productId}`;
    }

    // Load product info
    await loadProductInfo();

    // Submit form
    const btn = document.getElementById('button_submit');
    btn.addEventListener('click', async function (e) {
        e.preventDefault();

        clearErrors();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return;
        }

        // Collect data
        const sku = document.getElementById('sku').value.trim();
        const size_L = Number(document.getElementById('size_L').value);
        const price = Number(document.getElementById('price').value);
        const hex_preview = document.getElementById('hex_preview').value.trim();
        const palettesText = document.getElementById('supported_palettes').value.trim();
        const isActiveValue = document.getElementById('is_active').value;

        const payload = {
            product_id: productId,
            sku,
            size_L,
            price,
            hex_preview,
            supported_palettes: parsePalettes(palettesText),
            is_active: isActiveValue === '1',
            created_at: new Date().toISOString()
        };

        try {
            btn.disabled = true;
            btn.classList.add('opacity-60', 'cursor-not-allowed');

            const resp = await variantModule.storeVariant(productId, payload);
            
            if (resp && resp.name) {
                alert('Thêm biến thể thành công');
                window.location.href = `product-detail.html?id=${productId}`;
            } else {
                alert('Không thể thêm biến thể. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm biến thể:', error);
            alert('Có lỗi xảy ra khi thêm biến thể.');
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });
});
