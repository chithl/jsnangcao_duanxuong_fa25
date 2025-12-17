# Color Palettes API - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COLOR PALETTES API                          │
│                          Architecture                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   React/Vue  │  │   Demo Page  │  │  Test Suite  │            │
│  │  Components  │  │     (HTML)   │  │     (JS)     │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                      │
│         └─────────────────┴─────────────────┘                      │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              ColorPalettesAPI (Main Class)                     │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  CRUD Operations:                                             │ │
│  │  • storePalette()      • list()                               │ │
│  │  • getOnePalette()     • updatePalette()                      │ │
│  │  • deletePalette()                                            │ │
│  │                                                               │ │
│  │  Bulk Operations:                                             │ │
│  │  • bulk() - update_status/delete/upsert                       │ │
│  │  • import() - batch create                                    │ │
│  │  • export() - batch export                                    │ │
│  │                                                               │ │
│  │  Colors Management:                                           │ │
│  │  • bulkColors() - add/remove/replace                          │ │
│  │  • getColors() - get palette colors                           │ │
│  │                                                               │ │
│  │  Additional:                                                  │ │
│  │  • reorder() - sort palettes                                  │ │
│  │  • getActivePalettes() - filter active                        │ │
│  │  • isNameUnique() - check uniqueness                          │ │
│  │                                                               │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                          │
│                          │ uses                                     │
│                          ▼                                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           ColorPaletteValidate (Validation)                   │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  • checkValidate() - single item                              │ │
│  │  • checkBulkValidate() - multiple items                       │ │
│  │  • checkReorderValidate() - reorder items                     │ │
│  │                                                               │ │
│  │  Validates:                                                   │ │
│  │  ✓ Required fields (name, is_active)                          │ │
│  │  ✓ Optional fields (notes, order, colors)                     │ │
│  │  ✓ Field types and formats                                    │ │
│  │  ✗ Extra fields (rejects)                                     │ │
│  │  ✗ Missing required (rejects)                                 │ │
│  │                                                               │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │ extends
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BASE API LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    BaseAPI (Core CRUD)                        │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  • getAll()   - GET all records                               │ │
│  │  • getOne()   - GET single record                             │ │
│  │  • store()    - POST create record                            │ │
│  │  • update()   - PUT update record                             │ │
│  │  • delete()   - DELETE record                                 │ │
│  │                                                               │ │
│  │  Uses axios for HTTP requests                                 │ │
│  │  Handles Firebase Realtime Database                           │ │
│  │                                                               │ │
│  └───────────────────────┬───────────────────────────────────────┘ │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │ HTTP (axios)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │            Firebase Realtime Database                         │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  /colorpalettes/                                              │ │
│  │    ├─ {id}/                                                   │ │
│  │    │   ├─ name: "Dark Neutral"                                │ │
│  │    │   ├─ notes: ""                                           │ │
│  │    │   ├─ is_active: "TRUE"                                   │ │
│  │    │   ├─ order: 0                                            │ │
│  │    │   ├─ colors: []                                          │ │
│  │    │   ├─ created_at: "2025-12-17T..."                        │ │
│  │    │   └─ updated_at: "2025-12-17T..."                        │ │
│  │    │                                                           │ │
│  │    └─ {id2}/...                                               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────┘

CREATE FLOW:
────────────
Client (Form)
    │
    ├─► Validate Input (ColorPaletteValidate)
    │       │
    │       ├─✗ Invalid → Return errors
    │       │
    │       └─✓ Valid
    │
    ├─► Check Unique Name (isNameUnique)
    │       │
    │       ├─✗ Duplicate → Return error
    │       │
    │       └─✓ Unique
    │
    ├─► Normalize Data (add timestamps)
    │
    ├─► Store to Firebase (BaseAPI.store)
    │
    └─► Return Success + ID


LIST FLOW:
──────────
Client (Request with filters)
    │
    ├─► Get All from Firebase (BaseAPI.getAll)
    │
    ├─► Normalize Data (map to array)
    │
    ├─► Apply Filters (search, is_active, name)
    │
    ├─► Sort Data (sortBy, sortDir)
    │
    ├─► Paginate (page, limit)
    │
    └─► Return {data, pagination}


UPDATE FLOW:
────────────
Client (ID + partial data)
    │
    ├─► Get Existing (BaseAPI.getOne)
    │       │
    │       └─✗ Not Found → Return error
    │
    ├─► Validate Input (ColorPaletteValidate, isUpdate=true)
    │       │
    │       └─✗ Invalid → Return errors
    │
    ├─► Check Unique Name (if name changed)
    │       │
    │       └─✗ Duplicate → Return error
    │
    ├─► Merge Old + New Data
    │
    ├─► Update Timestamp
    │
    ├─► Update Firebase (BaseAPI.update)
    │
    └─► Return Success


BULK FLOW:
──────────
Client (action + ids + data)
    │
    ├─► Validate Payload
    │
    ├─► Loop through IDs:
    │   │
    │   ├─► For each ID:
    │   │   │
    │   │   ├─► If action = "delete"
    │   │   │       └─► Delete (soft/hard)
    │   │   │
    │   │   ├─► If action = "update_status"
    │   │   │       └─► Update is_active
    │   │   │
    │   │   └─► If action = "upsert"
    │   │           └─► Update existing
    │   │
    │   └─► Collect results
    │
    └─► Return {results, summary}


┌─────────────────────────────────────────────────────────────────────┐
│                      VALIDATION FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

Input Data
    │
    ▼
┌───────────────────────┐
│ Check Extra Fields    │ ──✗─► Error: "Trường không hợp lệ: xxx"
└───────────┬───────────┘
            │ ✓
            ▼
┌───────────────────────┐
│ Check Required Fields │ ──✗─► Error: "Thiếu trường bắt buộc: xxx"
│ • name                │
│ • is_active           │
└───────────┬───────────┘
            │ ✓
            ▼
┌───────────────────────┐
│ Validate Field Types  │ ──✗─► Error: "xxx phải là yyy"
│ • name: string        │
│ • notes: string       │
│ • is_active: enum     │
│ • order: number       │
│ • colors: array       │
└───────────┬───────────┘
            │ ✓
            ▼
┌───────────────────────┐
│ Validate Field Ranges │ ──✗─► Error: "xxx không được vượt quá yyy"
│ • name: max 255       │
│ • notes: max 1000     │
│ • order: >= 0         │
└───────────┬───────────┘
            │ ✓
            ▼
        ✅ Valid


┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

API Method Call
    │
    ├─► try {
    │       │
    │       ├─► Validation
    │       │   └─✗ Error → {success: false, error: "VALIDATION_ERROR", errors: [...]}
    │       │
    │       ├─► Business Logic
    │       │   └─✗ Error → {success: false, error: "BUSINESS_ERROR", message: "..."}
    │       │
    │       ├─► Database Operation
    │       │   └─✗ Error → caught by catch block
    │       │
    │       └─✓ Success → {success: true, data: {...}}
    │
    └─► } catch (error) {
            │
            └─► {success: false, error: "OPERATION_ERROR", message: error.message}
        }


┌─────────────────────────────────────────────────────────────────────┐
│                    TESTING ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────┘

Test Suite (ColorPalettesAPI.test.js)
    │
    ├─► Test 1: Validation
    │   ├─ Missing required fields
    │   ├─ Extra fields
    │   ├─ Invalid formats
    │   └─ Valid data
    │
    ├─► Test 2: CRUD Operations
    │   ├─ Create
    │   ├─ Read (one & list)
    │   ├─ Update
    │   └─ Delete (soft & hard)
    │
    ├─► Test 3: Search & Filter
    │   ├─ Search by name
    │   ├─ Filter by is_active
    │   └─ Sort by fields
    │
    ├─► Test 4: Bulk Operations
    │   ├─ Bulk update status
    │   └─ Bulk delete
    │
    ├─► Test 5: Import/Export
    │   ├─ Import array
    │   └─ Export with filters
    │
    ├─► Test 6: Reorder
    │   └─ Update order values
    │
    ├─► Test 7: Colors Management
    │   ├─ Add colors
    │   ├─ Remove colors
    │   └─ Replace colors
    │
    └─► Test 8: Edge Cases
        ├─ Duplicate names
        ├─ Not found errors
        └─ Invalid operations


┌─────────────────────────────────────────────────────────────────────┐
│                    FILE DEPENDENCIES                                │
└─────────────────────────────────────────────────────────────────────┘

ColorPalettesAPI.js
    │
    ├─► imports BaseAPI.js
    │   └─► uses axios
    │
    └─► imports ColorPaletteValidate.js
        └─► extends ValidateAPI.js

Test files
    │
    └─► import ColorPalettesAPI.js

Demo page
    │
    ├─► imports ColorPalettesAPI.js (module)
    │
    └─► imports test suite (optional)


┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSE FORMATS                                 │
└─────────────────────────────────────────────────────────────────────┘

SUCCESS Response:
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}

ERROR Response (Validation):
{
    "success": false,
    "error": "VALIDATION_ERROR",
    "errors": [
        {
            "field": "name",
            "message": "Error message"
        }
    ]
}

ERROR Response (Business):
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Error description"
}

LIST Response:
{
    "success": true,
    "data": [ ... ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    }
}

BULK Response:
{
    "success": true,
    "data": [ ... ],
    "summary": {
        "total": 10,
        "success": 8,
        "error": 2
    }
}
