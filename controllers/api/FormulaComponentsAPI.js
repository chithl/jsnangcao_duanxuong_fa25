import { BaseAPI } from "./BaseAPI.js";

/**
 * FormulaComponentsAPI - Thành phần pha màu
 * Fields:
 * - formula_id
 * - colorant_id
 * - ml_per_L
 */
export class FormulaComponentsAPI extends BaseAPI {
    constructor(params, data) {
        super('formula_components', params, data);
    }

    normalize(snapshot) {
        if (!snapshot) return [];
        return Object.entries(snapshot).map(([id, item]) => ({ id, ...item }));
    }

    async listByFormula(formula_id) {
        const resp = await this.getAll();
        const rows = this.normalize(resp.data);
        return {
            success: true,
            data: rows.filter(r => r.formula_id === formula_id)
        };
    }

    async storeComponent(payload) {
        if (!payload?.formula_id || !payload?.colorant_id) {
            return { success: false, error: 'MISSING_FIELDS' };
        }

        const resp = await this.store(payload);
        return {
            success: true,
            data: { id: resp.data.name, ...payload }
        };
    }

    async updateComponent(id, payload) {
        await this.update(id, payload);
        return { success: true };
    }

    async deleteComponent(id) {
        await this.delete(id);
        return { success: true };
    }
}
