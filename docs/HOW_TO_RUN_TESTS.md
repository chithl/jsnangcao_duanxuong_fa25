# How to Run Calc Session Tests

## ✅ Cách Nhanh Nhất - Dùng Ngay Với Live Server!

**File:** `test-calc-session-standalone.html` 

### 🎯 Cách sử dụng (Cực kỳ đơn giản):

1. **Mở VS Code**
2. **Cài extension "Live Server"** (nếu chưa có)
3. **Click phải vào file `test-calc-session-standalone.html`**
4. **Chọn "Open with Live Server"**
5. **Xong!** 🎉

Không cần cài Node.js, không cần Python, không cần gì cả!

---

## 🚀 Quick Start

### ⚡ Khuyên Dùng: Standalone Version (test-calc-session-standalone.html)

**Đơn giản nhất, chạy ngay!**

1. Mở VS Code
2. Click phải vào `test-calc-session-standalone.html`
3. Chọn "Open with Live Server"
4. Xong! ✅

### Option 1: Python (Nếu bạn không dùng VS Code)

```bash
# Navigate to project folder
cd d:\Xuong\jsnangcao_duanxuong_fa25

# Start web server
python -m http.server 8000

# Open in browser
# http://localhost:8000/test-calc-session-standalone.html
```

### Option 2: Module Version (test-calc-session.html)

**Chú ý:** File này dùng ES6 modules, cần web server:

1. Install "Live Server" extension in VS Code
2. Right-click on `test-calc-session.html`
3. Select "Open with Live Server"

### Option 3: Node.js http-server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Run in project folder
http-server -p 8000

# Open: http://localhost:8000/test-calc-session.html
```

### Option 4: PHP

```bash
php -S localhost:8000

# Open: http://localhost:8000/test-calc-session.html
```

## 🧪 Running Tests

Once the server is running and you open the page:

1. **Press F12** to open Developer Console
2. **Click buttons** on the page to run tests
3. **Or type in console:**
   ```javascript
   runAllTests()
   testCreate()
   testGetAll()
   // etc.
   ```

## 📝 Available Test Commands

```javascript
runAllTests()           // Run complete test suite
testValidation()        // Validation tests
testCreate()            // Create operation test
testGetOne()            // Get single item test
testGetAll()            // List operations test
testUpdate()            // Update operation test
testPatch()             // Patch operation test
testDelete()            // Delete operations test
testCalculation()       // Calculation utility test
testCompareSessions()   // Compare feature test
testExportImport()      // Export/import test
testSnapshotRestore()   // Versioning test
testBulkOperations()    // Bulk operations test
testErrorHandling()     // Error scenarios test
testPerformance()       // Performance metrics test
```

## ❌ Common Errors

### Error: "testDelete is not defined"
**Cause:** File opened directly (file:// protocol)  
**Solution:** Use a web server (see options above)

### Error: "Failed to load module"
**Cause:** Files not in correct location or CORS issues  
**Solution:** 
- Make sure all files are in the correct folders
- Run from a web server (not file://)
- Check browser console for specific error

### Error: "Cannot find module"
**Cause:** Incorrect file paths  
**Solution:** 
- Ensure folder structure is correct:
  ```
  jsnangcao_duanxuong_fa25/
  ├── test-calc-session.html
  └── controllers/
      ├── api/
      │   ├── BaseAPI.js
      │   ├── CalcSessionAPI.js
      │   └── validate/
      │       ├── validate.js
      │       └── CalcSessionValidate.js
      └── test-calc-session.js
  ```

## 🌐 Browser Requirements

- Modern browser with ES6 module support:
  - ✅ Chrome/Edge 61+
  - ✅ Firefox 60+
  - ✅ Safari 11+
  - ✅ Opera 48+

## 🔍 Troubleshooting

1. **Open browser console** (F12)
2. **Check for error messages**
3. **Verify URL starts with http:// or https://**
4. **Ensure all files are present**
5. **Try a different browser**

## 💡 Pro Tips

- Use VS Code Live Server for automatic reload
- Keep console open to see detailed logs
- Run tests one by one to debug issues
- Check Network tab if API calls fail

## 📚 More Information

- **Full API Docs:** `docs/CALC_SESSION_API.md`
- **Quick Start:** `docs/CALC_SESSION_QUICKSTART.md`
- **Summary:** `docs/README_CALC_SESSION.md`
