import { BaseAPI } from "./BaseAPI.js";
import { ColorPaletteValidate } from "./validate/ColorPaletteValidate.js";

/**
 * ColorPalettesAPI - API quản lý bảng màu (Color Palettes)
 * 
 * Cấu trúc dữ liệu:
 * - name: tên bảng màu (string, bắt buộc)
 * - notes: ghi chú (string, không bắt buộc)
 * - is_active: trạng thái (TRUE/FALSE, bắt buộc)
 * 
 * Endpoints:
 * - GET /api/colorpalettes (list/filter/search/pagination)
 * - GET /api/colorpalettes/:id (chi tiết)
 * - POST /api/colorpalettes (tạo mới)
 * - PUT /api/colorpalettes/:id (cập nhật)
 * - DELETE /api/colorpalettes/:id (xóa/ẩn)
 * - POST /api/colorpalettes/import (import danh sách)
 * - GET /api/colorpalettes/export (export danh sách)
 * - POST /api/colorpalettes/bulk (bulk update/delete/upsert)
 */
export class ColorPalettesAPI extends BaseAPI {
    constructor(params, data) {
        super('color_palettes', params, data);
        this.validator = new ColorPaletteValidate();
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
     * Lấy danh sách bảng màu + filter/search/pagination client side
     * 
     * @param {object} query - Query parameters
     * @param {number} query.page - Trang hiện tại
     * @param {number} query.limit - Số bản ghi mỗi trang
     * @param {string} query.search - Từ khóa tìm kiếm (name, notes)
     * @param {string} query.is_active - Lọc theo trạng thái (TRUE/FALSE)
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
            const { search, is_active, name, sortBy = 'name', sortDir = 'asc' } = query;
            
            if (search) {
                const term = search.toLowerCase();
                rows = rows.filter(r => 
                    (r.name || '').toLowerCase().includes(term) || 
                    (r.notes || '').toLowerCase().includes(term)
                );
            }
            
            if (is_active !== undefined) {
                const activeValue = is_active === 'TRUE' || is_active === true || is_active === 'true';
                rows = rows.filter(r => {
                    const itemActive = r.is_active === 'TRUE' || r.is_active === true || r.is_active === 'true';
                    return itemActive === activeValue;
                });
            }
            
            if (name) {
                rows = rows.filter(r => r.name === name);
            }

            // Sorting
            rows = rows.sort((a, b) => {
                const dir = sortDir === 'desc' ? -1 : 1;
                
                // Sorting (string)
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
     * Lấy chi tiết một bảng màu theo ID
     * @param {string} id - ID của bảng màu
     * @returns {Promise<object>} {success, data}
     */
    async getOnePalette(id) {
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
     * Kiểm tra tên bảng màu có bị trùng không
     * @param {string} name - Tên cần kiểm tra
     * @param {string} ignoreId - ID cần bỏ qua (khi update)
     * @returns {Promise<boolean>} true nếu tên duy nhất
     */
    async isNameUnique(name, ignoreId = null) {
        try {
            const resp = await this.getAll();
            const rows = this.normalize(resp.data);
            return !rows.some(r => r.name === name && r.id !== ignoreId);
        } catch (error) {
            return false;
        }
    }

    /**
     * Tạo mới bảng màu
     * @param {object} payload - Dữ liệu bảng màu
     * @returns {Promise<object>} {success, data, error}
     */
    async storePalette(payload) {
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

            // Kiểm tra tên trùng
            const unique = await this.isNameUnique(payload.name);
            if (!unique) {
                return {
                    success: false,
                    error: 'DUPLICATE_NAME',
                    message: 'Tên bảng màu đã tồn tại'
                };
            }

            // Chuẩn hóa dữ liệu
            const normalizedPayload = {
                name: payload.name.trim(),
                notes: payload.notes || '',
                is_active: String(payload.is_active) === 'TRUE' || payload.is_active === true ? 'TRUE' : 'FALSE'
            };

            // Lưu vào Firebase
            const resp = await this.store(normalizedPayload);
            const id = resp.data?.name;

            return {
                success: true,
                data: { id, ...normalizedPayload },
                message: 'Tạo bảng màu thành công'
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
     * Cập nhật bảng màu theo ID
     * @param {string} id - ID của bảng màu
     * @param {object} payload - Dữ liệu cần cập nhật
     * @returns {Promise<object>} {success, data, error}
     */
    async updatePalette(id, payload) {
        try {
            if (!id) {
                return { success: false, error: 'MISSING_ID' };
            }

            // Kiểm tra bảng màu có tồn tại không
            const existing = await this.getOnePalette(id);
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

            // Kiểm tra tên trùng (nếu có update name)
            if (payload.name) {
                const unique = await this.isNameUnique(payload.name, id);
                if (!unique) {
                    return {
                        success: false,
                        error: 'DUPLICATE_NAME',
                        message: 'Tên bảng màu đã tồn tại'
                    };
                }
            }

            // Merge dữ liệu cũ và mới
            const updatedData = { ...existing.data };
            
            if (payload.name !== undefined) {
                updatedData.name = payload.name.trim();
            }
            if (payload.notes !== undefined) {
                updatedData.notes = payload.notes;
            }
            if (payload.is_active !== undefined) {
                updatedData.is_active = String(payload.is_active) === 'TRUE' || payload.is_active === true ? 'TRUE' : 'FALSE';
            }
            
            delete updatedData.id; // Xóa id khỏi payload trước khi update

            // Cập nhật vào Firebase
            await this.update(id, updatedData);

            return {
                success: true,
                data: { id, ...updatedData },
                message: 'Cập nhật bảng màu thành công'
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
     * Xóa/ẩn bảng màu (soft delete)
     * @param {string} id - ID của bảng màu
     * @param {boolean} softDelete - true: ẩn (set is_active=FALSE), false: xóa hẳn
     * @returns {Promise<object>} {success, error}
     */
    async deletePalette(id, softDelete = true) {
        try {
            if (!id) {
                return { success: false, error: 'MISSING_ID' };
            }

            // Kiểm tra tồn tại
            const existing = await this.getOnePalette(id);
            if (!existing.success) {
                return { success: false, error: 'NOT_FOUND' };
            }

            if (softDelete) {
                // Soft delete: chỉ cập nhật is_active = FALSE
                const updatedData = {
                    ...existing.data,
                    is_active: 'FALSE'
                };
                delete updatedData.id;
                
                await this.update(id, updatedData);
                return {
                    success: true,
                    message: 'Đã ẩn bảng màu'
                };
            } else {
                // Hard delete: xóa hẳn khỏi database
                await this.delete(id);
                return {
                    success: true,
                    message: 'Đã xóa bảng màu'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'DELETE_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Bulk operations: update_status | delete | upsert
     * 
     * @param {object} params - Parameters
     * @param {string} params.action - Hành động: 'update_status' | 'delete' | 'upsert'
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
                        // Xóa (soft hoặc hard tùy data.hardDelete)
                        const deleteResult = await this.deletePalette(id, !data.hardDelete);
                        results.push({
                            id,
                            status: deleteResult.success ? 'deleted' : 'error',
                            error: deleteResult.success ? null : deleteResult.error
                        });
                        
                    } else if (action === 'update_status') {
                        // Cập nhật trạng thái
                        if (!data.is_active) {
                            results.push({
                                id,
                                status: 'error',
                                error: 'MISSING_STATUS'
                            });
                            continue;
                        }
                        
                        const updateResult = await this.updatePalette(id, {
                            is_active: data.is_active
                        });
                        
                        results.push({
                            id,
                            status: updateResult.success ? 'updated' : 'error',
                            error: updateResult.success ? null : updateResult.error
                        });
                        
                    } else if (action === 'upsert') {
                        // Cập nhật hoặc tạo mới
                        const existing = await this.getOnePalette(id);
                        
                        if (existing.success) {
                            // Update
                            const updateResult = await this.updatePalette(id, data);
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
     * Import danh sách bảng màu từ mảng
     * @param {array} list - Mảng các object bảng màu
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
                const res = await this.storePalette(item);
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
     * Export danh sách bảng màu (dựa trên filter)
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
     * Lấy danh sách active palettes (is_active = TRUE)
     * @param {object} query - Query parameters
     * @returns {Promise<object>} {success, data}
     */
    async getActivePalettes(query = {}) {
        return this.list({ ...query, is_active: 'TRUE' });
    }

    /**
     * Audit log - Lấy lịch sử thay đổi của palette
     * (Cần implement riêng nếu cần lưu audit log vào collection riêng)
     * @param {string} paletteId - ID của palette
     * @returns {Promise<object>} {success, data}
     */
    async getAuditLog(paletteId) {
        // TODO: Implement audit log system
        return {
            success: false,
            error: 'NOT_IMPLEMENTED',
            message: 'Chức năng audit log chưa được triển khai'
        };
    }
}
