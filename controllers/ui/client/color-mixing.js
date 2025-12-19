import ColorFormulasAPI from '/controllers/api/ColorFormulasAPI.js';
import ColorPalettesAPI from '/controllers/api/ColorPalettesAPI.js';
import ColorsAPI from '/controllers/api/ColorsAPI.js';
import FormulaComponentsAPI from '/controllers/api/FormulaComponentsAPI.js';
import ColorantsAPI from '/controllers/api/ColorantsAPI.js';

const api = {
    formulas: new ColorFormulasAPI(),
    palettes: new ColorPalettesAPI(),
    colors: new ColorsAPI(),
    components: new FormulaComponentsAPI(),
    colorants: new ColorantsAPI()
};

let data = {
    allFormulas: [],      // Tất cả công thức pha
    allColors: [],        // Tất cả màu (cho hex lookup)
    allPalettes: [],      // Tất cả bảng màu
    allComponents: {},    // formula_id -> components[]
    allColorants: {}      // colorant_id -> colorant data
};

let state = {
    selectedFormula: null,  // Công thức đã chọn
    currentMethod: 'palette'
};

// ==================== INIT ====================
async function init() {
    try {
        const [formulas, palettes, colors, colorants] = await Promise.all([
            api.formulas.list({}),
            api.palettes.list({}),
            api.colors.list({}),
            api.colorants.list({})
        ]);

        data.allFormulas = formulas;
        data.allPalettes = palettes;
        data.allColors = colors;
        
        // Map colorants by ID
        colorants.forEach(c => {
            data.allColorants[c.id] = c;
        });

        // Load components cho mỗi công thức
        for (const formula of formulas) {
            const components = await api.components.listByFormula(formula.id);
            data.allComponents[formula.id] = components;
        }

        // Build filters
        populatePaletteFilter();
        populateBaseFilter();

        // Display galleries
        renderFormulaGallery();

    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        alert('Lỗi tải dữ liệu. Vui lòng làm mới trang.');
    }
}

// ==================== POPULATE FILTERS ====================
function populatePaletteFilter() {
    const select = document.getElementById('formula-palette-filter');
    select.innerHTML = '<option value="">Tất cả bảng màu</option>';
    
    const uniquePalettes = [...new Set(data.allFormulas.map(f => f.palette_id))];
    const palettes = data.allPalettes.filter(p => uniquePalettes.includes(p.id));
    
    palettes.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        select.appendChild(option);
    });

    select.addEventListener('change', renderFormulaGallery);
}

function populateBaseFilter() {
    const select = document.getElementById('formula-base-filter');
    select.innerHTML = '<option value="">Tất cả base</option>';
    
    const uniqueBases = [...new Set(data.allFormulas.map(f => f.base).filter(Boolean))];
    uniqueBases.sort().forEach(base => {
        const option = document.createElement('option');
        option.value = base;
        option.textContent = base;
        select.appendChild(option);
    });

    select.addEventListener('change', renderFormulaGallery);
}

// ==================== RENDER FORMULA GALLERY ====================
function renderFormulaGallery() {
    const gallery = document.getElementById('formulas-gallery');
    const searchTerm = document.getElementById('formula-search').value.toLowerCase();
    const paletteId = document.getElementById('formula-palette-filter').value;
    const base = document.getElementById('formula-base-filter').value;

    // Filter
    let filtered = data.allFormulas.filter(f => {
        const matchSearch = !searchTerm || 
            f.code.toLowerCase().includes(searchTerm) || 
            f.name.toLowerCase().includes(searchTerm);
        
        const matchPalette = !paletteId || f.palette_id === paletteId;
        const matchBase = !base || f.base === base;
        
        return matchSearch && matchPalette && matchBase;
    });

    gallery.innerHTML = '';

    if (filtered.length === 0) {
        gallery.innerHTML = '<div class="col-12"><p class="text-muted">Không tìm thấy công thức nào.</p></div>';
        return;
    }

    filtered.forEach(formula => {
        const card = createFormulaCard(formula);
        gallery.appendChild(card);
    });
}

function createFormulaCard(formula) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    // Lấy tên bảng màu
    const palette = data.allPalettes.find(p => p.id === formula.palette_id);
    const paletteName = palette?.name || '?';

    // Lấy color để hiển thị hex
    const color = data.allColors.find(c => c.code === formula.code);
    const hexColor = color?.hex || '#FFFFFF';

    const card = document.createElement('div');
    card.className = 'card cursor-pointer h-100 border-2';
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s';
    
    card.innerHTML = `
        <div class="row g-0 h-100">
            <!-- Preview Color -->
            <div class="col-4">
                <div style="background-color: ${hexColor}; height: 100%; min-height: 120px; border-radius: 4px 0 0 4px;"></div>
            </div>
            <!-- Info -->
            <div class="col-8 p-3 d-flex flex-column">
                <h6 class="fw-bold mb-1 flex-grow-1">${formula.name}</h6>
                <p class="mb-1"><small class="text-muted">Mã: ${formula.code}</small></p>
                <p class="mb-1"><small class="text-muted">Bảng: ${paletteName}</small></p>
                ${formula.base ? `<p class="mb-1"><small class="text-muted">Base: ${formula.base}</small></p>` : ''}
                <p class="mb-0"><small class="text-danger fw-bold">ΔE: ${formula.tolerance || 0}</small></p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => selectFormula(formula));
    
    card.addEventListener('mouseenter', () => {
        card.classList.add('shadow');
        card.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.classList.remove('shadow');
        card.style.transform = 'translateY(0)';
    });

    col.appendChild(card);
    return col;
}

// ==================== SELECT FORMULA ====================
function selectFormula(formula) {
    state.selectedFormula = formula;

    // Show selected info
    const info = document.getElementById('selected-formula-info');
    info.classList.remove('d-none');
    document.getElementById('selected-formula-name').textContent = formula.name;
    document.getElementById('selected-formula-code').textContent = formula.code;
    document.getElementById('selected-formula-base').textContent = formula.base || '-';

    // Scroll to calc form
    document.getElementById('selected-formula-info').scrollIntoView({ behavior: 'smooth' });
}

// ==================== CALCULATE MIX ====================
window.calculateMix = function() {
    if (!state.selectedFormula) {
        alert('Vui lòng chọn công thức pha');
        return;
    }

    const volumeInput = document.getElementById('volume-input');
    const volume = parseFloat(volumeInput.value);

    // Validate volume
    if (!volume || volume <= 0) {
        alert('Dung tích phải > 0');
        volumeInput.focus();
        return;
    }

    const formula = state.selectedFormula;
    const components = data.allComponents[formula.id] || [];

    // Get color info for preview
    const color = data.allColors.find(c => c.code === formula.code);
    const hexColor = color?.hex || '#FFFFFF';

    // Display preview
    const preview = document.getElementById('color-preview');
    if (preview) {
        preview.style.backgroundColor = hexColor;
    }

    // Calculate mix
    let totalMl = 0;
    let totalCost = 0;
    const rows = [];

    components.forEach(comp => {
        const colorant = data.allColorants[comp.colorant_id];
        if (!colorant) return;

        const mlNeeded = (comp.ml_per_L || 0) * volume;
        const cost = mlNeeded * (colorant.price_per_ml || 0);

        totalMl += mlNeeded;
        totalCost += cost;

        rows.push({
            colorantName: colorant.name,
            mlNeeded: mlNeeded.toFixed(2),
            cost: cost.toFixed(2),
            pricePerMl: colorant.price_per_ml
        });
    });

    displayResults(volume, totalMl, totalCost, rows, formula);
}

function displayResults(volume, totalMl, totalCost, rows, formula) {
    // Volume
    document.getElementById('result-volume').textContent = volume;

    // Mix table
    const table = document.getElementById('mix-table');
    table.innerHTML = '';

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.colorantName}</strong></td>
            <td class="text-end">${row.mlNeeded}</td>
            <td class="text-end"><strong class="text-danger">${parseFloat(row.cost).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong></td>
        `;
        table.appendChild(tr);
    });

    // Summary
    const summary = document.getElementById('mix-summary');
    if (summary) {
        summary.innerHTML = `
            <p class="mb-1">Tổng dung tích: <strong>${totalMl.toFixed(2)} ml</strong></p>
            <p class="mb-0">Tổng chi phí: <strong class="text-danger">${totalCost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong></p>
        `;
    }
}

// ==================== SEARCH ====================
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('formula-search');
    if (searchInput) {
        searchInput.addEventListener('input', renderFormulaGallery);
    }

    init();
});
