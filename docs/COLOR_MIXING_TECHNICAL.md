# Tính Năng Pha Màu (Color Mixing) - Tài Liệu Kỹ Thuật

## 📋 Tổng Quan

Tính năng pha màu giúp người dùng:
- Chọn màu theo 3 cách: bảng màu, mã màu, hoặc color picker
- Xem công thức pha màu chi tiết
- Tính toán lượng chất màu cần dùng
- Ước tính chi phí pha màu
- In phiếu pha màu (tùy chọn)

## 🎯 Quy Trình Nghiệp Vụ

### Bước 1: Chọn Bảng Màu (Palette)
```
Người dùng → Chọn palette (VD: Basic Neutrals)
Hệ thống → Load tất cả colors thuộc palette đó
```

**Dữ liệu liên quan:**
- `color_palettes` - Danh sách bảng màu
- `colors` - Danh sách màu (filtered by palette_id)

### Bước 2: Chọn Màu Cụ Thể
Người dùng có 3 lựa chọn:

#### A. Chọn từ Bảng Màu
```
Dropdown palette → Dropdown color
Lấy: code, name, base, hex từ colors collection
```

#### B. Nhập Mã Màu
```
Người dùng nhập code (VD: B003)
Hệ thống tìm color có code tương ứng
Validation: Kiểm tra code có tồn tại không
```

#### C. Color Picker (Chọn màu trực quan)
```
Người dùng chọn màu bằng color picker
Hệ thống tìm màu gần nhất (dựa trên RGB distance)
Công thức: distance = √((R1-R2)² + (G1-G2)² + (B1-B2)²)
```

### Bước 3: Lấy Công Thức Pha Màu
```
Query: color_formulas WHERE code = selected_color.code
Lấy: formula_id, tolerance, base
```

### Bước 4: Lấy Danh Sách Thành Phần Pha
```
Query: formula_components WHERE formula_id = formula_id
Lấy: colorant_id, ml_per_L (định mức ml cho 1L sơn)
```

**Ví dụ công thức cho Soft Beige (B003) - Base A:**
```
Colorant           ml_per_L   Price/ml   Total (1L)
Red Oxide          0.8        200 đ      160 đ
Yellow Oxide       1.2        200 đ      240 đ
Black              0.4        200 đ      80 đ
─────────────────────────────────────────
Tổng               2.4 ml              480 đ
```

### Bước 5: Tính Lượng Màu Thực Tế
**Công thức: ml_needed = ml_per_L × volume**

```javascript
// Ví dụ: Pha 7.5L sơn Soft Beige
volume = 7.5  // Lít

// Red Oxide
ml_needed = 0.8 × 7.5 = 6 ml
cost = 6 × 200 = 1.200 đ

// Yellow Oxide
ml_needed = 1.2 × 7.5 = 9 ml
cost = 9 × 200 = 1.800 đ

// Black
ml_needed = 0.4 × 7.5 = 3 ml
cost = 3 × 200 = 600 đ

// Tổng
total_ml = 6 + 9 + 3 = 18 ml
total_cost = 1.200 + 1.800 + 600 = 3.600 đ
```

### Bước 6: Hiển Thị Kết Quả
```
┌─────────────────────────────────────┐
│ Mã Màu: B003                        │
│ Tên Màu: Soft Beige                 │
│ Base: A                             │
│ Dung Tích: 7.5L                     │
├─────────────────────────────────────┤
│ Tỉ Lệ Pha                           │
├──────────────────┬──────┬───────────┤
│ Thành phần       │ ml   │ Chi phí   │
├──────────────────┼──────┼───────────┤
│ Red Oxide        │ 6    │ 1.200 đ   │
│ Yellow Oxide     │ 9    │ 1.800 đ   │
│ Black            │ 3    │   600 đ   │
├──────────────────┼──────┼───────────┤
│ Tổng             │ 18   │ 3.600 đ   │
└──────────────────┴──────┴───────────┘

📌 Sai số cho phép (ΔE): ±2.0
💰 Chi phí pha màu: 3.600 đ
```

## 🏗️ Cấu Trúc Dữ Liệu

### Collections Liên Quan

#### 1. color_palettes
```
{
  id: "pal_basic",
  name: "Basic Neutrals",
  notes: "Neutral colors for interior",
  is_active: true
}
```

#### 2. colors
```
{
  id: "color_001",
  palette_id: "pal_basic",
  code: "B003",
  name: "Soft Beige",
  hex: "#E8DBC7",
  base: "A",
  is_active: true
}
```

#### 3. color_formulas
```
{
  id: "formula_001",
  code: "B003",           // Link to color.code
  name: "Soft Beige",
  palette_id: "pal_basic",
  base: "A",
  tolerance: 2.0,         // ΔE (Delta E)
  tolerance_deltaE: 2.0,  // Alternative field name
  is_active: true
}
```

#### 4. formula_components
```
{
  id: "comp_001",
  formula_id: "formula_001",
  colorant_id: "colorant_red_oxide",
  ml_per_L: 0.8           // ml cần cho 1L sơn
}
```

#### 5. colorants
```
{
  id: "colorant_red_oxide",
  name: "Red Oxide",
  price_per_ml: 200,      // Giá/ml (VND)
  is_active: true
}
```

## 💻 Code Implementation

### File: controllers/ui/client/color-mixing.js

#### Init Function
```javascript
async function init() {
  await Promise.all([
    loadPalettes(),      // Load từ color_palettes
    loadColors(),        // Load từ colors
    loadFormulas(),      // Load từ color_formulas
    loadColorants()      // Load từ colorants
  ]);
  populatePaletteSelect();
}
```

#### Calculate Mix Function
```javascript
window.calculateMix = async function() {
  // 1. Lấy color từ 3 method
  const selectedColor = getSelectedColor();
  
  // 2. Validate volume
  const volume = parseFloat(volume_input.value);
  if (volume <= 0) alert('Dung tích phải > 0');
  
  // 3. Tìm formula cho color
  const formula = formulas.find(f => f.code === selectedColor.code);
  
  // 4. Lấy components của formula
  const components = await getComponents(formula.id);
  
  // 5. Tính toán
  let totalCost = 0;
  const mixDetails = components.map(comp => {
    const colorant = findColorant(comp.colorant_id);
    const mlNeeded = comp.ml_per_L * volume;  // Công thức nghiệp vụ
    const cost = mlNeeded * colorant.price_per_ml;
    totalCost += cost;
    return { colorant, mlNeeded, cost };
  });
  
  // 6. Display results
  displayResults(selectedColor, formula, volume, mixDetails, totalCost);
}
```

#### RGB Distance Function (cho Color Picker)
```javascript
function findClosestColorByHex(hex) {
  const hexToRgb = (h) => {
    // Convert #RRGGBB to {r, g, b}
  };
  
  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };
  
  // Tìm màu có distance nhỏ nhất
  return colors.reduce((closest, color) => {
    const distance = colorDistance(pickedRgb, colorRgb);
    return distance < minDistance ? color : closest;
  });
}
```

## 📊 Flow Diagram

```
┌──────────────────┐
│  Người Dùng      │
└────────┬─────────┘
         │
    ┌─────▼─────────────────────┐
    │  Chọn Cách (3 Method)     │
    │  1. Palette               │
    │  2. Code                  │
    │  3. Color Picker          │
    └────────┬────────────────┬─┘
             │                │
    ┌────────▼─────┐   ┌──────▼────────┐
    │  Bảng Màu    │   │ Color Picker  │
    │  + Màu       │   │ (RGB Match)   │
    │  + Validate  │   │ (RGB Match)   │
    └────────┬─────┘   └──────┬────────┘
             └────────┬───────┘
                      │
            ┌─────────▼──────────┐
            │  Selected Color    │
            │  - code, name, hex │
            │  - base, palette   │
            └─────────┬──────────┘
                      │
            ┌─────────▼──────────────┐
            │ Find Formula (by code) │
            │ - tolerance, base      │
            └─────────┬──────────────┘
                      │
            ┌─────────▼──────────────┐
            │ Get Components         │
            │ - ml_per_L per comp    │
            └─────────┬──────────────┘
                      │
            ┌─────────▼──────────────┐
            │ Input Volume (L)       │
            │ Validate > 0           │
            └─────────┬──────────────┘
                      │
            ┌─────────▼──────────────────────┐
            │ Calculate Mix                  │
            │ ml_needed = ml_per_L × volume  │
            │ cost = ml_needed × price/ml    │
            │ total_cost = Σ(cost)           │
            └─────────┬──────────────────────┘
                      │
            ┌─────────▼──────────────┐
            │ Display Results        │
            │ - Color preview        │
            │ - Mix table            │
            │ - Cost breakdown       │
            │ - Tolerance info       │
            └────────────────────────┘
```

## 🔧 API Calls Sequence

```javascript
// 1. Load initial data (parallel)
ColorPalettesAPI.list()
ColorAPI.list()
ColorFormulasAPI.list()
ColorantsAPI.list()

// 2. Get components
FormulaComponentsAPI.listByFormula(formula_id)

// 3. Calculate (no API call needed)
ml_needed = component.ml_per_L * volume
cost = ml_needed * colorant.price_per_ml
```

## 🎨 UI Components

### Method Selector
```html
<button id="btn-palette" onclick="selectMethod('palette')">🎨 Bảng màu</button>
<button id="btn-code" onclick="selectMethod('code')">🔢 Mã màu</button>
<button id="btn-picker" onclick="selectMethod('picker')">🖱 Chọn màu</button>
```

### Palette Method
```html
<select id="palette-select">
  <!-- Populated by loadPalettes() -->
</select>
<select id="color-select">
  <!-- Populated by updateColorSelect() -->
</select>
```

### Code Method
```html
<input type="text" id="code-input" placeholder="VD: B003">
<small id="code-error" class="text-danger"></small>
```

### Color Picker Method
```html
<input type="color" id="color-picker" value="#E8DBC7">
<small>Chọn màu gần nhất sẽ được sử dụng</small>
```

### Volume Input
```html
<input type="number" id="volume-input" min="0.1" step="0.1" value="1">
<!-- Đơn vị: Lít -->
```

### Result Table
```html
<table id="mix-table">
  <tr>
    <td>Red Oxide</td>
    <td class="text-end">6 ml</td>
    <td class="text-end">1.200 đ</td>
  </tr>
  <!-- ... more rows ... -->
  <tr class="table-active fw-bold">
    <td>Tổng chất màu</td>
    <td class="text-end">18 ml</td>
    <td class="text-end">3.600 đ</td>
  </tr>
</table>
```

## ✅ Validation Rules

### Volume Input
- ✅ Phải là số
- ✅ Phải > 0
- ✅ Error message: "Vui lòng nhập dung tích hợp lệ (> 0)"

### Code Input
- ✅ Không được bỏ trống
- ✅ Phải tồn tại trong database
- ✅ Case-insensitive search
- ✅ Error messages:
  - "Mã màu không được bỏ trống"
  - "Không tìm thấy mã màu "X""

### Color Selection
- ✅ Phải chọn color khi dùng palette method
- ✅ Phải chọn palette trước

## 📝 Error Handling

```javascript
try {
  // Validation
  if (volume <= 0) throw new Error('Invalid volume');
  if (!selectedColor) throw new Error('No color selected');
  if (!formula) throw new Error('Formula not found');
  if (components.length === 0) throw new Error('No components');
  
  // Calculate & Display
  calculateMix();
} catch (err) {
  console.error(err);
  alert('Có lỗi xảy ra khi tính pha màu');
  // Clear results
  emptyState.classList.remove('d-none');
  resultContainer.classList.add('d-none');
}
```

## 🚀 Future Enhancements

1. **In Phiếu Pha Màu**
   - Print phiếu công thức (HTML to PDF)
   - Include color sample, tỉ lệ, base

2. **Lưu Dự Án**
   - Save mix recipe to user's projects
   - Track history of color mixing

3. **Export**
   - Export to CSV/PDF
   - Share recipe with team

4. **Batch Mixing**
   - Calculate multiple colors at once
   - Total cost summary

5. **Color Matching**
   - Upload image → suggest matching colors
   - Integration với AI color recognition

6. **Tolerance Check**
   - Visual representation of ΔE
   - Warning if tolerance is high

7. **Alternative Formulas**
   - Suggest similar colors if exact formula not available
   - Cost comparison

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2025  
**Status:** ✅ Implementation Complete
