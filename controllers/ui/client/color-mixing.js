import { ColorFormulasAPI } from '../../api/ColorFormulasAPI.js';
import { ColorPalettesAPI } from '../../api/ColorPalettesAPI.js';
import { ColorsAPI } from '../../api/ColorsAPI.js';
import { FormulaComponentsAPI } from '../../api/FormulaComponentsAPI.js';
import { ColorantsAPI } from '../../api/ColorantsAPI.js';

const api = {
    formulas: new ColorFormulasAPI(),
    palettes: new ColorPalettesAPI(),
    colors: new ColorsAPI(),
    components: new FormulaComponentsAPI(),
    colorants: new ColorantsAPI()
};

let data = {
    allFormulas: [],
    allColors: [],
    allPalettes: [],
    allComponents: {},
    allColorants: {},
    formulasByColor: {},   // color_id -> formulas[]
    allReviews: {}         // color_id -> reviews[]
};

let state = {
    selectedColor: null,
    selectedFormula: null,
    selectedComponents: []
};

// ==================== BUCKET PLAN ====================
function calculateBucketPlan(requiredLiters) {
    // Simple greedy for 10/5/1 fallback (legacy)
    const sizes = [10, 5, 1];
    let remaining = requiredLiters;
    const plan = sizes.map((size, idx) => {
        if (idx === sizes.length - 1) {
            const count = Math.ceil(remaining / size);
            return { size, count };
        }

        const count = Math.floor(remaining / size);
        remaining = Math.max(0, remaining - count * size);
        return { size, count };
    });

    return plan.filter(item => item.count > 0);
}

// ==================== AREA & COVERAGE HELPERS ====================
function toNumber(elId) {
    const el = document.getElementById(elId);
    if (!el) return 0;
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? v : 0;
}

function computePaintableArea() {
    const length = toNumber('room-length');
    const width = toNumber('room-width');
    const height = toNumber('room-height');
    const openings = toNumber('opening-area'); // windows + doors total area

    // Wall area: 2*(L+W)*H, ignore ceiling for now
    const wallArea = 2 * (length + width) * height;
    const paintable = Math.max(0, wallArea - openings);
    return paintable;
}

async function optimizeBuckets(requiredLiters) {
    // Attempt cloud function first if available
    try {
        if (window && window.axios && requiredLiters > 0) {
            const resp = await axios.post('/calc_paint', { liters_needed: requiredLiters });
            if (resp && resp.data && Array.isArray(resp.data.combo)) {
                return resp.data.combo;
            }
        }
    } catch (err) {
        console.warn('Cloud optimize failed, fallback to greedy 18/5/1:', err);
    }

    // Fallback greedy for 18L, 5L, 1L to minimize waste then count
    const sizes = [18, 5, 1];
    let best = null;
    for (let c18 = 0; c18 <= Math.ceil(requiredLiters / 18); c18++) {
        for (let c5 = 0; c5 <= Math.ceil(requiredLiters / 5); c5++) {
            const litresCovered = c18 * 18 + c5 * 5;
            if (litresCovered >= requiredLiters) {
                const waste = litresCovered - requiredLiters;
                const combo = [
                    { size: 18, count: c18 },
                    { size: 5, count: c5 },
                    { size: 1, count: 0 }
                ].filter(c => c.count > 0);
                if (!best || waste < best.waste || (waste === best.waste && (c18 + c5) < best.totalCount)) {
                    best = { combo, waste, totalCount: c18 + c5 };
                }
            }
        }
    }

    // Add 1L cans to cover remaining if still short
    if (!best || best.waste > 1) {
        const c18 = best ? best.combo.find(c => c.size === 18)?.count || 0 : 0;
        const c5 = best ? best.combo.find(c => c.size === 5)?.count || 0 : 0;
        const litresCovered = c18 * 18 + c5 * 5;
        const remaining = Math.max(0, requiredLiters - litresCovered);
        const c1 = Math.ceil(remaining / 1);
        const combo = [
            { size: 18, count: c18 },
            { size: 5, count: c5 },
            { size: 1, count: c1 }
        ].filter(c => c.count > 0);
        const waste = c18 * 18 + c5 * 5 + c1 - requiredLiters;
        best = { combo, waste, totalCount: c18 + c5 + c1 };
    }

    return best.combo;
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Chuyển object Firebase thành array
 * Nếu đã là array thì trả về luôn
 */
function normalizeToArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Nếu là object, convert thành array với id
    return Object.entries(data).map(([id, item]) => ({ id, ...item }));
}

// ==================== INIT ====================
async function init() {
    try {
        console.log('Bắt đầu tải dữ liệu...');

        const [formulas, palettes, colors, colorants] = await Promise.all([
            api.formulas.list({}),
            api.palettes.list({}),
            api.colors.list({}),
            api.colorants.list({})
        ]);

        // Normalize data - handle cả API response và object
        data.allFormulas = normalizeToArray(formulas?.data || formulas);
        data.allPalettes = normalizeToArray(palettes?.data || palettes);
        data.allColors = normalizeToArray(colors?.data || colors);

        const colorantsArray = normalizeToArray(colorants?.data || colorants);

        console.log('Normalized colors:', data.allColors);
        console.log('Normalized formulas:', data.allFormulas);

        // Map colorants by ID
        colorantsArray.forEach(c => {
            if (c && c.id) {
                data.allColorants[c.id] = c;
            }
        });

        // Load components for each formula
        for (const formula of data.allFormulas) {
            if (formula && formula.id) {
                const components = await api.components.listByFormula(formula.id);
                const compData = normalizeToArray(components?.data || components);
                data.allComponents[formula.id] = compData;
            }
        }

        // Group formulas by color_id
        data.allFormulas.forEach(formula => {
            if (formula && formula.color_id) {
                if (!data.formulasByColor[formula.color_id]) {
                    data.formulasByColor[formula.color_id] = [];
                }
                data.formulasByColor[formula.color_id].push(formula);
            }
        });

        console.log('Grouped formulas by color:', data.formulasByColor);

        // Populate color select
        populateColorSelect();

        // Setup event listeners
        setupEventListeners();

        console.log('Tải dữ liệu thành công!');

    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        alert('Lỗi tải dữ liệu. Vui lòng làm mới trang.');
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    const colorSelect = document.getElementById('color-select');
    const btnCalculate = document.getElementById('btn-calculate');
    const productLine = document.getElementById('product-line');

    const resetIds = [
        'room-length',
        'room-width',
        'room-height',
        'opening-area',
        'coverage-per-liter',
        'coats-select',
        'wastage-input'
    ];

    if (colorSelect) colorSelect.addEventListener('change', onColorChange);
    resetIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', resetResults);
    });
    if (productLine) productLine.addEventListener('change', onProductLineChange);
    if (btnCalculate) btnCalculate.addEventListener('click', calculateLiquid);
}

function onProductLineChange() {
    const select = document.getElementById('product-line');
    const coverageInput = document.getElementById('coverage-per-liter');
    if (!select || !coverageInput) return;
    const option = select.options[select.selectedIndex];
    const coverage = option ? parseFloat(option.getAttribute('data-coverage')) : null;
    if (coverage) {
        coverageInput.value = coverage;
        resetResults();
    }
}

function onColorChange() {
    const formulaId = document.getElementById('color-select').value;
    if (!formulaId) {
        resetColorSelection();
        return;
    }

    // Find selected formula
    const formula = data.allFormulas.find(f => f.id === formulaId);
    if (!formula) return;

    state.selectedFormula = formula;
    state.selectedComponents = data.allComponents[formula.id] || [];

    // Find color by matching formula.code with colors.code
    if (formula.code) {
        state.selectedColor = data.allColors.find(c => c.code === formula.code);
        if (state.selectedColor) {
            showColorPreview(state.selectedColor);
            // Display reviews for this color
            displayColorReviews(state.selectedColor);
        }
    }
    // Fallback: find color by color_id if code doesn't match
    else if (formula.color_id) {
        state.selectedColor = data.allColors.find(c => c.id === formula.color_id);
        if (state.selectedColor) {
            showColorPreview(state.selectedColor);
            displayColorReviews(state.selectedColor);
        }
    }

    // Display formula info and components
    displayFormulaInfo(formula);
    displayComponents(state.selectedComponents);
}

// ==================== POPULATE DROPDOWNS ====================
function populateColorSelect() {
    const select = document.getElementById('color-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn công thức pha --</option>';

    console.log('Populating color formulas:', data.allFormulas);

    data.allFormulas.forEach(formula => {
        if (formula && formula.id) {
            const option = document.createElement('option');
            option.value = formula.id;
            option.textContent = `${formula.name} (${formula.code})`;
            select.appendChild(option);
        }
    });
}

// ==================== DISPLAY FUNCTIONS ====================
function showColorPreview(color) {
    const box = document.getElementById('color-preview-box');
    if (!box) return;

    const rect = document.getElementById('color-preview-rect');
    const hexCode = document.getElementById('color-hex-code');

    if (rect) {
        const hexValue = color.hex_code || color.hex || '#FFFFFF';
        rect.style.backgroundColor = hexValue;
    }

    if (hexCode) {
        hexCode.textContent = `Hex: ${color.hex_code || color.hex || color.code}`;
    }

    box.classList.remove('d-none');
}

function displayFormulaInfo(formula) {
    const box = document.getElementById('formula-info-box');
    if (!box) return;

    const nameEl = document.getElementById('formula-name');
    const codeEl = document.getElementById('formula-code');
    const baseEl = document.getElementById('formula-base');
    const toleranceEl = document.getElementById('formula-tolerance');

    if (nameEl) nameEl.textContent = formula.name || '-';
    if (codeEl) codeEl.textContent = formula.code || '-';
    if (baseEl) baseEl.textContent = formula.base || '-';
    if (toleranceEl) toleranceEl.textContent = formula.tolerance || formula.tolerance_deltaE || '-';

    box.classList.remove('d-none');
}

function displayComponents(components) {
    const box = document.getElementById('components-table-box');
    const tbody = document.getElementById('components-tbody');

    if (!box || !tbody) return;

    if (!components || components.length === 0) {
        box.classList.add('d-none');
        return;
    }

    console.log('Displaying components:', components);

    let totalMlPerL = 0;
    components.forEach(comp => {
        totalMlPerL += comp.ml_per_L || 0;
    });

    tbody.innerHTML = components.map(comp => {
        const colorant = data.allColorants[comp.colorant_id] || {};
        const mlPerL = comp.ml_per_L || 0;
        const percent = totalMlPerL > 0 ? (mlPerL / totalMlPerL * 100).toFixed(1) : 0;
        const colorantName = colorant.name || colorant.code || comp.colorant_id || '-';

        return `
            <tr>
                <td>${colorantName}</td>
                <td class="text-end">${mlPerL}</td>
                <td class="text-end">${percent}%</td>
            </tr>
        `;
    }).join('');

    box.classList.remove('d-none');
}

// ==================== REVIEWS DISPLAY ====================
function displayColorReviews(color) {
    const box = document.getElementById('reviews-box');
    const content = document.getElementById('reviews-content');

    if (!box || !content) return;

    // Look up reviews by color code or color_id
    let reviews = [];
    if (color.code && data.allReviews[color.code]) {
        reviews = data.allReviews[color.code];
    } else if (color.id && data.allReviews[color.id]) {
        reviews = data.allReviews[color.id];
    }
}

// ==================== CALCULATION ====================
/**
 * Tính toán lượng sơn cần thiết dựa trên mét vuông
 * Giả sử độ phủ mặc định là 10 m²/lít
 */
function calculateLiquid() {
    const area = computePaintableArea();
    const coverage = toNumber('coverage-per-liter'); // m2 per L per coat
    const coats = toNumber('coats-select') || 1;
    const wastagePct = toNumber('wastage-input') || 0;

    if (!area || area <= 0) {
        alert('Vui lòng nhập kích thước hợp lệ (diện tích > 0)');
        return;
    }
    if (!coverage || coverage <= 0) {
        alert('Vui lòng nhập độ phủ hợp lệ (m²/L/lớp)');
        return;
    }

    console.log('Calculating for area:', area, 'coverage:', coverage, 'coats:', coats, 'wastage:', wastagePct);

    const requiredLiters = (area / coverage) * coats * (1 + wastagePct / 100);

    console.log('Required liters:', requiredLiters);

    // Tính toán chi tiết từng thành phần colorants
    const mixDetails = state.selectedComponents.map(comp => {
        const colorant = data.allColorants[comp.colorant_id] || {};
        const ml = (comp.ml_per_L || 0) * requiredLiters;
        const cost = ml * (colorant.price_per_ml || 0.1);

        return {
            name: colorant.name || colorant.code || comp.colorant_id,
            mlPerL: comp.ml_per_L || 0,
            ml: ml.toFixed(2),
            cost: cost.toFixed(2)
        };
    });

    console.log('Mix details:', mixDetails);

    optimizeBuckets(requiredLiters).then(bucketPlan => {
        // Display results
        displayLiquidResults(area, requiredLiters, mixDetails, bucketPlan, { coverage, coats, wastagePct });
    });
}

function displayLiquidResults(area, requiredLiters, mixDetails, bucketPlan, meta) {
    const resultContainer = document.getElementById('result-container');
    const emptyState = document.getElementById('empty-state');

    if (!resultContainer) return;

    // Hiển thị màu, công thức và lượng sơn cần thiết
    const resultInfo = document.getElementById('result-info');
    if (resultInfo) {
        const formulaName = state.selectedFormula ? state.selectedFormula.name : 'N/A';
        const formulaCode = state.selectedFormula ? state.selectedFormula.code : '-';
        const colorName = state.selectedColor ? state.selectedColor.name : 'N/A';

        const bucketText = bucketPlan && bucketPlan.length
            ? bucketPlan.map(b => `${b.size}L x ${b.count}`).join(' | ')
            : 'Không có dữ liệu';

        const coatsText = meta && meta.coats ? meta.coats : 1;
        const wastageText = meta && meta.wastagePct ? `${meta.wastagePct}%` : '0%';
        const coverageText = meta && meta.coverage ? `${meta.coverage} m²/L/lớp` : '—';

        resultInfo.innerHTML = `
                    <div class="result-box">
                <div class="row g-2">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Màu:</strong> ${colorName}</p>
                        <p class="mb-1"><strong>Công thức:</strong> ${formulaName} (${formulaCode})</p>
                        <p class="mb-1"><strong>Diện tích tính toán:</strong> ${area.toFixed(2)} m²</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Độ phủ:</strong> ${coverageText}</p>
                        <p class="mb-1"><strong>Số lớp:</strong> ${coatsText}</p>
                        <p class="mb-1"><strong>Hao hụt:</strong> ${wastageText}</p>
                    </div>
                </div>

                <p class="mb-1 mt-2">
                    <strong>Lượng sơn cần pha:</strong>
                    <span class="highlight">${requiredLiters.toFixed(2)} lít</span>
                </p>

                <p class="mb-0">
                    <strong>Combo can gợi ý (18L → 5L → 1L):</strong>
                    <span class="muted">${bucketText}</span>
                </p>
            </div>
        `;
    }

    // Hiển thị chi tiết pha từng thành phần (colorants)
    const tbody = document.getElementById('mix-table');
    if (tbody) {
        tbody.innerHTML = mixDetails.map(r => `
            <tr>
                <td><strong>${r.name}</strong></td>
                <td class="text-end">${r.mlPerL} ml/L</td>
                <td class="text-end"><strong>${r.ml} ml</strong></td>
                <td class="text-end">${parseFloat(r.cost).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
            </tr>
        `).join('');
    }

    const totalCost = mixDetails.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const summary = document.getElementById('mix-summary');
    if (summary) {
        summary.innerHTML = `
        <strong>
            Tổng chi phí ước tính:
            <span class="highlight">
                ${totalCost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </span>
        </strong>
`;

    }

    if (resultContainer) resultContainer.classList.remove('d-none');
    if (emptyState) emptyState.classList.add('d-none');
}

function resetResults() {
    const resultContainer = document.getElementById('result-container');
    const emptyState = document.getElementById('empty-state');

    if (resultContainer) resultContainer.classList.add('d-none');
    if (emptyState) emptyState.classList.remove('d-none');
}

// ==================== RESET FUNCTIONS ====================
function resetColorSelection() {
    const colorPreview = document.getElementById('color-preview-box');
    const formulaInfo = document.getElementById('formula-info-box');
    const componentsTable = document.getElementById('components-table-box');
    const reviewsBox = document.getElementById('reviews-box');

    if (colorPreview) colorPreview.classList.add('d-none');
    if (formulaInfo) formulaInfo.classList.add('d-none');
    if (componentsTable) componentsTable.classList.add('d-none');
    if (reviewsBox) reviewsBox.classList.add('d-none');

    resetResults();

    state.selectedColor = null;
    state.selectedFormula = null;
    state.selectedComponents = [];
}

// ==================== START ====================
document.addEventListener('DOMContentLoaded', init);