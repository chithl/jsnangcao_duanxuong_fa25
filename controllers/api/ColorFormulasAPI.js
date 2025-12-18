import { BaseAPI } from "./BaseAPI.js";
import { FormulaComponentsAPI } from "./FormulaComponentsAPI.js";
import { ColorantsAPI } from "./ColorantsAPI.js";

/**
 * ColorFormulasAPI - Quản lý công thức pha màu
 * Fields:
 * - palette_id
 * - code
 * - name
 * - base
 * - tolerance
 * - is_active
 */
export class ColorFormulasAPI extends BaseAPI {
    constructor(params, data) {
        super('color_formulas', params, data);
    }

    normalize(snapshot) {
        if (!snapshot) return [];
        return Object.entries(snapshot).map(([id, item]) => ({ id, ...item }));
    }

    async list(query = {}) {
        const resp = await this.getAll();
        let rows = this.normalize(resp.data);

        const { search, palette_id, code, base, is_active } = query;

        if (search) {
            const term = search.toLowerCase();
            rows = rows.filter(r =>
                (r.name || '').toLowerCase().includes(term) ||
                (r.code || '').toLowerCase().includes(term)
            );
        }

        if (palette_id) rows = rows.filter(r => r.palette_id === palette_id);
        if (code) rows = rows.filter(r => r.code === code);
        if (base) rows = rows.filter(r => r.base === base);
        if (is_active !== undefined) rows = rows.filter(r => r.is_active === is_active);

        return { success: true, data: rows };
    }

    async getOneFormula(id) {
        const resp = await this.getOne(id);
        return { success: true, data: { id, ...(resp.data || {}) } };
    }

    async isCodeUnique(code, ignoreId) {
        const resp = await this.getAll();
        const rows = this.normalize(resp.data);
        return !rows.some(r => r.code === code && r.id !== ignoreId);
    }

    async storeFormula(payload) {
        if (!payload?.code || !payload?.name) {
            return { success: false, error: 'MISSING_FIELDS' };
        }

        const unique = await this.isCodeUnique(payload.code);
        if (!unique) return { success: false, error: 'DUPLICATE_CODE' };

        const resp = await this.store({
            ...payload,
            is_active: payload.is_active ?? true
        });

        return {
            success: true,
            data: { id: resp.data.name, ...payload }
        };
    }

    async updateFormula(id, payload) {
        if (payload.code) {
            const unique = await this.isCodeUnique(payload.code, id);
            if (!unique) return { success: false, error: 'DUPLICATE_CODE' };
        }

        await this.update(id, payload);
        return { success: true, data: { id, ...payload } };
    }

    async deleteFormula(id) {
        await this.delete(id);
        return { success: true };
    }

    /**
     * Mô phỏng pha màu + tính chi phí
     * @param {object} params
     * @param {string} params.formula_id
     * @param {number} params.litres
     */
    async simulateMix({ formula_id, litres, code , basePrice }) {
        if (!formula_id || !litres) {
            return { success: false, error: 'MISSING_PARAMS' };
        }

        // 1. Lấy công thức
        const formulaRes = await this.getOneFormula(formula_id);
        if (!formulaRes.data) {
            return { success: false, error: 'FORMULA_NOT_FOUND' };
        }

        // 2. Lấy danh sách thành phần
        const componentsAPI = new FormulaComponentsAPI();
        const compRes = await componentsAPI.listByFormula(formula_id);
        const components = compRes.data || [];

        // 3. API colorants
        const colorantsAPI = new ColorantsAPI();

        let totalCost = 0;
        const details = [];

        for (const comp of components) {
            const colorantRes = await colorantsAPI.getOneColorant(comp.colorant_id);
            const colorant = colorantRes.data;

            if (!colorant) continue;

            const ml_needed = comp.ml_per_L * litres;
            const cost = ml_needed * (colorant.price_per_ml || 0);

            totalCost += cost;

            details.push({
                colorant_id: comp.colorant_id,
                colorant_name: colorant.name,
                ml_per_L: comp.ml_per_L,
                ml_needed,
                price_per_ml: colorant.price_per_ml,
                cost
            });
        }

        return {
            success: true,
            data: {
                formula: formulaRes.data,
                litres,
                components: details,
                totalCost
            }
        };
    }

}
