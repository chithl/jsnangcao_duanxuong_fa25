# Calculation Session API - Quick Start Guide

## 🚀 Hướng dẫn nhanh

Hướng dẫn này giúp bạn bắt đầu sử dụng Calculation Session API trong vòng 5 phút.

---

## 📦 Cài đặt

### 1. Include các file cần thiết

```html
<!-- Include Axios (để gọi API) -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<!-- Include API files -->
<script type="module">
  import { CalcSessionAPI } from './controllers/api/CalcSessionAPI.js';
  import { CalcSessionValidate } from './controllers/api/validate/CalcSessionValidate.js';
</script>
```

### 2. Khởi tạo API

```javascript
import { CalcSessionAPI } from './controllers/api/CalcSessionAPI.js';
import { CalcSessionValidate } from './controllers/api/validate/CalcSessionValidate.js';

// Khởi tạo
const calcAPI = new CalcSessionAPI();
const validator = new CalcSessionValidate();
```

---

## 💡 Các ví dụ cơ bản

### 1. Tạo phiên tính toán mới

```javascript
// Dữ liệu phiên tính toán
const newSession = {
  surface_id: "-OgfoJmW-TaRvMGhaX4_",
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: 7.5,
  suggestion: "Sử dụng sơn lót trước khi sơn phủ"
};

// Validate trước khi gửi
const errors = validator.checkValidate(newSession, 'create');

if (errors.length === 0) {
  // Tạo mới
  const result = await calcAPI.storeCalcSession(newSession);
  
  if (result.success) {
    console.log("✅ Tạo thành công! ID:", result.data.id);
  } else {
    console.error("❌ Lỗi:", result.error);
  }
} else {
  console.error("❌ Validation errors:", errors);
}
```

### 2. Lấy danh sách phiên tính toán

```javascript
// Lấy tất cả (có phân trang)
const result = await calcAPI.getAllCalcSessions({
  page: 1,
  limit: 10
});

if (result.success) {
  console.log("📋 Tổng số:", result.pagination.total);
  console.log("📄 Dữ liệu:", result.data);
}
```

### 3. Lấy chi tiết một phiên

```javascript
const sessionId = "-OgfoJmW-TaRvMGhaX4_";
const result = await calcAPI.getOneCalcSession(sessionId);

if (result.success) {
  console.log("📖 Chi tiết:", result.data);
}
```

### 4. Cập nhật phiên tính toán

```javascript
// Cập nhật một phần (PATCH)
const result = await calcAPI.patchCalcSession(sessionId, {
  coats: 3,
  litres_needed: 11.25
});

if (result.success) {
  console.log("✅ Cập nhật thành công!");
}
```

### 5. Tính toán lượng sơn cần thiết

```javascript
// Tính toán
const calculation = CalcSessionAPI.calculateLitresNeeded({
  area_m2: 50,        // Diện tích 50m²
  cover_m2_per_L: 2,  // Độ phủ 2m²/lít
  coats: 2,           // 2 lớp sơn
  wastage_pct: 0.08   // 8% hao hụt
});

if (calculation.success) {
  console.log("🧮 Kết quả:");
  console.log("- Sơn cơ bản:", calculation.data.base_litres, "lít");
  console.log("- Sơn hao hụt:", calculation.data.wastage_litres, "lít");
  console.log("- Tổng cần:", calculation.data.litres_needed, "lít");
}

// Output:
// 🧮 Kết quả:
// - Sơn cơ bản: 50.00 lít
// - Sơn hao hụt: 4.00 lít
// - Tổng cần: 54.00 lít
```

---

## 🔍 Lọc và Tìm kiếm

### Lọc theo surface_id

```javascript
const result = await calcAPI.getAllCalcSessions({
  surface_id: "-OgfoJmW-TaRvMGhaX4_"
});
```

### Tìm kiếm

```javascript
const result = await calcAPI.getAllCalcSessions({
  search: "sơn lót"  // Tìm trong trường suggestion
});
```

### Sắp xếp

```javascript
const result = await calcAPI.getAllCalcSessions({
  sortBy: "create_at",
  sortOrder: "desc"  // Mới nhất trước
});
```

---

## 🔄 So sánh phiên tính toán

```javascript
const comparison = await calcAPI.compareSessions(sessionId1, sessionId2);

if (comparison.success) {
  const diff = comparison.data.summary;
  
  console.log("🔄 So sánh:");
  console.log("- Chênh lệch sơn:", diff.litres_diff, "lít");
  console.log("- Chênh lệch %:", diff.litres_diff_pct.toFixed(2), "%");
  console.log("- Khác biệt:", comparison.data.differences);
}
```

---

## 📤 Xuất dữ liệu

### Xuất CSV

```javascript
const csvResult = await calcAPI.exportSessions({ 
  format: "csv" 
});

if (csvResult.success) {
  // Tải file CSV
  const blob = new Blob([csvResult.data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvResult.filename;
  link.click();
  
  console.log("📥 Đã tải file:", csvResult.filename);
}
```

### Xuất JSON

```javascript
const jsonResult = await calcAPI.exportSessions({ 
  format: "json" 
});
```

---

## 📥 Nhập dữ liệu

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
  // Thêm các phiên khác...
];

const result = await calcAPI.importSessions(importData);

console.log(`📥 Import: ${result.data.success.length} thành công`);
console.log(`❌ Lỗi: ${result.data.failed.length}`);
```

---

## 📸 Snapshot & Restore

### Tạo snapshot

```javascript
const snapshot = await calcAPI.createSnapshot(
  sessionId,
  "Trước khi thay đổi"
);

console.log("📸 Snapshot ID:", snapshot.data.snapshot_id);
```

### Khôi phục

```javascript
const result = await calcAPI.restoreFromSnapshot(snapshotId);

if (result.success) {
  console.log("⏮️ Đã khôi phục thành công!");
}
```

### Xem lịch sử

```javascript
const history = await calcAPI.getSnapshotHistory(sessionId);

console.log("📜 Lịch sử snapshots:", history.data.length);
history.data.forEach((snapshot, index) => {
  console.log(`${index + 1}. ${snapshot.note} - ${snapshot.created_at}`);
});
```

---

## 🗑️ Xóa phiên tính toán

### Soft delete (Archive)

```javascript
const result = await calcAPI.deleteCalcSession(sessionId, true);

if (result.success) {
  console.log("📦 Đã archive phiên tính toán");
}
```

### Hard delete

```javascript
const result = await calcAPI.deleteCalcSession(sessionId, false);

if (result.success) {
  console.log("🗑️ Đã xóa vĩnh viễn");
}
```

### Bulk delete

```javascript
const ids = ["id1", "id2", "id3"];
const result = await calcAPI.bulkDelete(ids, true);

console.log(`✅ Xóa thành công: ${result.data.success.length}`);
console.log(`❌ Thất bại: ${result.data.failed.length}`);
```

---

## ✅ Validation

### Validate dữ liệu

```javascript
const data = {
  surface_id: "",  // Lỗi: không được để trống
  coats: 0,        // Lỗi: phải >= 1
  // ...
};

const errors = validator.checkValidate(data, 'create');

if (errors.length > 0) {
  errors.forEach(error => {
    console.error(`❌ ${error.field}: ${error.message}`);
  });
}
```

### Validate bulk

```javascript
const bulkData = [data1, data2, data3];
const result = validator.validateBulk(bulkData, 'create');

console.log(`✅ Hợp lệ: ${result.valid}`);
console.log(`❌ Không hợp lệ: ${result.invalid}`);
```

---

## 📝 Workflow hoàn chỉnh

### Ví dụ: Tạo phương án sơn cho một phòng

```javascript
// Bước 1: Tính toán lượng sơn
const calculation = CalcSessionAPI.calculateLitresNeeded({
  area_m2: 50,
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08
});

const litresNeeded = calculation.data.litres_needed;

// Bước 2: Tạo phiên tính toán
const sessionData = {
  surface_id: surfaceId,
  coverage_rule_id: "rule_interior_new_wall",
  cover_m2_per_L: 2,
  coats: 2,
  wastage_pct: 0.08,
  litres_needed: litresNeeded,
  suggestion: `Cần ${litresNeeded}L sơn cho 50m² tường`
};

// Bước 3: Validate
const errors = validator.checkValidate(sessionData, 'create');

if (errors.length === 0) {
  // Bước 4: Lưu vào database
  const result = await calcAPI.storeCalcSession(sessionData);
  
  if (result.success) {
    // Bước 5: Tạo snapshot (backup)
    await calcAPI.createSnapshot(
      result.data.id,
      "Phương án ban đầu"
    );
    
    console.log("✅ Hoàn thành! Session ID:", result.data.id);
    console.log("🎨 Cần:", litresNeeded, "lít sơn");
  }
}
```

---

## 🧪 Chạy Tests

### Mở file test trong trình duyệt

```
1. Mở file: test-calc-session.html
2. Nhấn F12 (Developer Tools)
3. Chạy: runAllTests()
```

### Hoặc test từng phần

```javascript
// Trong console
testCreate();
testGetAll();
testUpdate();
testDelete();
testCompareSessions();
testExportImport();
```

---

## 🔗 Tích hợp với các module khác

### Với Surfaces API

```javascript
import { SurfacesAPI } from './controllers/api/SurfacesAPI.js';

const surfacesAPI = new SurfacesAPI();

// Lấy thông tin surface
const surface = await surfacesAPI.getOneSurface(surfaceId);

// Tạo calc session cho surface
const calcSession = await calcAPI.storeCalcSession({
  surface_id: surfaceId,
  coverage_rule_id: getCoverageRule(surface.type),
  // ... other fields
});
```

### Với Projects & Rooms

```javascript
// Tính tổng sơn cho toàn bộ project
async function calculateProjectTotal(projectId) {
  const rooms = await roomsAPI.getAllRooms({ project_id: projectId });
  let totalLitres = 0;
  
  for (const room of rooms.data) {
    const surfaces = await surfacesAPI.getAllSurfaces({ room_id: room.id });
    
    for (const surface of surfaces.data) {
      const sessions = await calcAPI.getAllCalcSessions({ 
        surface_id: surface.id 
      });
      
      totalLitres += sessions.data.reduce(
        (sum, s) => sum + s.litres_needed, 
        0
      );
    }
  }
  
  return totalLitres;
}
```

---

## 🐛 Xử lý lỗi

```javascript
try {
  const result = await calcAPI.storeCalcSession(data);
  
  if (!result.success) {
    // Xử lý lỗi API
    console.error("API Error:", result.error);
    alert("Không thể tạo phiên tính toán: " + result.error);
    return;
  }
  
  // Thành công
  console.log("Success:", result.data);
  
} catch (error) {
  // Xử lý exception
  console.error("Exception:", error);
  alert("Lỗi hệ thống: " + error.message);
}
```

---

## 📚 Tài liệu đầy đủ

Xem thêm chi tiết tại:
- [CALC_SESSION_API.md](./CALC_SESSION_API.md) - API documentation đầy đủ
- [test-calc-session.html](../test-calc-session.html) - File test tương tác

---

## 💡 Tips & Best Practices

### 1. Luôn validate trước khi gửi API

```javascript
const errors = validator.checkValidate(data, 'create');
if (errors.length > 0) {
  // Hiển thị lỗi cho user
  return;
}
// Gửi API
```

### 2. Sử dụng try-catch cho async operations

```javascript
try {
  const result = await calcAPI.storeCalcSession(data);
  // Handle result
} catch (error) {
  // Handle error
}
```

### 3. Kiểm tra success flag

```javascript
const result = await calcAPI.getOneCalcSession(id);

if (result.success) {
  // Use result.data
} else {
  // Handle error: result.error
}
```

### 4. Sử dụng pagination cho danh sách lớn

```javascript
const result = await calcAPI.getAllCalcSessions({
  page: 1,
  limit: 20  // Không load quá nhiều một lúc
});
```

### 5. Tạo snapshot trước khi thay đổi quan trọng

```javascript
await calcAPI.createSnapshot(sessionId, "Before major update");
await calcAPI.updateCalcSession(sessionId, newData);
```

---

## ❓ FAQ

**Q: Làm sao tính wastage_pct?**

A: wastage_pct là tỷ lệ thập phân (0.0-1.0). Ví dụ: 0.08 = 8%, 0.10 = 10%

**Q: Làm sao biết coverage_rule_id nào phù hợp?**

A: Tùy vào loại bề mặt:
- Tường nội thất mới: `rule_interior_new_wall`
- Tường ngoại thất: `rule_exterior_wall`
- Tường đã sơn: `rule_repaint_wall`

**Q: Soft delete khác gì hard delete?**

A: 
- Soft delete: Chỉ đánh dấu status="deleted", có thể restore
- Hard delete: Xóa vĩnh viễn khỏi database

**Q: Có thể import từ Excel không?**

A: Có, convert Excel -> CSV hoặc JSON, sau đó dùng `importSessions()`

---

## 🎯 Next Steps

1. ✅ Đọc hết Quick Start này
2. 📖 Xem [CALC_SESSION_API.md](./CALC_SESSION_API.md) cho chi tiết
3. 🧪 Chạy file [test-calc-session.html](../test-calc-session.html)
4. 💻 Tích hợp vào project của bạn
5. 🚀 Deploy và sử dụng!

---

**Happy Coding! 🎨**
