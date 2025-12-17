import { BaseAPI } from "./BaseAPI.js";
import { ColorValidate } from "./validate/ColorValidate.js";

/**
 * ColorsAPI - API quản lý sản phẩm màu hoàn thiện (Colors)
 * 
 * Cấu trúc dữ liệu:
 * - base: loại base màu (string, bắt buộc)
 * - code: mã màu (string, bắt buộc, unique)
 * - hex: mã màu HEX (string, bắt buộc, format #RRGGBB)
 * - name: tên màu (string, bắt buộc)
 * - palette_id: ID bảng màu (string, bắt buộc)
 * 
 * Endpoints:
 * - GET /api/colors (list/filter/search/pagination)
 * - GET /api/colors/:id (chi tiết)
 * - POST /api/colors (tạo mới)
 * - PUT /api/colors/:id (cập nhật)
 * - DELETE /api/colors/:id (xóa)
 * - POST /api/colors/import (import danh sách)
 * - GET /api/colors/export (export danh sách)
 * - POST /api/colors/bulk (bulk update/delete)
 * - GET /api/colors/by-palette/:paletteId (lấy colors theo palette)
 */
export class ColorsAPI extends BaseAPI {
    constructor(params, data) {
        super('colors', params, data);
        this.validator = new ColorValidate();
    }

    /**
     * Chuyển map {id:{...}} về mảng [{id,...}]
     * @param {object} snapshot - Firebase snapshot
     * @returns {array} Mảng các object
     */
    normalize(snapshot) {
        if (!snapshot) return [];
        return Object.entries(snapshot).map(([id, item]) => ({ id, ...item }));
    }

    /**
     * Lấy danh sách colors + filter/search/pagination client side
     * 
     * @param {object} query - Query parameters
     * @param {number} query.page - Trang hiện tại
     * @param {number} query.limit - Số bản ghi mỗi trang
     * @param {string} query.search - Từ khóa tìm kiếm (name, code, hex, base)
     * @param {string} query.palette_id - Lọc theo palette_id
     * @param {string} query.base - Lọc theo base
     * @param {string} query.code - Lọc theo code chính xác
     * @param {string} query.name - Lọc theo tên chính xác
     * @param {string} query.sortBy - Trường sắp xếp (mặc định: name)
     * @param {string} query.sortDir - Hướng sắp xếp (asc/desc, mặc định: asc)
     * 
     * @returns {Promise<object>} {success, data, pagination}
     */
    async list(query = {}) {
        try {
            const resp = await this.getAll();
            let rows = this.normalize(resp.data);

            // Filtering
            const { search, palette_id, base, code, name, sortBy = 'name', sortDir = 'asc' } = query;
            
            if (search) {
                const term = search.toLowerCase();
                rows = rows.filter(r => 
                    (r.name || '').toLowerCase().includes(term) || 
                    (r.code || '').toLowerCase().includes(term) ||
                    (r.hex || '').toLowerCase().includes(term) ||
                    (r.base || '').toLowerCase().includes(term)
                );
            }
            
            if (palette_id) {
                rows = rows.filter(r => r.palette_id === palette_id);
            }
            
            if (base) {
                rows = rows.filter(r => r.base === base);
            }
            
            if (code) {
                rows = rows.filter(r => r.code === code);
            }
            
            if (name) {
                rows = rows.filter(r => r.name === name);
            }

            // Sorting
            rows = rows.sort((a, b) => {
                const dir = sortDir === 'desc' ? -1 : 1;
                
                const aVal = a[sortBy] || '';
                const bVal = b[sortBy] || '';
                if (aVal === bVal) return 0;
                return aVal > bVal ? dir : -dir;
            });

            // Pagination
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || rows.length || 1;
            const start = (page - 1) * limit;
            const paginated = rows.slice(start, start + limit);

            return {
                success: true,
                data: paginated,
                pagination: {
                    page,
                    limit,
                    total: rows.length,
                    totalPages: Math.ceil(rows.length / limit) || 1
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'LIST_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Lấy chi tiết một màu theo ID
     * @param {string} id - ID của màu
     * @returns {Promise<object>} {success, data}
     */
    async getOneColor(id) {
        try {
            if (!id) {
                return { success: false, error: 'MISSING_ID' };
            }
            
            const resp = await this.getOne(id);
            
            if (!resp.data) {
                return { success: false, error: 'NOT_FOUND' };
            }
            
            return { 
                success: true, 
                data: { id, ...(resp.data || {}) } 
            };
        } catch (error) {
            return {
                success: false,
                error: 'GET_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Lấy danh sách colors theo palette_id
     * @param {string} paletteId - ID của palette
     * @returns {Promise<object>} {success, data}
     */
    async getColorsByPalette(paletteId) {
        try {
            if (!paletteId) {
                return { success: false, error: 'MISSING_PALETTE_ID' };
            }
            
            return await this.list({ palette_id: paletteId, limit: 999999 });
        } catch (error) {
            return {
                success: false,
                error: 'GET_BY_PALETTE_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Kiểm tra mã màu (code) có bị trùng không
     * @param {string} code - Code cần kiểm tra
     * @param {string} ignoreId - ID cần bỏ qua (khi update)
     * @returns {Promise<boolean>} true nếu code duy nhất
     */
    async isCodeUnique(code, ignoreId = null) {
        try {
            const resp = await this.getAll();
            const rows = this.normalize(resp.data);
            return !rows.some(r => r.code === code && r.id !== ignoreId);
        } catch (error) {
            return false;
        }
    }

    /**
     * Tạo mới màu
     * @param {object} payload - Dữ liệu màu
     * @returns {Promise<object>} {success, data, error}
     */
    async storeColor(payload) {
        try {
            // Validate dữ liệu
            const validation = this.validator.checkValidate(payload, false);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    errors: validation.errors
                };
            }

            // Kiểm tra code trùng
            const unique = await this.isCodeUnique(payload.code);
            if (!unique) {
                return {
                    success: false,
                    error: 'DUPLICATE_CODE',
                    message: 'Mã màu đã tồn tại'
                };
            }

            // Chuẩn hóa dữ liệu
            const normalizedPayload = {
                base: payload.base.trim(),
                code: payload.code.trim(),
                hex: payload.hex.trim().toUpperCase(),
                name: payload.name.trim(),
                palette_id: payload.palette_id.trim()
            };

            // Lưu vào Firebase
            const resp = await this.store(normalizedPayload);
            const id = resp.data?.name;

            return {
                success: true,
                data: { id, ...normalizedPayload },
                message: 'Tạo màu thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: 'STORE_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Cập nhật màu theo ID
     * @param {string} id - ID của màu
     * @param {object} payload - Dữ liệu cần cập nhật
     * @returns {Promise<object>} {success, data, error}
     */
    async updateColor(id, payload) {
        try {
            if (!id) {
                return { success: false, error: 'MISSING_ID' };
            }

            // Kiểm tra màu có tồn tại không
            const existing = await this.getOneColor(id);
            if (!existing.success) {
                return { success: false, error: 'NOT_FOUND' };
            }

            // Validate dữ liệu (cho phép partial update)
            const validation = this.validator.checkValidate(payload, true);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    errors: validation.errors
                };
            }

            // Kiểm tra code trùng (nếu có update code)
            if (payload.code) {
                const unique = await this.isCodeUnique(payload.code, id);
                if (!unique) {
                    return {
                        success: false,
                        error: 'DUPLICATE_CODE',
                        message: 'Mã màu đã tồn tại'
                    };
                }
            }

            // Merge dữ liệu cũ và mới
            const updatedData = { ...existing.data };
            
            if (payload.base !== undefined) {
                updatedData.base = payload.base.trim();
            }
            if (payload.code !== undefined) {
                updatedData.code = payload.code.trim();
            }
            if (payload.hex !== undefined) {
                updatedData.hex = payload.hex.trim().toUpperCase();
            }
            if (payload.name !== undefined) {
                updatedData.name = payload.name.trim();
            }
            if (payload.palette_id !== undefined) {
                updatedData.palette_id = payload.palette_id.trim();
            }
            
            delete updatedData.id; // Xóa id khỏi payload trước khi update

            // Cập nhật vào Firebase
            await this.update(id, updatedData);

            return {
                success: true,
                data: { id, ...updatedData },
                message: 'Cập nhật màu thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: 'UPDATE_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Xóa màu
     * @param {string} id - ID của màu
     * @returns {Promise<object>} {success, error}
     */
    async deleteColor(id) {
        try {
            if (!id) {
                return { success: false, error: 'MISSING_ID' };
            }

            // Kiểm tra tồn tại
            const existing = await this.getOneColor(id);
            if (!existing.success) {
                return { success: false, error: 'NOT_FOUND' };
            }

            // Xóa khỏi database
            await this.delete(id);
            return {
                success: true,
                message: 'Đã xóa màu'
            };
        } catch (error) {
            return {
                success: false,
                error: 'DELETE_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Bulk operations: delete | upsert
     * 
     * @param {object} params - Parameters
     * @param {string} params.action - Hành động: 'delete' | 'upsert'
     * @param {array} params.ids - Danh sách ID cần xử lý
     * @param {object} params.data - Dữ liệu cho action (tùy action)
     * 
     * @returns {Promise<object>} {success, data: [{id, status, error}]}
     */
    async bulk({ action, ids = [], data = {} }) {
        try {
            if (!action || !Array.isArray(ids) || ids.length === 0) {
                return {
                    success: false,
                    error: 'INVALID_BULK_PAYLOAD',
                    message: 'action và ids là bắt buộc'
                };
            }

            const results = [];

            for (const id of ids) {
                try {
                    if (action === 'delete') {
                        // Xóa
                        const deleteResult = await this.deleteColor(id);
                        results.push({
                            id,
                            status: deleteResult.success ? 'deleted' : 'error',
                            error: deleteResult.success ? null : deleteResult.error
                        });
                        
                    } else if (action === 'upsert') {
                        // Cập nhật hoặc tạo mới
                        const existing = await this.getOneColor(id);
                        
                        if (existing.success) {
                            // Update
                            const updateResult = await this.updateColor(id, data);
                            results.push({
                                id,
                                status: updateResult.success ? 'updated' : 'error',
                                error: updateResult.success ? null : updateResult.error
                            });
                        } else {
                            // Insert (không thể với ID cụ thể trong Firebase)
                            results.push({
                                id,
                                status: 'error',
                                error: 'CANNOT_INSERT_WITH_ID'
                            });
                        }
                        
                    } else {
                        results.push({
                            id,
                            status: 'error',
                            error: 'INVALID_ACTION'
                        });
                    }
                } catch (error) {
                    results.push({
                        id,
                        status: 'error',
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.status !== 'error').length;
            const errorCount = results.filter(r => r.status === 'error').length;

            return {
                success: true,
                data: results,
                summary: {
                    total: ids.length,
                    success: successCount,
                    error: errorCount
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'BULK_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Import danh sách màu từ mảng
     * @param {array} list - Mảng các object màu
     * @returns {Promise<object>} {success, data: [{success, data/error}]}
     */
    async import(list = []) {
        try {
            if (!Array.isArray(list)) {
                return {
                    success: false,
                    error: 'INVALID_IMPORT_PAYLOAD',
                    message: 'Dữ liệu import phải là mảng'
                };
            }

            // Validate tất cả items trước
            const bulkValidation = this.validator.checkBulkValidate(list, false);
            if (!bulkValidation.isValid) {
                return {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    errors: bulkValidation.errors
                };
            }

            const results = [];
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const res = await this.storeColor(item);
                results.push({
                    index: i,
                    success: res.success,
                    data: res.data || null,
                    error: res.error || null
                });
            }

            const successCount = results.filter(r => r.success).length;
            const errorCount = results.filter(r => !r.success).length;

            return {
                success: true,
                data: results,
                summary: {
                    total: list.length,
                    success: successCount,
                    error: errorCount
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'IMPORT_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Export danh sách màu (dựa trên filter)
     * @param {object} query - Query parameters (giống list)
     * @returns {Promise<object>} {success, data}
     */
    async export(query = {}) {
        try {
            // Lấy tất cả dữ liệu (không phân trang)
            const exportQuery = { ...query, limit: 9999999 };
            const result = await this.list(exportQuery);
            
            if (!result.success) {
                return result;
            }

            return {
                success: true,
                data: result.data,
                count: result.data.length,
                exported_at: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'EXPORT_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Lấy danh sách base duy nhất
     * @returns {Promise<object>} {success, data: [bases]}
     */
    async getUniqueBases() {
        try {
            const resp = await this.getAll();
            const rows = this.normalize(resp.data);
            const bases = [...new Set(rows.map(r => r.base))].filter(Boolean).sort();
            
            return {
                success: true,
                data: bases
            };
        } catch (error) {
            return {
                success: false,
                error: 'GET_BASES_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Audit log - Lấy lịch sử thay đổi của color
     * (Cần implement riêng nếu cần lưu audit log vào collection riêng)
     * @param {string} colorId - ID của color
     * @returns {Promise<object>} {success, data}
     */
    async getAuditLog(colorId) {
        // TODO: Implement audit log system
        return {
            success: false,
            error: 'NOT_IMPLEMENTED',
            message: 'Chức năng audit log chưa được triển khai'
        };
    }
}
