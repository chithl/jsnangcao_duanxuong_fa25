# Color Palettes API - Quick Start Guide

## 📁 Files Created

### 1. Core API Files
- **`controllers/api/ColorPalettesAPI.js`** - Main API class with all methods
- **`controllers/api/validate/ColorPaletteValidate.js`** - Validation logic

### 2. Documentation
- **`docs/COLOR_PALETTES_API.md`** - Complete API documentation

### 3. Testing
- **`controllers/api/test/ColorPalettesAPI.test.js`** - Test suite
- **`views/admin/color-palettes-demo.html`** - Interactive demo page

---

## 🚀 Quick Start

### Basic Usage

```javascript
import { ColorPalettesAPI } from './controllers/api/ColorPalettesAPI.js';

const api = new ColorPalettesAPI();

// Create a palette
const result = await api.storePalette({
    name: "Dark Neutral",
    notes: "",
    is_active: "TRUE"
});

console.log(result.data.id); // New palette ID
```

---

## 📋 Data Structure

```javascript
{
    "name": "Dark Neutral",      // Required, unique, max 255 chars
    "notes": "Description",      // Optional, max 1000 chars
    "is_active": "TRUE|FALSE"    // Required
}
```

**Validation:**
- ✅ Only accepts fields: `name`, `notes`, `is_active`, `order`, `colors`
- ❌ Rejects extra fields
- ❌ Rejects missing required fields

---

## 🔧 API Methods

### CRUD Operations

```javascript
// 1. Create
await api.storePalette(data);

// 2. Read (list)
await api.list({ page: 1, limit: 10, search: "neutral" });

// 3. Read (one)
await api.getOnePalette(id);

// 4. Update
await api.updatePalette(id, { notes: "Updated" });

// 5. Delete (soft)
await api.deletePalette(id, true);

// 6. Delete (hard)
await api.deletePalette(id, false);
```

### Bulk Operations

```javascript
// Bulk update status
await api.bulk({
    action: "update_status",
    ids: ["id1", "id2"],
    data: { is_active: "FALSE" }
});

// Bulk delete
await api.bulk({
    action: "delete",
    ids: ["id1", "id2"],
    data: { hardDelete: false }
});
```

### Import/Export

```javascript
// Import
const importData = [
    { name: "Palette 1", notes: "", is_active: "TRUE" },
    { name: "Palette 2", notes: "", is_active: "TRUE" }
];
await api.import(importData);

// Export
const exportResult = await api.export({ is_active: "TRUE" });
```

### Colors Management

```javascript
// Add colors
await api.bulkColors("palette-id", {
    action: "add",
    colorIds: ["color-1", "color-2"]
});

// Remove colors
await api.bulkColors("palette-id", {
    action: "remove",
    colorIds: ["color-1"]
});

// Replace all colors
await api.bulkColors("palette-id", {
    action: "replace",
    colorIds: ["color-3", "color-4"]
});
```

### Reorder

```javascript
await api.reorder([
    { id: "id1", order: 0 },
    { id: "id2", order: 1 },
    { id: "id3", order: 2 }
]);
```

---

## 🧪 Testing

### Run Test Suite

```javascript
// In browser console
import { runAllTests } from './controllers/api/test/ColorPalettesAPI.test.js';
await runAllTests();
```

### Use Demo Page

1. Open `views/admin/color-palettes-demo.html` in browser
2. Use the interactive forms to test API
3. Check console (F12) for detailed logs

---

## ✅ Validation Examples

### ✅ Valid Data

```javascript
{
    "name": "Dark Neutral",
    "notes": "",
    "is_active": "TRUE"
}
// → Success
```

### ❌ Missing Required Field

```javascript
{
    "notes": "Test",
    "is_active": "TRUE"
}
// → Error: "Thiếu trường bắt buộc: name"
```

### ❌ Extra Fields

```javascript
{
    "name": "Test",
    "notes": "",
    "is_active": "TRUE",
    "extra_field": "invalid"
}
// → Error: "Trường không hợp lệ: extra_field"
```

### ❌ Invalid is_active

```javascript
{
    "name": "Test",
    "notes": "",
    "is_active": "INVALID"
}
// → Error: "Trạng thái is_active phải là TRUE hoặc FALSE"
```

---

## 📊 Response Format

### Success Response

```json
{
    "success": true,
    "data": {
        "id": "-O9aZ1bC2dE3fG4hI5jK",
        "name": "Dark Neutral",
        "notes": "",
        "is_active": "TRUE",
        "order": 0,
        "colors": [],
        "created_at": "2025-12-17T10:30:00.000Z",
        "updated_at": "2025-12-17T10:30:00.000Z"
    },
    "message": "Tạo bảng màu thành công"
}
```

### Error Response

```json
{
    "success": false,
    "error": "VALIDATION_ERROR",
    "errors": [
        {
            "field": "name",
            "message": "Tên bảng màu không được để trống"
        }
    ]
}
```

---

## 🔍 Search & Filter

```javascript
// Search by name or notes
await api.list({ search: "neutral" });

// Filter by status
await api.list({ is_active: "TRUE" });

// Pagination
await api.list({ page: 2, limit: 20 });

// Sort
await api.list({ sortBy: "name", sortDir: "desc" });

// Combined
await api.list({
    search: "neutral",
    is_active: "TRUE",
    page: 1,
    limit: 10,
    sortBy: "order",
    sortDir: "asc"
});
```

---

## 🎯 Common Use Cases

### 1. Create Multiple Palettes

```javascript
const palettes = [
    { name: "Dark Neutral", notes: "", is_active: "TRUE" },
    { name: "Light Pastel", notes: "", is_active: "TRUE" },
    { name: "Vibrant Colors", notes: "", is_active: "FALSE" }
];

const result = await api.import(palettes);
console.log(`Created ${result.summary.success}/${result.summary.total} palettes`);
```

### 2. Update Multiple Palettes

```javascript
// Get all inactive palettes
const inactive = await api.list({ is_active: "FALSE" });
const ids = inactive.data.map(p => p.id);

// Activate them all
await api.bulk({
    action: "update_status",
    ids: ids,
    data: { is_active: "TRUE" }
});
```

### 3. Manage Palette Colors

```javascript
const paletteId = "some-palette-id";

// Add colors
await api.bulkColors(paletteId, {
    action: "add",
    colorIds: ["color-1", "color-2", "color-3"]
});

// Check colors
const colors = await api.getColors(paletteId);
console.log(`Palette has ${colors.data.count} colors`);

// Remove one color
await api.bulkColors(paletteId, {
    action: "remove",
    colorIds: ["color-2"]
});
```

### 4. Export Data for Backup

```javascript
// Export all active palettes
const backup = await api.export({ is_active: "TRUE" });

// Save to file (browser)
const blob = new Blob([JSON.stringify(backup.data, null, 2)], {
    type: 'application/json'
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `palettes-backup-${Date.now()}.json`;
a.click();
```

---

## 🛡️ Error Handling

```javascript
try {
    const result = await api.storePalette(data);
    
    if (!result.success) {
        // Handle API error
        console.error('API Error:', result.error);
        
        if (result.errors) {
            // Validation errors
            result.errors.forEach(err => {
                console.error(`${err.field}: ${err.message}`);
            });
        }
        
        return;
    }
    
    // Success
    console.log('Created:', result.data);
    
} catch (error) {
    // Handle network/system error
    console.error('System Error:', error);
}
```

---

## 📝 Validation Class Usage

```javascript
import { ColorPaletteValidate } from './controllers/api/validate/ColorPaletteValidate.js';

const validator = new ColorPaletteValidate();

// Validate single item
const validation = validator.checkValidate(data);
if (!validation.isValid) {
    console.log('Errors:', validation.errors);
}

// Validate bulk items
const bulkValidation = validator.checkBulkValidate([data1, data2, data3]);
if (!bulkValidation.isValid) {
    console.log('Bulk errors:', bulkValidation.errors);
}

// Validate reorder
const reorderValidation = validator.checkReorderValidate([
    { id: "id1", order: 0 },
    { id: "id2", order: 1 }
]);
```

---

## 🔗 Integration with Frontend

### React Example

```jsx
import { ColorPalettesAPI } from '@/api/ColorPalettesAPI';
import { useState, useEffect } from 'react';

function PalettesList() {
    const [palettes, setPalettes] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = new ColorPalettesAPI();
    
    useEffect(() => {
        loadPalettes();
    }, []);
    
    const loadPalettes = async () => {
        setLoading(true);
        const result = await api.list({ is_active: "TRUE" });
        if (result.success) {
            setPalettes(result.data);
        }
        setLoading(false);
    };
    
    const handleCreate = async (data) => {
        const result = await api.storePalette(data);
        if (result.success) {
            loadPalettes(); // Reload list
        }
    };
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {palettes.map(palette => (
                <div key={palette.id}>{palette.name}</div>
            ))}
        </div>
    );
}
```

### Vue Example

```vue
<template>
    <div>
        <div v-for="palette in palettes" :key="palette.id">
            {{ palette.name }}
        </div>
    </div>
</template>

<script>
import { ColorPalettesAPI } from '@/api/ColorPalettesAPI';

export default {
    data() {
        return {
            palettes: [],
            api: new ColorPalettesAPI()
        };
    },
    mounted() {
        this.loadPalettes();
    },
    methods: {
        async loadPalettes() {
            const result = await this.api.list({ is_active: "TRUE" });
            if (result.success) {
                this.palettes = result.data;
            }
        }
    }
};
</script>
```

---

## 📚 Additional Resources

- **Full Documentation**: `docs/COLOR_PALETTES_API.md`
- **Test Suite**: `controllers/api/test/ColorPalettesAPI.test.js`
- **Demo Page**: `views/admin/color-palettes-demo.html`
- **Validation**: `controllers/api/validate/ColorPaletteValidate.js`

---

## 🐛 Troubleshooting

### Issue: "DUPLICATE_NAME" error
**Solution**: Each palette name must be unique. Check existing palettes first.

### Issue: "VALIDATION_ERROR" with extra fields
**Solution**: Remove any fields not in the allowed list: `name`, `notes`, `is_active`, `order`, `colors`

### Issue: "NOT_FOUND" error
**Solution**: Verify the palette ID exists using `getOnePalette(id)` first.

### Issue: Import fails silently
**Solution**: Check validation errors in the response. Each item must be valid.

---

## 🎓 Tips & Best Practices

1. **Always validate before submit**: Use `ColorPaletteValidate` class
2. **Handle errors gracefully**: Check `result.success` before accessing `result.data`
3. **Use soft delete by default**: Preserve data integrity
4. **Implement pagination**: Don't load all data at once
5. **Cache results**: Reduce API calls for frequently accessed data
6. **Batch operations**: Use bulk methods for multiple updates
7. **Test thoroughly**: Use the test suite and demo page

---

## 📞 Support

For issues or questions, check:
1. Full documentation in `docs/COLOR_PALETTES_API.md`
2. Test examples in `controllers/api/test/ColorPalettesAPI.test.js`
3. Interactive demo at `views/admin/color-palettes-demo.html`

---

**Created**: December 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
