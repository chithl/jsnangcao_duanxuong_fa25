import { BaseAPI } from "./BaseAPI.js";

export class OrderAPI extends BaseAPI {
    constructor() {
        super();
        this.endpoint = "orders";
    }

    /**
     * Get all orders
     */
    async getAllOrder() {
        try {
            const response = await fetch(`${this.baseURL}/${this.endpoint}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    }

    /**
     * Get order by id
     */
    async getOneOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}/${this.endpoint}/${id}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    }

    /**
     * Create new order
     */
    async storeOrder(data) {
        try {
            const response = await fetch(`${this.baseURL}/${this.endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    }

    /**
     * Update existing order
     */
    async updateOrder(id, data) {
        try {
            const response = await fetch(`${this.baseURL}/${this.endpoint}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }

    /**
     * Delete order
     */
    async deleteOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}/${this.endpoint}/${id}`, {
                method: "DELETE"
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting order:", error);
            throw error;
        }
    }
}
