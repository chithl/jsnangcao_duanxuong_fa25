# Colors API Documentation

## Tổng quan
API quản lý sản phẩm màu hoàn thiện (Colors) với đầy đủ chức năng CRUD, bulk operations, import/export, và lọc theo palette.

## Cấu trúc dữ liệu

```javascript
{
  "id": "string",           // ID tự động (Firebase generated)
  "base": "string",         // Loại base màu (bắt buộc)
  "code": "string",         // Mã màu (bắt buộc, unique)
  "hex": "string",          // Mã màu HEX (bắt buộc, format #RRGGBB)
  "name": "string",         // Tên màu (bắt buộc)
  "palette_id": "string",   // ID bảng màu (bắt buộc)
  "created_at": "ISO8601",  // Thời gian tạo
  "updated_at": "ISO8601"   // Thời gian cập nhật
}
```

## Business Rules

### 1. Uniqueness
- **code**: Mã màu phải là duy nhất trong toàn bộ hệ thống
- Hệ thống kiểm tra trùng lặp khi tạo mới hoặc cập nhật

### 2. Validation
- **base**: Bắt buộc, không để trống, tối đa 50 ký tự
- **code**: Bắt buộc, không để trống, unique, tối đa 100 ký tự
- **hex**: Bắt buộc, phải đúng format #RRGGBB (ví dụ: #E8DBC7)
- **name**: Bắt buộc, không để trống, tối đa 255 ký tự
- **palette_id**: Bắt buộc, không để trống, tối đa 255 ký tự
- **Không chấp nhận trường ngoài cấu trúc** (báo lỗi nếu có trường thừa)

### 3. HEX Color Format
- Phải bắt đầu bằng `#`
- Theo sau là 6 ký tự hex (0-9, A-F)
- Ví dụ hợp lệ: `#E8DBC7`, `#FF5733`, `#000000`
- Ví dụ không hợp lệ: `E8DBC7`, `#E8D`, `#GGGGGG`

### 4. Palette Integration
- Colors được liên kết với palette thông qua `palette_id`
- Có thể lọc tất cả colors theo palette
- Không kiểm tra tồn tại của palette (linh hoạt)

## Endpoints

### 1. GET /api/colors
Lấy danh sách colors với filter, search và pagination.

**Query Parameters:**
- `page` (number): Trang hiện tại (mặc định: 1)
- `limit` (number): Số bản ghi mỗi trang (mặc định: tất cả)
- `search` (string): Tìm kiếm theo name, code, hex, base
- `palette_id` (string): Lọc theo palette_id
- `base` (string): Lọc theo base
- `code` (string): Lọc theo code chính xác
- `name` (string): Lọc theo tên chính xác
- `sortBy` (string): Trường sắp xếp (mặc định: "name")
- `sortDir` (string): Hướng sắp xếp "asc" hoặc "desc" (mặc định: "asc")

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9bA1cD2eF3gH4iJ5kL",
      "base": "A",
      "code": "B003",
      "hex": "#E8DBC7",
      "name": "Soft Beige",
      "palette_id": "pal_003",
      "created_at": "2025-12-17T10:30:00.000Z",
      "updated_at": "2025-12-17T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
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
const api = new ColorsAPI();

// Lấy tất cả colors
const result = await api.list();

// Tìm kiếm
const searchResult = await api.list({ search: "beige" });

// Lọc theo palette với pagination
const paletteResult = await api.list({ 
  palette_id: "pal_003", 
  page: 1, 
  limit: 10 
});

// Lọc theo base
const baseResult = await api.list({ base: "A" });

// Sắp xếp theo code
const sortedResult = await api.list({ 
  sortBy: "code", 
  sortDir: "asc" 
});
```

---

### 2. GET /api/colors/:id
Lấy chi tiết một màu theo ID.

**URL Parameters:**
- `id` (string, required): ID của màu

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "-O9bA1cD2eF3gH4iJ5kL",
    "base": "A",
    "code": "B003",
    "hex": "#E8DBC7",
    "name": "Soft Beige",
    "palette_id": "pal_003",
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
const api = new ColorsAPI();
const result = await api.getOneColor("-O9bA1cD2eF3gH4iJ5kL");
```

---

### 3. GET /api/colors/by-palette/:paletteId
Lấy tất cả colors theo palette_id.

**URL Parameters:**
- `paletteId` (string, required): ID của palette

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9bA1cD2eF3gH4iJ5kL",
      "base": "A",
      "code": "B003",
      "hex": "#E8DBC7",
      "name": "Soft Beige",
      "palette_id": "pal_003"
    },
    {
      "id": "-O9bB2dE3fG4hI5jK6lM",
      "base": "A",
      "code": "B004",
      "hex": "#F5E6D3",
      "name": "Light Beige",
      "palette_id": "pal_003"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 999999,
    "total": 2,
    "totalPages": 1
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "MISSING_PALETTE_ID"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();
const result = await api.getColorsByPalette("pal_003");
```

---

### 4. POST /api/colors
Tạo mới màu.

**Request Body:**
```json
{
  "base": "A",
  "code": "B003",
  "hex": "#E8DBC7",
  "name": "Soft Beige",
  "palette_id": "pal_003"
}
```

**Validation Rules:**
- `base`: Bắt buộc, không được trống, tối đa 50 ký tự
- `code`: Bắt buộc, không trùng, không được trống, tối đa 100 ký tự
- `hex`: Bắt buộc, phải đúng format #RRGGBB
- `name`: Bắt buộc, không được trống, tối đa 255 ký tự
- `palette_id`: Bắt buộc, không được trống, tối đa 255 ký tự
- **Không chấp nhận trường ngoài cấu trúc** (báo lỗi nếu có trường thừa)

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "-O9bA1cD2eF3gH4iJ5kL",
    "base": "A",
    "code": "B003",
    "hex": "#E8DBC7",
    "name": "Soft Beige",
    "palette_id": "pal_003"
  },
  "message": "Tạo màu thành công"
}
```

**Response Error - Validation (400):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "hex",
      "message": "Mã hex phải dạng #RRGGBB"
    },
    {
      "field": "structure",
      "message": "Trường không hợp lệ: extra_field. Chỉ chấp nhận: base, code, hex, name, palette_id"
    }
  ]
}
```

**Response Error - Duplicate (409):**
```json
{
  "success": false,
  "error": "DUPLICATE_CODE",
  "message": "Mã màu đã tồn tại"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();

const payload = {
  base: "A",
  code: "B003",
  hex: "#E8DBC7",
  name: "Soft Beige",
  palette_id: "pal_003"
};

const result = await api.storeColor(payload);
```

---

### 5. PUT /api/colors/:id
Cập nhật màu theo ID (hỗ trợ partial update).

**URL Parameters:**
- `id` (string, required): ID của màu

**Request Body (partial update supported):**
```json
{
  "name": "Soft Beige Updated",
  "hex": "#E9DCC8"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "-O9bA1cD2eF3gH4iJ5kL",
    "base": "A",
    "code": "B003",
    "hex": "#E9DCC8",
    "name": "Soft Beige Updated",
    "palette_id": "pal_003",
    "created_at": "2025-12-17T10:30:00.000Z",
    "updated_at": "2025-12-17T11:45:00.000Z"
  },
  "message": "Cập nhật màu thành công"
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
const api = new ColorsAPI();

// Full update
const result1 = await api.updateColor("-O9bA1cD2eF3gH4iJ5kL", {
  base: "B",
  code: "B004",
  hex: "#F5E6D3",
  name: "Light Beige",
  palette_id: "pal_003"
});

// Partial update (chỉ update một số trường)
const result2 = await api.updateColor("-O9bA1cD2eF3gH4iJ5kL", {
  name: "New Name",
  hex: "#FFFFFF"
});
```

---

### 6. DELETE /api/colors/:id
Xóa màu (hard delete).

**URL Parameters:**
- `id` (string, required): ID của màu

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa màu"
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
const api = new ColorsAPI();
const result = await api.deleteColor("-O9bA1cD2eF3gH4iJ5kL");
```

---

### 7. POST /api/colors/import
Import danh sách colors từ mảng.

**Request Body:**
```json
[
  {
    "base": "A",
    "code": "B003",
    "hex": "#E8DBC7",
    "name": "Soft Beige",
    "palette_id": "pal_003"
  },
  {
    "base": "A",
    "code": "B004",
    "hex": "#F5E6D3",
    "name": "Light Beige",
    "palette_id": "pal_003"
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
        "id": "-O9bA1cD2eF3gH4iJ5kL",
        "base": "A",
        "code": "B003",
        "hex": "#E8DBC7",
        "name": "Soft Beige",
        "palette_id": "pal_003"
      },
      "error": null
    },
    {
      "index": 1,
      "success": false,
      "data": null,
      "error": "DUPLICATE_CODE"
    }
  ],
  "summary": {
    "total": 2,
    "success": 1,
    "error": 1
  }
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
        "field": "hex",
        "message": "Mã hex phải dạng #RRGGBB"
      }
    ],
    "1": [
      {
        "field": "code",
        "message": "Code không được để trống"
      }
    ]
  }
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();

const list = [
  {
    base: "A",
    code: "B003",
    hex: "#E8DBC7",
    name: "Soft Beige",
    palette_id: "pal_003"
  },
  {
    base: "A",
    code: "B004",
    hex: "#F5E6D3",
    name: "Light Beige",
    palette_id: "pal_003"
  }
];

const result = await api.import(list);
```

---

### 8. GET /api/colors/export
Export danh sách colors (dựa trên filter).

**Query Parameters:**
Giống với GET /api/colors (search, filter, sort)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9bA1cD2eF3gH4iJ5kL",
      "base": "A",
      "code": "B003",
      "hex": "#E8DBC7",
      "name": "Soft Beige",
      "palette_id": "pal_003"
    }
  ],
  "count": 50,
  "exported_at": "2025-12-17T12:00:00.000Z"
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();

// Export tất cả
const result1 = await api.export();

// Export với filter
const result2 = await api.export({ palette_id: "pal_003" });

// Export active colors của palette cụ thể
const result3 = await api.export({ 
  palette_id: "pal_003",
  base: "A"
});
```

---

### 9. POST /api/colors/bulk
Bulk operations: delete, upsert.

**Request Body:**
```json
{
  "action": "delete",
  "ids": ["-O9bA1cD2eF3gH4iJ5kL", "-O9bB2dE3fG4hI5jK6lM"],
  "data": {}
}
```

**Actions:**
- `delete`: Xóa nhiều colors
- `upsert`: Cập nhật nhiều colors (nếu có ID)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-O9bA1cD2eF3gH4iJ5kL",
      "status": "deleted",
      "error": null
    },
    {
      "id": "-O9bB2dE3fG4hI5jK6lM",
      "status": "error",
      "error": "NOT_FOUND"
    }
  ],
  "summary": {
    "total": 2,
    "success": 1,
    "error": 1
  }
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();

// Bulk delete
const result1 = await api.bulk({
  action: "delete",
  ids: ["-O9bA1cD2eF3gH4iJ5kL", "-O9bB2dE3fG4hI5jK6lM"]
});

// Bulk upsert (update)
const result2 = await api.bulk({
  action: "upsert",
  ids: ["-O9bA1cD2eF3gH4iJ5kL"],
  data: {
    name: "Updated Name",
    hex: "#FFFFFF"
  }
});
```

---

### 10. GET /api/colors/bases
Lấy danh sách base duy nhất.

**Response Success (200):**
```json
{
  "success": true,
  "data": ["A", "B", "C", "D"]
}
```

**Ví dụ sử dụng:**
```javascript
const api = new ColorsAPI();
const result = await api.getUniqueBases();
```

---

## Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `LIST_ERROR` | Lỗi khi lấy danh sách | 500 |
| `GET_ERROR` | Lỗi khi lấy chi tiết | 500 |
| `STORE_ERROR` | Lỗi khi tạo mới | 500 |
| `UPDATE_ERROR` | Lỗi khi cập nhật | 500 |
| `DELETE_ERROR` | Lỗi khi xóa | 500 |
| `VALIDATION_ERROR` | Lỗi validate dữ liệu | 400 |
| `DUPLICATE_CODE` | Mã màu đã tồn tại | 409 |
| `NOT_FOUND` | Không tìm thấy color | 404 |
| `MISSING_ID` | Thiếu ID | 400 |
| `MISSING_PALETTE_ID` | Thiếu palette_id | 400 |
| `INVALID_IMPORT_PAYLOAD` | Dữ liệu import không hợp lệ | 400 |
| `INVALID_BULK_PAYLOAD` | Dữ liệu bulk không hợp lệ | 400 |
| `BULK_ERROR` | Lỗi bulk operation | 500 |
| `IMPORT_ERROR` | Lỗi import | 500 |
| `EXPORT_ERROR` | Lỗi export | 500 |
| `GET_BY_PALETTE_ERROR` | Lỗi lấy colors theo palette | 500 |
| `GET_BASES_ERROR` | Lỗi lấy danh sách bases | 500 |

---

## Use Cases

### Use Case 1: Quản lý colors trong palette
```javascript
const api = new ColorsAPI();

// 1. Tạo color mới cho palette
const newColor = await api.storeColor({
  base: "A",
  code: "B003",
  hex: "#E8DBC7",
  name: "Soft Beige",
  palette_id: "pal_003"
});

// 2. Lấy tất cả colors của palette
const paletteColors = await api.getColorsByPalette("pal_003");

// 3. Cập nhật color
const updated = await api.updateColor(newColor.data.id, {
  name: "Soft Beige Updated",
  hex: "#E9DCC8"
});

// 4. Xóa color
await api.deleteColor(newColor.data.id);
```

### Use Case 2: Import/Export colors
```javascript
const api = new ColorsAPI();

// 1. Export colors của palette
const exported = await api.export({ palette_id: "pal_003" });

// 2. Chỉnh sửa exported.data nếu cần

// 3. Import vào palette khác
const newColors = exported.data.map(c => ({
  ...c,
  palette_id: "pal_004"
}));
delete newColors.id; // Xóa ID để tạo mới

const imported = await api.import(newColors);
```

### Use Case 3: Bulk operations
```javascript
const api = new ColorsAPI();

// 1. Lấy tất cả colors cần xóa
const toDelete = await api.list({ 
  palette_id: "pal_old",
  limit: 999999
});

const ids = toDelete.data.map(c => c.id);

// 2. Bulk delete
const deleted = await api.bulk({
  action: "delete",
  ids: ids
});

console.log(`Đã xóa ${deleted.summary.success} colors`);
```

### Use Case 4: Search và filter
```javascript
const api = new ColorsAPI();

// Tìm colors theo từ khóa
const search = await api.list({ search: "beige" });

// Lọc theo base
const baseA = await api.list({ base: "A" });

// Lọc theo palette và sort
const sortedColors = await api.list({
  palette_id: "pal_003",
  sortBy: "code",
  sortDir: "asc"
});

// Pagination
const page1 = await api.list({ page: 1, limit: 20 });
const page2 = await api.list({ page: 2, limit: 20 });
```

---

## Integration với Color Palettes

```javascript
// Lấy palette và colors của nó
const paletteAPI = new ColorPalettesAPI();
const colorAPI = new ColorsAPI();

const paletteId = "pal_003";

// 1. Lấy thông tin palette
const palette = await paletteAPI.getOnePalette(paletteId);

// 2. Lấy tất cả colors trong palette
const colors = await colorAPI.getColorsByPalette(paletteId);

console.log(`Palette "${palette.data.name}" có ${colors.data.length} màu`);
```

---

## Testing

### Test Cases Checklist

#### CRUD Operations
- [ ] Tạo color với dữ liệu hợp lệ
- [ ] Tạo color với dữ liệu không hợp lệ (thiếu field)
- [ ] Tạo color với trường thừa
- [ ] Tạo color với code trùng
- [ ] Tạo color với hex không hợp lệ
- [ ] Lấy danh sách colors
- [ ] Lấy chi tiết color theo ID
- [ ] Cập nhật color (full update)
- [ ] Cập nhật color (partial update)
- [ ] Cập nhật color với code trùng
- [ ] Xóa color

#### Filter & Search
- [ ] Tìm kiếm theo từ khóa
- [ ] Lọc theo palette_id
- [ ] Lọc theo base
- [ ] Lọc theo code
- [ ] Lọc theo name
- [ ] Kết hợp nhiều filter
- [ ] Sắp xếp theo các trường khác nhau
- [ ] Pagination

#### Bulk Operations
- [ ] Bulk delete nhiều colors
- [ ] Bulk upsert colors
- [ ] Bulk với IDs không tồn tại

#### Import/Export
- [ ] Import danh sách colors hợp lệ
- [ ] Import với dữ liệu không hợp lệ
- [ ] Import với code trùng
- [ ] Export tất cả colors
- [ ] Export với filter

#### Business Logic
- [ ] Kiểm tra uniqueness của code
- [ ] Validate format HEX
- [ ] Lấy colors theo palette
- [ ] Lấy danh sách bases

---

## Migration/Schema Suggestion

```javascript
// Firebase Realtime Database structure
{
  "colors": {
    "-O9bA1cD2eF3gH4iJ5kL": {
      "base": "A",
      "code": "B003",
      "hex": "#E8DBC7",
      "name": "Soft Beige",
      "palette_id": "pal_003",
      "created_at": "2025-12-17T10:30:00.000Z",
      "updated_at": "2025-12-17T10:30:00.000Z"
    }
  }
}
```

---

## Security & Permissions

### Recommended Permissions
- **Admin**: Full CRUD access
- **Manager**: Read, Create, Update (không Delete)
- **User**: Read only

### Authentication
- Tất cả endpoints cần token authentication
- Kiểm tra role trước khi thực hiện action
- Audit log cho các thay đổi quan trọng

---

## Performance Considerations

1. **Caching**: Cache danh sách colors theo palette_id
2. **Pagination**: Luôn sử dụng pagination cho list lớn
3. **Indexing**: Index theo code, palette_id, base để tìm kiếm nhanh
4. **Bulk Operations**: Xử lý bulk theo batch để tránh timeout

---

## Changelog

### Version 1.0.0 (2025-12-17)
- Initial release
- Full CRUD operations
- Bulk operations (delete, upsert)
- Import/Export
- Filter by palette_id, base, attributes
- Validation với structure checking
- Uniqueness checking cho code
- HEX format validation
