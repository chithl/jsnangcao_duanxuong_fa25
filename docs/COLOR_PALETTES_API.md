# Color Palettes API Documentation

## Tổng quan
API quản lý bảng màu (Color Palettes) với đầy đủ chức năng CRUD, bulk operations, import/export, và quản lý colors.

## Cấu trúc dữ liệu

```javascript
{
  "id": "string",           // ID tự động (Firebase generated)
  "name": "string",         // Tên bảng màu (bắt buộc, unique)
  "notes": "string",        // Ghi chú (không bắt buộc)
  "is_active": "TRUE|FALSE", // Trạng thái (bắt buộc)
  "order": number,          // Thứ tự hiển thị (không bắt buộc, mặc định 0)
  "colors": [],             // Mảng color IDs (không bắt buộc)
  "created_at": "ISO8601",  // Thời gian tạo
  "updated_at": "ISO8601",  // Thời gian cập nhật
  "deleted_at": "ISO8601"   // Thời gian xóa (soft delete)
}
```

## Endpoints

### 1. GET /api/colorpalettes
Lấy danh sách bảng màu với filter, search và pagination.

**Query Parameters:**
- `page` (number): Trang hiện tại (mặc định: 1)
- `limit` (number): Số bản ghi mỗi trang (mặc định: tất cả)
- `search` (string): Tìm kiếm theo name hoặc notes
- `is_active` (string): Lọc theo trạng thái ("TRUE" hoặc "FALSE")
- `name` (string): Lọc theo tên chính xác
- `sortBy` (string): Trường sắp xếp (mặc định: "order")
- `sortDir` (string): Hướng sắp xếp "asc" hoặc "desc" (mặc định: "asc")

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9aZ1bC2dE3fG4hI5jK",
      "name": "Dark Neutral",
      "notes": "",
      "is_active": "TRUE",
      "order": 0,
      "colors": [],
      "created_at": "2025-12-17T10:30:00.000Z",
      "updated_at": "2025-12-17T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "LIST_ERROR",
  "message": "Chi tiết lỗi"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Lấy tất cả palettes
const result = await api.list();

// Tìm kiếm
const searchResult = await api.list({ search: "neutral" });

// Lọc active palettes với pagination
const activeResult = await api.list({ 
  is_active: "TRUE", 
  page: 1, 
  limit: 10 
});

// Sắp xếp theo tên
const sortedResult = await api.list({ 
  sortBy: "name", 
  sortDir: "desc" 
});
```

---

### 2. GET /api/colorpalettes/:id
Lấy chi tiết một bảng màu theo ID.

**URL Parameters:**
- `id` (string, required): ID của bảng màu

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "-O9aZ1bC2dE3fG4hI5jK",
    "name": "Dark Neutral",
    "notes": "Bảng màu trung tính tối",
    "is_active": "TRUE",
    "order": 0,
    "colors": ["color-id-1", "color-id-2"],
    "created_at": "2025-12-17T10:30:00.000Z",
    "updated_at": "2025-12-17T10:30:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "NOT_FOUND"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();
const result = await api.getOnePalette("-O9aZ1bC2dE3fG4hI5jK");
```

---

### 3. POST /api/colorpalettes
Tạo mới bảng màu.

**Request Body:**
```json
{
  "name": "Dark Neutral",
  "notes": "Bảng màu trung tính tối",
  "is_active": "TRUE",
  "order": 0,
  "colors": []
}
```

**Validation Rules:**
- `name`: Bắt buộc, không được trống, không trùng, tối đa 255 ký tự
- `notes`: Không bắt buộc, tối đa 1000 ký tự
- `is_active`: Bắt buộc, phải là "TRUE" hoặc "FALSE"
- `order`: Không bắt buộc, phải là số nguyên không âm
- `colors`: Không bắt buộc, phải là mảng
- **Không chấp nhận trường ngoài cấu trúc** (báo lỗi nếu có trường thừa)

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "-O9aZ1bC2dE3fG4hI5jK",
    "name": "Dark Neutral",
    "notes": "Bảng màu trung tính tối",
    "is_active": "TRUE",
    "order": 0,
    "colors": [],
    "created_at": "2025-12-17T10:30:00.000Z",
    "updated_at": "2025-12-17T10:30:00.000Z"
  },
  "message": "Tạo bảng màu thành công"
}
```

**Response Error - Validation (400):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "name",
      "message": "Tên bảng màu không được để trống"
    },
    {
      "field": "structure",
      "message": "Trường không hợp lệ: extra_field. Chỉ chấp nhận: name, notes, is_active, order, colors"
    }
  ]
}
```

**Response Error - Duplicate (409):**
```json
{
  "success": false,
  "error": "DUPLICATE_NAME",
  "message": "Tên bảng màu đã tồn tại"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

const payload = {
  name: "Dark Neutral",
  notes: "",
  is_active: "TRUE"
};

const result = await api.storePalette(payload);
```

---

### 4. PUT /api/colorpalettes/:id
Cập nhật bảng màu theo ID (hỗ trợ partial update).

**URL Parameters:**
- `id` (string, required): ID của bảng màu

**Request Body (partial update supported):**
```json
{
  "name": "Dark Neutral Updated",
  "notes": "Cập nhật ghi chú",
  "is_active": "FALSE",
  "order": 5
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "-O9aZ1bC2dE3fG4hI5jK",
    "name": "Dark Neutral Updated",
    "notes": "Cập nhật ghi chú",
    "is_active": "FALSE",
    "order": 5,
    "colors": [],
    "created_at": "2025-12-17T10:30:00.000Z",
    "updated_at": "2025-12-17T11:45:00.000Z"
  },
  "message": "Cập nhật bảng màu thành công"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "NOT_FOUND"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Full update
const result1 = await api.updatePalette("-O9aZ1bC2dE3fG4hI5jK", {
  name: "New Name",
  notes: "New notes",
  is_active: "FALSE"
});

// Partial update (chỉ update một số trường)
const result2 = await api.updatePalette("-O9aZ1bC2dE3fG4hI5jK", {
  is_active: "FALSE"
});
```

---

### 5. DELETE /api/colorpalettes/:id
Xóa hoặc ẩn bảng màu.

**URL Parameters:**
- `id` (string, required): ID của bảng màu

**Query Parameters:**
- `softDelete` (boolean): true = soft delete (ẩn), false = hard delete (xóa hẳn). Mặc định: true

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã ẩn bảng màu"
}
```
hoặc
```json
{
  "success": true,
  "message": "Đã xóa bảng màu"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "NOT_FOUND"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Soft delete (mặc định)
const result1 = await api.deletePalette("-O9aZ1bC2dE3fG4hI5jK");

// Hard delete
const result2 = await api.deletePalette("-O9aZ1bC2dE3fG4hI5jK", false);
```

---

### 6. POST /api/colorpalettes/import
Import danh sách bảng màu từ file/array.

**Request Body:**
```json
[
  {
    "name": "Dark Neutral",
    "notes": "",
    "is_active": "TRUE"
  },
  {
    "name": "Light Pastel",
    "notes": "Màu pastel nhạt",
    "is_active": "TRUE"
  }
]
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "index": 0,
      "success": true,
      "data": {
        "id": "-O9aZ1bC2dE3fG4hI5jK",
        "name": "Dark Neutral",
        "notes": "",
        "is_active": "TRUE"
      },
      "error": null
    },
    {
      "index": 1,
      "success": false,
      "data": null,
      "error": "DUPLICATE_NAME"
    }
  ],
  "summary": {
    "total": 2,
    "success": 1,
    "error": 1
  }
}
```

**Response Error - Invalid Payload:**
```json
{
  "success": false,
  "error": "INVALID_IMPORT_PAYLOAD",
  "message": "Dữ liệu import phải là mảng"
}
```

**Response Error - Validation:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errors": {
    "0": [
      {
        "field": "name",
        "message": "Tên bảng màu không được để trống"
      }
    ]
  }
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

const importData = [
  { name: "Dark Neutral", notes: "", is_active: "TRUE" },
  { name: "Light Pastel", notes: "Pastel colors", is_active: "TRUE" }
];

const result = await api.import(importData);
console.log(`Imported ${result.summary.success}/${result.summary.total} items`);
```

---

### 7. GET /api/colorpalettes/export
Export danh sách bảng màu (hỗ trợ filter như list endpoint).

**Query Parameters:** (giống GET /api/colorpalettes)
- `search`, `is_active`, `name`, `sortBy`, `sortDir`

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9aZ1bC2dE3fG4hI5jK",
      "name": "Dark Neutral",
      "notes": "",
      "is_active": "TRUE",
      "order": 0,
      "colors": []
    }
  ],
  "count": 25,
  "exported_at": "2025-12-17T12:00:00.000Z"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Export tất cả
const result = await api.export();

// Export chỉ active palettes
const activeExport = await api.export({ is_active: "TRUE" });

// Download as JSON
const blob = new Blob([JSON.stringify(result.data, null, 2)], 
  { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Trigger download...
```

---

### 8. POST /api/colorpalettes/bulk
Bulk operations: update status, delete, upsert nhiều bảng màu cùng lúc.

**Request Body:**
```json
{
  "action": "update_status | delete | upsert",
  "ids": ["id1", "id2", "id3"],
  "data": {
    "is_active": "FALSE",
    "hardDelete": false
  }
}
```

**Actions:**
- `update_status`: Cập nhật trạng thái (cần `data.is_active`)
- `delete`: Xóa nhiều (tùy chọn `data.hardDelete`)
- `upsert`: Cập nhật nếu tồn tại (cần `data` với các trường cần update)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "id1",
      "status": "updated",
      "error": null
    },
    {
      "id": "id2",
      "status": "deleted",
      "error": null
    },
    {
      "id": "id3",
      "status": "error",
      "error": "NOT_FOUND"
    }
  ],
  "summary": {
    "total": 3,
    "success": 2,
    "error": 1
  }
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Bulk update status
const result1 = await api.bulk({
  action: "update_status",
  ids: ["id1", "id2", "id3"],
  data: { is_active: "FALSE" }
});

// Bulk soft delete
const result2 = await api.bulk({
  action: "delete",
  ids: ["id1", "id2"],
  data: { hardDelete: false }
});

// Bulk hard delete
const result3 = await api.bulk({
  action: "delete",
  ids: ["id1", "id2"],
  data: { hardDelete: true }
});
```

---

### 9. POST /api/colorpalettes/reorder
Sắp xếp lại thứ tự hiển thị các bảng màu.

**Request Body:**
```json
[
  { "id": "id1", "order": 0 },
  { "id": "id2", "order": 1 },
  { "id": "id3", "order": 2 }
]
```

**Validation:**
- Mỗi item phải có `id` và `order`
- `order` phải là số nguyên không âm

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "id1",
      "status": "reordered",
      "error": null
    },
    {
      "id": "id2",
      "status": "reordered",
      "error": null
    }
  ],
  "summary": {
    "total": 2,
    "success": 2,
    "error": 0
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "items[0].id",
      "message": "Thiếu ID cho mục cần sắp xếp"
    }
  ]
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

const reorderData = [
  { id: "palette-1", order: 2 },
  { id: "palette-2", order: 0 },
  { id: "palette-3", order: 1 }
];

const result = await api.reorder(reorderData);
```

---

### 10. POST /api/colorpalettes/:id/colors/bulk
Bulk add/remove/replace colors trong một bảng màu.

**URL Parameters:**
- `id` (string, required): ID của bảng màu

**Request Body:**
```json
{
  "action": "add | remove | replace",
  "colorIds": ["color-1", "color-2", "color-3"]
}
```

**Actions:**
- `add`: Thêm colors vào palette (không trùng)
- `remove`: Xóa colors khỏi palette
- `replace`: Thay thế hoàn toàn danh sách colors

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "paletteId": "-O9aZ1bC2dE3fG4hI5jK",
    "action": "add",
    "previousCount": 2,
    "newCount": 5,
    "colors": ["color-1", "color-2", "color-3", "color-4", "color-5"]
  },
  "message": "Đã add 3 màu"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "INVALID_ACTION",
  "message": "action phải là add, remove hoặc replace"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Add colors
const result1 = await api.bulkColors("palette-1", {
  action: "add",
  colorIds: ["color-1", "color-2", "color-3"]
});

// Remove colors
const result2 = await api.bulkColors("palette-1", {
  action: "remove",
  colorIds: ["color-2"]
});

// Replace all colors
const result3 = await api.bulkColors("palette-1", {
  action: "replace",
  colorIds: ["color-4", "color-5", "color-6"]
});
```

---

### 11. GET /api/colorpalettes/:id/colors
Lấy danh sách colors trong một palette.

**URL Parameters:**
- `id` (string, required): ID của bảng màu

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "paletteId": "-O9aZ1bC2dE3fG4hI5jK",
    "paletteName": "Dark Neutral",
    "colors": ["color-1", "color-2", "color-3"],
    "count": 3
  }
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();
const result = await api.getColors("palette-1");
console.log(`Palette has ${result.data.count} colors`);
```

---

### 12. GET /api/colorpalettes/active
Lấy danh sách palettes đang active (is_active = TRUE).

**Query Parameters:** (giống GET /api/colorpalettes, nhưng is_active tự động = TRUE)

**Response:** Giống GET /api/colorpalettes

**Ví dụ sử dụng:**
```javascript
const api = new ColorPalettesAPI();

// Lấy tất cả active palettes
const result = await api.getActivePalettes();

// Active palettes với pagination
const pagedResult = await api.getActivePalettes({ page: 1, limit: 10 });
```

---

## Error Codes

| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ |
| `MISSING_ID` | 400 | Thiếu ID |
| `MISSING_NAME` | 400 | Thiếu tên |
| `DUPLICATE_NAME` | 409 | Tên đã tồn tại |
| `NOT_FOUND` | 404 | Không tìm thấy bảng màu |
| `INVALID_BULK_PAYLOAD` | 400 | Payload bulk không hợp lệ |
| `INVALID_IMPORT_PAYLOAD` | 400 | Payload import không hợp lệ |
| `INVALID_ACTION` | 400 | Action không hợp lệ |
| `MISSING_PALETTE_ID` | 400 | Thiếu ID palette |
| `PALETTE_NOT_FOUND` | 404 | Không tìm thấy palette |
| `LIST_ERROR` | 500 | Lỗi khi lấy danh sách |
| `GET_ERROR` | 500 | Lỗi khi lấy chi tiết |
| `STORE_ERROR` | 500 | Lỗi khi tạo mới |
| `UPDATE_ERROR` | 500 | Lỗi khi cập nhật |
| `DELETE_ERROR` | 500 | Lỗi khi xóa |
| `BULK_ERROR` | 500 | Lỗi bulk operation |
| `IMPORT_ERROR` | 500 | Lỗi import |
| `EXPORT_ERROR` | 500 | Lỗi export |
| `REORDER_ERROR` | 500 | Lỗi reorder |
| `BULK_COLORS_ERROR` | 500 | Lỗi bulk colors |

---

## Business Logic

### 1. Uniqueness
- Tên bảng màu (`name`) phải duy nhất
- Kiểm tra trước khi tạo mới hoặc cập nhật

### 2. Validation
- Validate đầy đủ theo cấu trúc bảng
- Báo lỗi nếu truyền thừa hoặc thiếu trường bắt buộc
- Sử dụng `ColorPaletteValidate` class

### 3. Soft Delete
- Mặc định sử dụng soft delete (set `is_active = FALSE`)
- Có thể hard delete nếu cần (xóa hẳn khỏi DB)

### 4. Audit Trail
- Tự động lưu `created_at`, `updated_at`, `deleted_at`
- Có thể mở rộng với audit log riêng

### 5. Order Management
- Sử dụng field `order` để sắp xếp
- Hỗ trợ reorder động

### 6. Colors Management
- Lưu color IDs dạng array
- Hỗ trợ add/remove/replace bulk

---

## Security & Authorization

### Yêu cầu bảo mật:
1. **Authentication**: Tất cả endpoints yêu cầu token
2. **Authorization**:
   - Admin: Full access
   - Manager: CRUD (except hard delete)
   - User: Read only

### Rate Limiting:
- List/Export: 100 requests/minute
- Create/Update/Delete: 30 requests/minute
- Bulk operations: 10 requests/minute

---

## Testing Checklist

### Unit Tests
- [ ] Validation: name required, unique
- [ ] Validation: is_active format
- [ ] Validation: extra fields rejected
- [ ] CRUD operations
- [ ] Bulk operations (update_status, delete, upsert)
- [ ] Import/Export
- [ ] Reorder
- [ ] Bulk colors (add, remove, replace)

### Integration Tests
- [ ] API endpoints response codes
- [ ] Pagination
- [ ] Search/Filter
- [ ] Sorting
- [ ] Error handling
- [ ] Concurrent operations

### Business Logic Tests
- [ ] Duplicate name prevention
- [ ] Soft delete vs hard delete
- [ ] Order management
- [ ] Colors array management

---

## Usage Examples

### Complete CRUD Flow
```javascript
import { ColorPalettesAPI } from './ColorPalettesAPI.js';

const api = new ColorPalettesAPI();

// 1. Create
const createResult = await api.storePalette({
  name: "Dark Neutral",
  notes: "Neutral dark colors",
  is_active: "TRUE"
});
const paletteId = createResult.data.id;

// 2. Read
const getResult = await api.getOnePalette(paletteId);

// 3. Update
const updateResult = await api.updatePalette(paletteId, {
  notes: "Updated notes"
});

// 4. List with filter
const listResult = await api.list({
  search: "neutral",
  is_active: "TRUE",
  page: 1,
  limit: 10
});

// 5. Delete (soft)
const deleteResult = await api.deletePalette(paletteId);
```

### Advanced Operations
```javascript
// Import multiple palettes
const importData = [
  { name: "Palette 1", notes: "", is_active: "TRUE" },
  { name: "Palette 2", notes: "", is_active: "TRUE" }
];
const importResult = await api.import(importData);

// Export with filter
const exportResult = await api.export({ is_active: "TRUE" });

// Bulk status update
const bulkResult = await api.bulk({
  action: "update_status",
  ids: ["id1", "id2"],
  data: { is_active: "FALSE" }
});

// Reorder palettes
const reorderResult = await api.reorder([
  { id: "id1", order: 2 },
  { id: "id2", order: 0 },
  { id: "id3", order: 1 }
]);

// Manage colors in palette
const colorsResult = await api.bulkColors("palette-id", {
  action: "add",
  colorIds: ["color-1", "color-2"]
});
```

---

## Frontend Integration Guide

### Setup
```javascript
// Import API
import { ColorPalettesAPI } from '@/controllers/api/ColorPalettesAPI.js';

// Initialize
const colorPalettesAPI = new ColorPalettesAPI();
```

### React/Vue Component Example
```javascript
// Fetch palettes
const [palettes, setPalettes] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchPalettes = async () => {
    setLoading(true);
    const result = await colorPalettesAPI.list({
      is_active: "TRUE",
      page: 1,
      limit: 20
    });
    
    if (result.success) {
      setPalettes(result.data);
    }
    setLoading(false);
  };
  
  fetchPalettes();
}, []);
```

### Form Validation
```javascript
import { ColorPaletteValidate } from '@/controllers/api/validate/ColorPaletteValidate.js';

const validator = new ColorPaletteValidate();

const handleSubmit = (formData) => {
  const validation = validator.checkValidate(formData);
  
  if (!validation.isValid) {
    // Show errors
    setErrors(validation.errors);
    return;
  }
  
  // Proceed with API call
  const result = await colorPalettesAPI.storePalette(formData);
};
```

---

## Database Schema (Firebase Realtime Database)

```
colorpalettes/
  ├── -O9aZ1bC2dE3fG4hI5jK/
  │   ├── name: "Dark Neutral"
  │   ├── notes: ""
  │   ├── is_active: "TRUE"
  │   ├── order: 0
  │   ├── colors: []
  │   ├── created_at: "2025-12-17T10:30:00.000Z"
  │   └── updated_at: "2025-12-17T10:30:00.000Z"
  └── -O9aZ1bC2dE3fG4hI5jL/
      ├── name: "Light Pastel"
      └── ...
```

---

## Migration Script

```javascript
// Script để migrate dữ liệu cũ sang cấu trúc mới
async function migrateColorPalettes() {
  const api = new ColorPalettesAPI();
  const oldData = await fetchOldData();
  
  for (const item of oldData) {
    const newFormat = {
      name: item.palette_name,
      notes: item.description || "",
      is_active: item.active ? "TRUE" : "FALSE",
      order: item.display_order || 0,
      colors: item.color_list || []
    };
    
    await api.storePalette(newFormat);
  }
}
```

---

## Performance Optimization

### Client-side Caching
```javascript
// Cache palettes data
const cache = new Map();

async function getCachedPalettes(query) {
  const cacheKey = JSON.stringify(query);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await api.list(query);
  cache.set(cacheKey, result);
  
  return result;
}
```

### Pagination Best Practices
- Sử dụng pagination cho list lớn
- Limit mặc định: 20-50 items
- Lazy loading khi scroll

---

## Roadmap

### Phase 1 (Current) ✅
- [x] Basic CRUD
- [x] Validation
- [x] Import/Export
- [x] Bulk operations
- [x] Reorder
- [x] Colors management

### Phase 2 (Planned)
- [ ] Audit log system
- [ ] Version history
- [ ] Advanced search (full-text)
- [ ] Webhooks
- [ ] Real-time sync

### Phase 3 (Future)
- [ ] AI color recommendations
- [ ] Color harmony analysis
- [ ] Accessibility checker
- [ ] Collaborative editing

---

## Support & Contact

Để hỗ trợ và báo lỗi, vui lòng liên hệ team phát triển.
