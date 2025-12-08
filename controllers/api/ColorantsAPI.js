import { BaseAPI } from "./BaseAPI.js";


/**
 * ColorantsAPI extends BaseAPI để tái dùng CRUD, trỏ tới Firebase.
 */
export class ColorantsAPI extends BaseAPI {
    constructor(params, data) {
        super('colorants', params, data);
    }

    /**
     * Chuyển map {id:{...}} về mảng [{id,...}]
     */
    normalize(snapshot) {
        if (!snapshot) return [];
        return Object.entries(snapshot).map(([id, item]) => ({ id, ...item }));
    }

    /**
     * Lấy danh sách + filter/search/pagination client side.
     * @param {object} query {page,limit,search,base,status,code,lowStockThreshold,sortBy,sortDir}
     */
    async list(query = {}) {
        const resp = await this.getAll();
        let rows = this.normalize(resp.data);

        const { search, base, status, name, lowStockThreshold, sortBy = 'name', sortDir = 'asc' } = query;
        if (search) {
            const term = search.toLowerCase();
            rows = rows.filter(r => (r.name || '').toLowerCase().includes(term) || (r.code || '').toLowerCase().includes(term));
        }
        if (base) rows = rows.filter(r => r.base === base);
        if (status) rows = rows.filter(r => r.status === status);
        if (name) rows = rows.filter(r => r.name === name);
        if (lowStockThreshold != null) rows = rows.filter(r => (r.quantity || 0) <= Number(lowStockThreshold));

        rows = rows.sort((a, b) => {
            const dir = sortDir === 'desc' ? -1 : 1;
            if (a[sortBy] === b[sortBy]) return 0;
            return a[sortBy] > b[sortBy] ? dir : -dir;
        });

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
    }

    /**
     * Lấy chi tiết colorant.
     */
    async getOneColorant(id) {
        const resp = await this.getOne(id);
        return { success: true, data: { id, ...(resp.data || {}) } };
    }

    /**
     * Kiểm tra trùng mã code.
     */
    async isNameUnique(name, ignoreId) {
        const resp = await this.getAll();
        const rows = this.normalize(resp.data);
        return !rows.some(r => r.name === name && r.id !== ignoreId);
    }

    /**
     * Tạo mới (Firebase trả về name là id).
     */
    async storeColorant(payload) {
        if (!payload || !payload.name) return { success: false, error: 'MISSING_NAME' };
        const unique = await this.isNameUnique(payload.name);
        if (!unique) return { success: false, error: 'DUPLICATE_NAME' };

        const resp = await this.store(payload);
        const id = resp.data?.name;
        return { success: true, data: { id, ...payload } };
    }

    /**
     * Cập nhật theo id.
     */
    async updateColorant(id, payload) {
        if (payload && payload.name) {
            const unique = await this.isNameUnique(payload.name, id);
            if (!unique) return { success: false, error: 'DUPLICATE_NAME' };
        }
        await this.update(id, payload);
        return { success: true, data: { id, ...payload } };
    }

    /**
     * Xóa/ẩn colorant (soft nếu cần).
     */
    async deleteColorant(id) {
        await this.delete(id);
        return { success: true };
    }

    /**
     * Bulk: action = update_status | delete | upsert
     */
    async bulk({ action, ids = [], data = {} }) {
        if (!action || !Array.isArray(ids)) return { success: false, error: 'INVALID_BULK_PAYLOAD' };
        const results = [];
        for (const id of ids) {
            if (action === 'delete') {
                await this.delete(id);
                results.push({ id, status: 'deleted' });
            } else if (action === 'update_status') {
                const current = await this.getOne(id);
                const next = { ...(current.data || {}), status: data.status };
                await this.update(id, next);
                results.push({ id, status: 'updated' });
            } else if (action === 'upsert') {
                await this.update(id, data);
                results.push({ id, status: 'upserted' });
            }
        }
        return { success: true, data: results };
    }

    /**
     * Import danh sách (mảng object)
     */
    async import(list = []) {
        if (!Array.isArray(list)) return { success: false, error: 'INVALID_IMPORT_PAYLOAD' };
        const created = [];
        for (const item of list) {
            const res = await this.storeColorant(item);
            created.push(res);
        }
        return { success: true, data: created };
    }

    /**
     * Export: tận dụng list để filter rồi trả về.
     */
    async export(query = {}) {
        const result = await this.list(query);
        return result;
    }

    /**
     * Cảnh báo tồn kho thấp.
     */
    async lowStock(threshold = 5) {
        return this.list({ lowStockThreshold: threshold });
    }
}
