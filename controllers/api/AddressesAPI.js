import { BaseAPI } from "./BaseAPI.js";
import { AddressesValidate } from "./validate/AddressesValidate.js";

export class AddressesAPI extends BaseAPI {
	constructor(params, data) {
		const endpoint = "addresses";
		super(endpoint, params, data);
		this.addressValidate = new AddressesValidate();
	}

	mapRecords(raw) {
		if (!raw) return [];
		if (Array.isArray(raw)) {
			return raw
				.filter(item => item)
				.map((item, index) => ({
					id: item.id ?? index,
					...item
				}));
		}

		return Object.keys(raw).map(id => ({ id, ...raw[id] }));
	}

	toBoolean(value) {
		if (typeof value === "boolean") return value;
		if (typeof value === "string") {
			const normalized = value.trim().toLowerCase();
			if (["true", "1", "yes", "y"].includes(normalized)) return true;
			if (["false", "0", "no", "n"].includes(normalized)) return false;
		}
		if (typeof value === "number") return value === 1;
		return false;
	}

	normalizePayload(data, isNew = false) {
		const payload = {
			id: data.id,
			user_id: data.user_id ? String(data.user_id).trim() : data.user_id,
			receiver_name: data.receiver_name ? data.receiver_name.trim() : data.receiver_name,
			phone: data.phone ? String(data.phone).trim() : data.phone,
			line1: data.line1 ? data.line1.trim() : data.line1,
			ward: data.ward ? data.ward.trim() : data.ward,
			city: data.city ? data.city.trim() : data.city,
			note: data.note ? data.note.trim() : "",
			is_default: data.is_default !== undefined ? this.toBoolean(data.is_default) : false,
			create_at: data.create_at || (isNew ? new Date().toLocaleString("vi-VN") : data.create_at)
		};

		return payload;
	}

	async unsetDefaultForUser(userId, exceptId = null) {
		if (!userId) return;
		const addresses = await this.getAddressesByUser(userId);
		const tasks = addresses
			.filter(addr => addr.is_default && addr.id !== exceptId)
			.map(addr => this.update(addr.id, { ...addr, is_default: false }));

		await Promise.all(tasks);
	}

	async getAllAddresses() {
		const resp = await this.getAll();
		return this.mapRecords(resp.data);
	}

	async getAddressById(id) {
		if (!id) return null;
		const resp = await this.getOne(id);
		if (!resp || !resp.data) return null;
		return { id, ...resp.data };
	}

	async getAddressesByUser(userId) {
		if (!userId) return [];
		const all = await this.getAllAddresses();
		return all.filter(addr => addr.user_id === userId);
	}

	async createAddress(data) {
		const normalized = this.normalizePayload(data, true);
		const { isValid, errors } = this.addressValidate.checkValidate(normalized, true);
		if (!isValid) {
			return { success: false, errors };
		}

		if (normalized.is_default) {
			await this.unsetDefaultForUser(normalized.user_id);
		}

		const resp = await this.store(normalized);
		const newId = resp?.data?.name;

		if (newId) {
			const payloadWithId = { ...normalized, id: newId };
			await this.update(newId, payloadWithId);
			return { success: true, data: payloadWithId };
		}

		return { success: true, data: normalized };
	}

	async updateAddress(id, data) {
		if (!id) {
			return { success: false, errors: [{ field: "id", message: "ID địa chỉ là bắt buộc" }] };
		}

		const existing = await this.getAddressById(id);
		if (!existing) {
			return { success: false, errors: [{ message: "Không tìm thấy địa chỉ" }] };
		}

		const merged = { ...existing, ...data, id };
		const normalized = this.normalizePayload(merged, false);
		const { isValid, errors } = this.addressValidate.checkValidate(normalized, false);
		if (!isValid) {
			return { success: false, errors };
		}

		if (normalized.is_default) {
			await this.unsetDefaultForUser(normalized.user_id, id);
		}

		await this.update(id, normalized);
		return { success: true, data: normalized };
	}

	async deleteAddress(id) {
		if (!id) {
			return { success: false, errors: [{ field: "id", message: "ID địa chỉ là bắt buộc" }] };
		}

		await this.delete(id);
		return { success: true };
	}

	async setDefaultAddress(userId, addressId) {
		if (!userId || !addressId) {
			return { success: false, errors: [{ message: "User ID và Address ID là bắt buộc" }] };
		}

		const target = await this.getAddressById(addressId);
		if (!target || target.user_id !== userId) {
			return { success: false, errors: [{ message: "Địa chỉ không tồn tại hoặc không thuộc user" }] };
		}

		await this.unsetDefaultForUser(userId, addressId);
		const updated = { ...target, is_default: true };
		await this.update(addressId, updated);

		return { success: true, data: updated };
	}
}
