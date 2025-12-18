# Calculation Session API Documentation

## 📋 Tổng quan

API quản lý phiên tính toán sơn (Calculation Sessions) cho phép tính toán, lưu trữ và quản lý các phương án sơn cho từng bề mặt (surface) trong hệ thống.

### Mục đích
- Lưu trữ thông tin tính toán lượng sơn cần thiết cho mỗi bề mặt
- Quản lý nhiều phương án tính toán khác nhau
- So sánh các phương án
- Xuất/nhập dữ liệu
- Versioning và snapshot

---

## 🗄️ Cấu trúc dữ liệu

### Calc Session Object

```json
{
  "id": "-OgfoJmW-TaRvMGhaX4_",
  "surface_id": "-OgfoJmW-TaRvMGhaX4_",
  "coverage_rule_id": "rule_interior_new_wall",
  "cover_m2_per_L": 2,
  "coats": 2,
  "wastage_pct": 0.08,
  "litres_needed": 7.5,
  "suggestion": "Sử dụng sơn lót trước khi sơn phủ",
  "create_at": "2025-12-18T10:00:00.000Z",
  "updated_at": "2025-12-18T10:30:00.000Z",
  "status": "active"
}
```

### Trường dữ liệu

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `id` | string | Auto | ID duy nhất (Firebase generated) |
| `surface_id` | string | ✅ | Khóa ngoại tới bảng surfaces |
| `coverage_rule_id` | string | ✅ | ID quy tắc phủ (coverage rule) |
| `cover_m2_per_L` | number | ✅ | Độ phủ (m²/lít), > 0, ≤ 100 |
| `coats` | integer | ✅ | Số lớp sơn, ≥ 1, ≤ 10 |
| `wastage_pct` | number | ✅ | Tỷ lệ hao hụt (0.0-1.0), VD: 0.08 = 8% |
| `litres_needed` | number | ✅ | Số lít sơn cần thiết, > 0, ≤ 10000 |
| `suggestion` | string | ⬜ | Gợi ý/ghi chú, tối đa 1000 ký tự |
| `create_at` | ISO 8601 | Auto | Thời gian tạo |
| `updated_at` | ISO 8601 | Auto | Thời gian cập nhật |
| `status` | string | Auto | Trạng thái: active/deleted |

---

## 🔧 API Endpoints

### Base URL
```
https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/calc_sessions
```

---

## 📚 CRUD Operations

### 1. GET - Lấy tất cả phiên tính toán

**Endpoint:** `GET /calc_sessions`

**Method:** `getAllCalcSessions(options)`

#### Parameters (options):
```javascript
{
  page: 1,              // Số trang (default: 1)
  limit: 20,            // Số bản ghi/trang (default: 20)
  surface_id: "...",    // Lọc theo surface_id
  coverage_rule_id: "...", // Lọc theo coverage_rule_id
  search: "keyword",    // Tìm kiếm trong suggestion
  sortBy: "create_at",  // Trường sắp xếp
  sortOrder: "desc"     // asc hoặc desc
}
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "-OgfoJmW-TaRvMGhaX4_",
      "surface_id": "-OgfoJmW-TaRvMGhaX4_",
      "coverage_rule_id": "rule_interior_new_wall",
      "cover_m2_per_L": 2,
      "coats": 2,
      "wastage_pct": 0.08,
      "litres_needed": 7.5,
      "suggestion": "Sử dụng sơn lót",
      "create_at": "2025-12-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Example:
```javascript
const api = new CalcSessionAPI();

// Lấy tất cả
const result = await api.getAllCalcSessions();

// Với pagination
const paginatedResult = await api.getAllCalcSessions({ 
  page: 1, 
  limit: 10 
});

// Với filter
const filteredResult = await api.getAllCalcSessions({ 
  surface_id: "-OgfoJmW-TaRvMGhaX4_" 
});

// Với search
const searchResult = await api.getAllCalcSessions({ 
  search: "sơn lót" 
});
```

---

### 2. GET - Lấy một phiên tính toán

**Endpoint:** `GET /calc_sessions/:id`

**Method:** `getOneCalcSession(id)`

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "-OgfoJmW-TaRvMGhaX4_",
    "surface_id": "-OgfoJmW-TaRvMGhaX4_",
    "coverage_rule_id": "rule_interior_new_wall",
    "cover_m2_per_L": 2,
    "coats": 2,
    "wastage_pct": 0.08,
    "litres_needed": 7.5,
    "suggestion": "Sử dụng sơn lót",
    "create_at": "2025-12-18T10:00:00.000Z",
    "updated_at": "2025-12-18T10:30:00.000Z"
  }
}
```

#### Example:
```javascript
const result = await api.getOneCalcSession("-OgfoJmW-TaRvMGhaX4_");

if (result.success) {
  console.log("Session data:", result.data);
}
```

---

### 3. POST - Tạo phiên tính toán mới

**Endpoint:** `POST /calc_sessions`

**Method:** `storeCalcSession(data)`

#### Request Body:
```json
{
  "surface_id": "-OgfoJmW-TaRvMGhaX4_",
  "coverage_rule_id": "rule_interior_new_wall",
  "cover_m2_per_L": 2,
  "coats": 2,
  "wastage_pct": 0.08,
  "litres_needed": 7.5,
  "suggestion": "Sử dụng sơn lót trước khi sơn phủ"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "-OgfoJmW-TaRvMGhaX4_",
    "surface_id": "-OgfoJmW-TaRvMGhaX4_",
    "coverage_rule_id": "rule_interior_new_wall",
    "cover_m2_per_L": 2,
    "coats": 2,
    "wastage_pct": 0.08,
    "litres_needed": 7.5,
    "suggestion": "Sử dụng sơn lót trước khi sơn phủ",
    "create_at": "2025-12-18T10:00:00.000Z",
    "updated_at": "2025-12-18T10:00:00.000Z"
  }
}
```

#### Example:
```javascript
const newSession = {
  surface_id: "-OgfoJmW-TaRvMGhaX4_",
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: 7.5,
  suggestion: "Sử dụng sơn lót"
};

const result = await api.storeCalcSession(newSession);

if (result.success) {
  console.log("Created session ID:", result.data.id);
}
```

---

### 4. PUT - Cập nhật toàn bộ phiên tính toán

**Endpoint:** `PUT /calc_sessions/:id`

**Method:** `updateCalcSession(id, data)`

#### Request Body:
```json
{
  "surface_id": "-OgfoJmW-TaRvMGhaX4_",
  "coverage_rule_id": "rule_interior_new_wall",
  "cover_m2_per_L": 2.5,
  "coats": 3,
  "wastage_pct": 0.10,
  "litres_needed": 11.25,
  "suggestion": "Cập nhật: Sử dụng 3 lớp sơn"
}
```

#### Example:
```javascript
const updatedData = {
  ...existingData,
  coats: 3,
  litres_needed: 11.25
};

const result = await api.updateCalcSession(sessionId, updatedData);
```

---

### 5. PATCH - Cập nhật một phần

**Endpoint:** `PATCH /calc_sessions/:id`

**Method:** `patchCalcSession(id, data)`

#### Request Body:
```json
{
  "coats": 3,
  "litres_needed": 11.25
}
```

#### Example:
```javascript
const result = await api.patchCalcSession(sessionId, {
  coats: 3,
  litres_needed: 11.25
});
```

---

### 6. DELETE - Xóa phiên tính toán

**Endpoint:** `DELETE /calc_sessions/:id`

**Method:** `deleteCalcSession(id, soft = false)`

#### Parameters:
- `id`: Session ID
- `soft`: `true` = soft delete (archive), `false` = hard delete

#### Example:
```javascript
// Soft delete (archive)
const result = await api.deleteCalcSession(sessionId, true);

// Hard delete
const result = await api.deleteCalcSession(sessionId, false);
```

---

## 🚀 Advanced Features

### 7. Bulk Delete

**Method:** `bulkDelete(ids, soft = false)`

#### Example:
```javascript
const ids = ["id1", "id2", "id3"];
const result = await api.bulkDelete(ids, true); // Soft delete

console.log(`Success: ${result.data.success.length}`);
console.log(`Failed: ${result.data.failed.length}`);
```

---

### 8. Compare Sessions

**Method:** `compareSessions(id1, id2)`

#### Response:
```json
{
  "success": true,
  "data": {
    "session1": { ... },
    "session2": { ... },
    "differences": {
      "coats": {
        "session1": 2,
        "session2": 3
      },
      "litres_needed": {
        "session1": 7.5,
        "session2": 11.25
      }
    },
    "summary": {
      "litres_diff": 3.75,
      "litres_diff_pct": 50,
      "wastage_diff": 0.02,
      "coverage_diff": 0
    }
  }
}
```

#### Example:
```javascript
const result = await api.compareSessions(sessionId1, sessionId2);

if (result.success) {
  console.log("Differences:", result.data.differences);
  console.log("Litres difference:", result.data.summary.litres_diff);
}
```

---

### 9. Export Sessions

**Method:** `exportSessions(options)`

#### Parameters:
```javascript
{
  format: "csv",        // "csv" hoặc "json"
  surface_id: "..."     // Optional: filter by surface
}
```

#### Response (CSV):
```json
{
  "success": true,
  "data": "ID,Surface ID,Coverage Rule ID,...\n\"id1\",\"surf1\",...",
  "format": "csv",
  "filename": "calc_sessions_export_1702900000000.csv"
}
```

#### Example:
```javascript
// Export to CSV
const csvResult = await api.exportSessions({ format: "csv" });

if (csvResult.success) {
  // Download file
  const blob = new Blob([csvResult.data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = csvResult.filename;
  a.click();
}

// Export to JSON
const jsonResult = await api.exportSessions({ format: "json" });
```

---

### 10. Import Sessions

**Method:** `importSessions(data, validate = true)`

#### Example:
```javascript
const importData = [
  {
    surface_id: "-OgfoJmW-TaRvMGhaX4_",
    coverage_rule_id: "rule_interior_new_wall",
    cover_m2_per_L: 2,
    coats: 2,
    wastage_pct: 0.08,
    litres_needed: 7.5
  },
  // ... more sessions
];

const result = await api.importSessions(importData);

console.log(`Imported: ${result.data.success.length}`);
console.log(`Failed: ${result.data.failed.length}`);
```

---

### 11. Snapshot & Restore

#### Create Snapshot
**Method:** `createSnapshot(id, note)`

```javascript
const result = await api.createSnapshot(
  sessionId,
  "Snapshot before major changes"
);

const snapshotId = result.data.snapshot_id;
```

#### Get Snapshot History
**Method:** `getSnapshotHistory(calcSessionId)`

```javascript
const history = await api.getSnapshotHistory(sessionId);

console.log("Snapshots:", history.data);
```

#### Restore from Snapshot
**Method:** `restoreFromSnapshot(snapshotId)`

```javascript
const result = await api.restoreFromSnapshot(snapshotId);

if (result.success) {
  console.log("Restored successfully");
}
```

---

### 12. Calculate Litres Needed

**Static Method:** `CalcSessionAPI.calculateLitresNeeded(params)`

#### Parameters:
```javascript
{
  area_m2: 50,
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "base_litres": 50.00,
    "litres_needed": 54.00,
    "wastage_litres": 4.00
  }
}
```

#### Example:
```javascript
const result = CalcSessionAPI.calculateLitresNeeded({
  area_m2: 50,
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08
});

console.log("Litres needed:", result.data.litres_needed);
```

---

## ✅ Validation

### Validation Class: `CalcSessionValidate`

#### Validate Create/Update
```javascript
import { CalcSessionValidate } from './validate/CalcSessionValidate.js';

const validator = new CalcSessionValidate();

// Validate create
const errors = validator.checkValidate(data, 'create');

if (errors.length === 0) {
  console.log("Data is valid");
} else {
  console.log("Validation errors:", errors);
}
```

#### Validate Bulk Data
```javascript
const bulkResult = validator.validateBulk(arrayOfData, 'create');

console.log(`Valid: ${bulkResult.valid}`);
console.log(`Invalid: ${bulkResult.invalid}`);
```

#### Validation Rules

| Trường | Rules |
|--------|-------|
| `surface_id` | Required, non-empty string |
| `coverage_rule_id` | Required, non-empty string |
| `cover_m2_per_L` | Required, number > 0, ≤ 100 |
| `coats` | Required, integer ≥ 1, ≤ 10 |
| `wastage_pct` | Required, number ≥ 0, ≤ 1.0 |
| `litres_needed` | Required, number > 0, ≤ 10000 |
| `suggestion` | Optional, string, ≤ 1000 characters |

#### Error Codes
- `REQUIRED_FIELD` - Trường bắt buộc bị thiếu
- `INVALID_TYPE` - Kiểu dữ liệu không đúng
- `INVALID_RANGE` - Giá trị ngoài phạm vi cho phép
- `INVALID_LENGTH` - Độ dài vượt quá giới hạn
- `INVALID_FORMAT` - Định dạng không đúng
- `CALCULATION_MISMATCH` - Tính toán không khớp
- `INVALID_DATE` - Ngày tháng không hợp lệ

---

## 🔐 Security & Business Logic

### Role-Based Access Control
```javascript
// Admin: Có thể thực hiện tất cả operations
// Manager: Chỉ có thể thao tác với dữ liệu của mình
// User: Chỉ đọc và tạo mới

// Implement trong middleware
function checkPermission(user, action, resource) {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && resource.owner_id === user.id) return true;
  if (user.role === 'user' && ['read', 'create'].includes(action)) return true;
  return false;
}
```

### Validation on Foreign Keys
```javascript
// Kiểm tra surface_id tồn tại trước khi tạo
async function validateSurfaceExists(surface_id) {
  const surfaceAPI = new SurfacesAPI();
  const surface = await surfaceAPI.getOneSurface(surface_id);
  return surface !== null;
}
```

### Audit Log
```javascript
// Lưu audit log cho mọi thay đổi
const auditLog = {
  user_id: currentUser.id,
  action: 'create',
  resource: 'calc_session',
  resource_id: sessionId,
  timestamp: new Date().toISOString(),
  changes: { ... }
};
```

---

## 📊 Database Schema

### Firebase Realtime Database Structure
```
calc_sessions/
  ├── -OgfoJmW-TaRvMGhaX4_/
  │   ├── surface_id: "-OgfoJmW-TaRvMGhaX4_"
  │   ├── coverage_rule_id: "rule_interior_new_wall"
  │   ├── cover_m2_per_L: 2
  │   ├── coats: 2
  │   ├── wastage_pct: 0.08
  │   ├── litres_needed: 7.5
  │   ├── suggestion: "..."
  │   ├── create_at: "2025-12-18T10:00:00.000Z"
  │   ├── updated_at: "2025-12-18T10:30:00.000Z"
  │   └── status: "active"
  └── ...

calc_session_snapshots/
  ├── -SnapshotId1/
  │   ├── calc_session_id: "-OgfoJmW-TaRvMGhaX4_"
  │   ├── snapshot_data: { ... }
  │   ├── note: "..."
  │   └── created_at: "2025-12-18T10:00:00.000Z"
  └── ...
```

### SQL Migration (for reference)
```sql
CREATE TABLE calc_sessions (
  id VARCHAR(255) PRIMARY KEY,
  surface_id VARCHAR(255) NOT NULL,
  coverage_rule_id VARCHAR(255) NOT NULL,
  cover_m2_per_L DECIMAL(10, 2) NOT NULL CHECK (cover_m2_per_L > 0 AND cover_m2_per_L <= 100),
  coats INT NOT NULL CHECK (coats >= 1 AND coats <= 10),
  wastage_pct DECIMAL(5, 4) NOT NULL CHECK (wastage_pct >= 0 AND wastage_pct <= 1),
  litres_needed DECIMAL(10, 2) NOT NULL CHECK (litres_needed > 0 AND litres_needed <= 10000),
  suggestion TEXT,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  FOREIGN KEY (surface_id) REFERENCES surfaces(id) ON DELETE CASCADE,
  INDEX idx_surface_id (surface_id),
  INDEX idx_coverage_rule_id (coverage_rule_id),
  INDEX idx_status (status)
);

CREATE TABLE calc_session_snapshots (
  id VARCHAR(255) PRIMARY KEY,
  calc_session_id VARCHAR(255) NOT NULL,
  snapshot_data JSON NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (calc_session_id) REFERENCES calc_sessions(id) ON DELETE CASCADE,
  INDEX idx_calc_session_id (calc_session_id)
);
```

---

## 🧪 Testing

### Run Tests

1. Mở file `test-calc-session.html` trong trình duyệt
2. Mở Developer Console (F12)
3. Chạy tests:

```javascript
// Run all tests
runAllTests();

// Or run individual tests
testValidation();
testCreate();
testGetAll();
testUpdate();
testDelete();
testCompareSessions();
testExportImport();
testSnapshotRestore();
```

### Test Checklist
- ✅ CRUD Operations (Create, Read, Update, Delete)
- ✅ Validation (All fields, edge cases)
- ✅ Pagination & Filtering
- ✅ Search functionality
- ✅ Bulk operations
- ✅ Compare sessions
- ✅ Export/Import (CSV, JSON)
- ✅ Snapshot & Restore
- ✅ Calculation logic
- ✅ Error handling
- ✅ Performance testing

---

## 📝 Example Use Cases

### Use Case 1: Tính toán lượng sơn cho một phòng

```javascript
// Step 1: Calculate litres needed
const params = {
  area_m2: 50,
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08
};

const calculation = CalcSessionAPI.calculateLitresNeeded(params);
const litresNeeded = calculation.data.litres_needed;

// Step 2: Create calc session
const session = await api.storeCalcSession({
  surface_id: surfaceId,
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: litresNeeded,
  suggestion: "Sơn nội thất, tường mới"
});
```

### Use Case 2: So sánh 2 phương án sơn

```javascript
// Create two different calculation scenarios
const scenario1 = await api.storeCalcSession({
  surface_id: surfaceId,
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: 54.0,
  suggestion: "Phương án 1: 2 lớp sơn"
});

const scenario2 = await api.storeCalcSession({
  surface_id: surfaceId,
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 3,
  wastage_pct: 0.10,
  litres_needed: 82.5,
  suggestion: "Phương án 2: 3 lớp sơn"
});

// Compare
const comparison = await api.compareSessions(
  scenario1.data.id,
  scenario2.data.id
);

console.log("Chênh lệch sơn:", comparison.data.summary.litres_diff, "lít");
console.log("Chênh lệch %:", comparison.data.summary.litres_diff_pct, "%");
```

### Use Case 3: Xuất báo giá PDF/CSV

```javascript
// Get all sessions for a project's surfaces
const sessions = await api.getAllCalcSessions({
  surface_id: surfaceId,
  limit: 1000
});

// Export to CSV for quotation
const csvExport = await api.exportSessions({
  format: "csv",
  surface_id: surfaceId
});

// Download CSV
const blob = new Blob([csvExport.data], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `quotation_${new Date().getTime()}.csv`;
link.click();
```

### Use Case 4: Version Control

```javascript
// Create snapshot before making changes
const snapshot = await api.createSnapshot(
  sessionId,
  "Trước khi thay đổi số lớp sơn"
);

// Make changes
await api.patchCalcSession(sessionId, {
  coats: 3,
  litres_needed: 81.0
});

// If need to rollback
await api.restoreFromSnapshot(snapshot.data.snapshot_id);
```

---

## 🔄 Integration with Other Modules

### With Surfaces API
```javascript
// Get surface details and create calc session
const surface = await surfacesAPI.getOneSurface(surfaceId);

const calcSession = await calcSessionAPI.storeCalcSession({
  surface_id: surfaceId,
  coverage_rule_id: getCoverageRuleForSurface(surface.type),
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: calculateForSurface(surface.area_m2)
});
```

### With Projects API
```javascript
// Get all calc sessions for all surfaces in a project
const project = await projectsAPI.getOneProject(projectId);
const rooms = await roomsAPI.getAllRooms({ project_id: projectId });

const allSessions = [];
for (const room of rooms.data) {
  const surfaces = await surfacesAPI.getAllSurfaces({ room_id: room.id });
  
  for (const surface of surfaces.data) {
    const sessions = await calcSessionAPI.getAllCalcSessions({
      surface_id: surface.id
    });
    allSessions.push(...sessions.data);
  }
}

// Calculate total paint needed for project
const totalLitres = allSessions.reduce(
  (sum, session) => sum + session.litres_needed,
  0
);
```

---

## 🐛 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Errors

| HTTP Code | Error | Description |
|-----------|-------|-------------|
| 400 | Bad Request | Invalid data or validation errors |
| 404 | Not Found | Session not found |
| 500 | Internal Server Error | Server/database error |

### Error Handling Example
```javascript
try {
  const result = await api.storeCalcSession(data);
  
  if (!result.success) {
    console.error("Error:", result.error);
    // Handle error
    return;
  }
  
  // Success
  console.log("Session created:", result.data);
  
} catch (error) {
  console.error("Exception:", error);
  // Handle exception
}
```

---

## 📞 Support & Contact

- **Documentation:** See README files in `docs/` folder
- **Issues:** Report bugs and feature requests
- **API Version:** 1.0.0
- **Last Updated:** December 18, 2025

---

## 📄 License

This API documentation is part of the Paint Calculation System project.
