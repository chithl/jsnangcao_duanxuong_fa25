import { BaseAPI } from "./BaseAPI.js";

/**
 * Lớp API cho quản lý phiên tính toán (Calculation Sessions)
 * Kế thừa từ BaseAPI để sử dụng các phương thức CRUD cơ bản
 * 
 * Calculation Session lưu thông tin tính toán sơn cho từng bề mặt:
 * - Liên kết với surface và coverage rule
 * - Tính toán lượng sơn cần thiết
 * - Quản lý phiên bản và lịch sử thay đổi
 * - Hỗ trợ so sánh và xuất báo cáo
 *
 * @extends BaseAPI
 */
export class CalcSessionAPI extends BaseAPI {
  /**
   * Khởi tạo CalcSessionAPI
   * @param {object} [params] - Tham số truy vấn mặc định
   * @param {object} [data] - Dữ liệu mặc định
   */
  constructor(params, data) {
    const endpoint = "calc_sessions";
    super(endpoint, params, data);
  }

  /**
   * Lấy tất cả phiên tính toán với hỗ trợ filter, search, pagination
   * @param {object} options - Tùy chọn query
   * @param {number} [options.page=1] - Số trang hiện tại
   * @param {number} [options.limit=20] - Số bản ghi mỗi trang
   * @param {string} [options.surface_id] - Lọc theo surface_id
   * @param {string} [options.coverage_rule_id] - Lọc theo coverage_rule_id
   * @param {string} [options.search] - Từ khóa tìm kiếm
   * @param {string} [options.sortBy='create_at'] - Trường sắp xếp
   * @param {string} [options.sortOrder='desc'] - Thứ tự sắp xếp (asc/desc)
   * @returns {Promise<object>} Object chứa data, pagination info
   */
  async getAllCalcSessions(options = {}) {
    try {
      const resp = await this.getAll();
      const allData = resp.data;

      if (!allData || typeof allData !== "object") {
        return {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: options.limit || 20,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Convert object to array with ids
      let sessions = Object.keys(allData).map((id) => ({
        id,
        ...allData[id],
      }));

      // Filter by surface_id
      if (options.surface_id) {
        sessions = sessions.filter(
          (session) => session.surface_id === options.surface_id
        );
      }

      // Filter by coverage_rule_id
      if (options.coverage_rule_id) {
        sessions = sessions.filter(
          (session) => session.coverage_rule_id === options.coverage_rule_id
        );
      }

      // Search functionality (search in suggestion)
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        sessions = sessions.filter(
          (session) =>
            (session.suggestion &&
              session.suggestion.toLowerCase().includes(searchLower)) ||
            (session.coverage_rule_id &&
              session.coverage_rule_id.toLowerCase().includes(searchLower))
        );
      }

      // Sorting
      const sortBy = options.sortBy || "create_at";
      const sortOrder = options.sortOrder || "desc";
      sessions.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      // Pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const total = sessions.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = sessions.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch calculation sessions",
      };
    }
  }

  /**
   * Lấy thông tin một phiên tính toán theo ID
   * @param {string|number} id - ID của phiên tính toán cần lấy
   * @returns {Promise<object>} Object response với success, data hoặc error
   */
  async getOneCalcSession(id) {
    try {
      const resp = await this.getOne(id);
      
      if (resp.data === null || resp.data === undefined) {
        return {
          success: false,
          error: "Calculation session not found",
        };
      }

      return {
        success: true,
        data: { id, ...resp.data },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch calculation session",
      };
    }
  }

  /**
   * Tạo mới một phiên tính toán
   * @param {object} data - Dữ liệu phiên tính toán cần tạo
   * @param {string} data.surface_id - ID bề mặt (required)
   * @param {string} data.coverage_rule_id - ID quy tắc phủ (required)
   * @param {number} data.cover_m2_per_L - Độ phủ m2/L (required)
   * @param {number} data.coats - Số lớp sơn (required)
   * @param {number} data.wastage_pct - Tỷ lệ hao hụt (required)
   * @param {number} data.litres_needed - Số lít cần thiết (required)
   * @param {string} [data.suggestion] - Gợi ý (optional)
   * @returns {Promise<object>} Object response với success, data hoặc error
   */
  async storeCalcSession(data) {
    try {
      // Add timestamp
      const sessionData = {
        ...data,
        create_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const resp = await this.store(sessionData);

      return {
        success: true,
        data: {
          id: resp.data.name, // Firebase returns {name: "generated_id"}
          ...sessionData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create calculation session",
      };
    }
  }

  /**
   * Cập nhật thông tin phiên tính toán theo ID
   * @param {string|number} id - ID của phiên tính toán cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object>} Object response với success, data hoặc error
   */
  async updateCalcSession(id, data) {
    try {
      // Get existing data to preserve fields
      const existing = await this.getOne(id);
      
      if (!existing.data) {
        return {
          success: false,
          error: "Calculation session not found",
        };
      }

      const updatedData = {
        ...existing.data,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const resp = await this.update(id, updatedData);

      return {
        success: true,
        data: { id, ...resp.data },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update calculation session",
      };
    }
  }

  /**
   * Cập nhật một phần thông tin phiên tính toán (PATCH)
   * @param {string|number} id - ID của phiên tính toán
   * @param {object} data - Dữ liệu cập nhật (chỉ các trường cần thay đổi)
   * @returns {Promise<object>} Object response
   */
  async patchCalcSession(id, data) {
    try {
      const existing = await this.getOne(id);
      
      if (!existing.data) {
        return {
          success: false,
          error: "Calculation session not found",
        };
      }

      const patchData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const resp = await this.patch(id, patchData);

      return {
        success: true,
        data: { id, ...existing.data, ...patchData },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to patch calculation session",
      };
    }
  }

  /**
   * Xóa phiên tính toán theo ID (có thể soft delete)
   * @param {string|number} id - ID của phiên tính toán cần xóa
   * @param {boolean} [soft=false] - Soft delete (chỉ đánh dấu) hoặc hard delete
   * @returns {Promise<object>} Object response
   */
  async deleteCalcSession(id, soft = false) {
    try {
      if (soft) {
        // Soft delete: chỉ đánh dấu status = 'deleted'
        const resp = await this.patch(id, {
          status: "deleted",
          deleted_at: new Date().toISOString(),
        });

        return {
          success: true,
          message: "Calculation session archived successfully",
          data: resp.data,
        };
      } else {
        // Hard delete
        const resp = await this.delete(id);

        return {
          success: true,
          message: "Calculation session deleted successfully",
          data: resp.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete calculation session",
      };
    }
  }

  /**
   * Xóa/archive hàng loạt phiên tính toán
   * @param {Array<string>} ids - Mảng các ID cần xóa
   * @param {boolean} [soft=false] - Soft delete hay hard delete
   * @returns {Promise<object>} Object response
   */
  async bulkDelete(ids, soft = false) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      for (const id of ids) {
        const result = await this.deleteCalcSession(id, soft);
        if (result.success) {
          results.success.push(id);
        } else {
          results.failed.push({ id, error: result.error });
        }
      }

      return {
        success: true,
        data: results,
        message: `Processed ${ids.length} sessions: ${results.success.length} succeeded, ${results.failed.length} failed`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to bulk delete calculation sessions",
      };
    }
  }

  /**
   * So sánh hai phiên tính toán
   * @param {string} id1 - ID phiên tính toán thứ nhất
   * @param {string} id2 - ID phiên tính toán thứ hai
   * @returns {Promise<object>} Object chứa thông tin so sánh
   */
  async compareSessions(id1, id2) {
    try {
      const [session1, session2] = await Promise.all([
        this.getOneCalcSession(id1),
        this.getOneCalcSession(id2),
      ]);

      if (!session1.success || !session2.success) {
        return {
          success: false,
          error: "One or both calculation sessions not found",
        };
      }

      const s1 = session1.data;
      const s2 = session2.data;

      const comparison = {
        session1: s1,
        session2: s2,
        differences: {},
        summary: {
          litres_diff: s2.litres_needed - s1.litres_needed,
          litres_diff_pct:
            ((s2.litres_needed - s1.litres_needed) / s1.litres_needed) * 100,
          wastage_diff: s2.wastage_pct - s1.wastage_pct,
          coverage_diff: s2.cover_m2_per_L - s1.cover_m2_per_L,
        },
      };

      // Find all differences
      const compareFields = [
        "surface_id",
        "coverage_rule_id",
        "cover_m2_per_L",
        "coats",
        "wastage_pct",
        "litres_needed",
        "suggestion",
      ];

      compareFields.forEach((field) => {
        if (s1[field] !== s2[field]) {
          comparison.differences[field] = {
            session1: s1[field],
            session2: s2[field],
          };
        }
      });

      return {
        success: true,
        data: comparison,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to compare calculation sessions",
      };
    }
  }

  /**
   * Xuất dữ liệu phiên tính toán ra CSV
   * @param {object} options - Tùy chọn xuất
   * @param {string} [options.surface_id] - Lọc theo surface_id
   * @param {string} [options.format='csv'] - Định dạng xuất (csv/json)
   * @returns {Promise<object>} Object chứa dữ liệu export
   */
  async exportSessions(options = {}) {
    try {
      const sessions = await this.getAllCalcSessions({
        surface_id: options.surface_id,
        limit: 1000, // Export tối đa 1000 records
      });

      if (!sessions.success) {
        return sessions;
      }

      const format = options.format || "csv";

      if (format === "csv") {
        // Generate CSV
        const headers = [
          "ID",
          "Surface ID",
          "Coverage Rule ID",
          "Cover m²/L",
          "Coats",
          "Wastage %",
          "Litres Needed",
          "Suggestion",
          "Created At",
        ];

        const rows = sessions.data.map((session) => [
          session.id,
          session.surface_id,
          session.coverage_rule_id,
          session.cover_m2_per_L,
          session.coats,
          session.wastage_pct,
          session.litres_needed,
          session.suggestion || "",
          session.create_at,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return {
          success: true,
          data: csvContent,
          format: "csv",
          filename: `calc_sessions_export_${new Date().getTime()}.csv`,
        };
      } else if (format === "json") {
        return {
          success: true,
          data: JSON.stringify(sessions.data, null, 2),
          format: "json",
          filename: `calc_sessions_export_${new Date().getTime()}.json`,
        };
      } else {
        return {
          success: false,
          error: "Unsupported export format. Use 'csv' or 'json'",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to export calculation sessions",
      };
    }
  }

  /**
   * Import dữ liệu phiên tính toán từ CSV/JSON
   * @param {Array<object>} data - Mảng các object phiên tính toán
   * @param {boolean} [validate=true] - Có validate hay không
   * @returns {Promise<object>} Object response
   */
  async importSessions(data, validate = true) {
    try {
      if (!Array.isArray(data)) {
        return {
          success: false,
          error: "Import data must be an array",
        };
      }

      const results = {
        success: [],
        failed: [],
        total: data.length,
      };

      for (const sessionData of data) {
        try {
          const result = await this.storeCalcSession(sessionData);
          if (result.success) {
            results.success.push(result.data);
          } else {
            results.failed.push({
              data: sessionData,
              error: result.error,
            });
          }
        } catch (error) {
          results.failed.push({
            data: sessionData,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        data: results,
        message: `Imported ${results.success.length}/${results.total} sessions successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to import calculation sessions",
      };
    }
  }

  /**
   * Tạo phiên bản lưu trữ (snapshot) của phiên tính toán
   * @param {string} id - ID phiên tính toán
   * @param {string} [note] - Ghi chú cho phiên bản
   * @returns {Promise<object>} Object response
   */
  async createSnapshot(id, note = "") {
    try {
      const session = await this.getOneCalcSession(id);
      
      if (!session.success) {
        return session;
      }

      const snapshot = {
        calc_session_id: id,
        snapshot_data: session.data,
        note,
        created_at: new Date().toISOString(),
      };

      // Store snapshot in separate endpoint
      const snapshotApi = new BaseAPI("calc_session_snapshots");
      const resp = await snapshotApi.store(snapshot);

      return {
        success: true,
        data: {
          snapshot_id: resp.data.name,
          ...snapshot,
        },
        message: "Snapshot created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create snapshot",
      };
    }
  }

  /**
   * Khôi phục phiên tính toán từ snapshot
   * @param {string} snapshotId - ID của snapshot
   * @returns {Promise<object>} Object response
   */
  async restoreFromSnapshot(snapshotId) {
    try {
      const snapshotApi = new BaseAPI("calc_session_snapshots");
      const resp = await snapshotApi.getOne(snapshotId);

      if (!resp.data) {
        return {
          success: false,
          error: "Snapshot not found",
        };
      }

      const snapshot = resp.data;
      const calcSessionId = snapshot.calc_session_id;

      // Restore the calc_session
      const restoreResult = await this.updateCalcSession(
        calcSessionId,
        snapshot.snapshot_data
      );

      if (restoreResult.success) {
        return {
          success: true,
          data: restoreResult.data,
          message: "Calculation session restored from snapshot successfully",
        };
      }

      return restoreResult;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to restore from snapshot",
      };
    }
  }

  /**
   * Lấy lịch sử các snapshots của một phiên tính toán
   * @param {string} calcSessionId - ID phiên tính toán
   * @returns {Promise<object>} Object response
   */
  async getSnapshotHistory(calcSessionId) {
    try {
      const snapshotApi = new BaseAPI("calc_session_snapshots");
      const resp = await snapshotApi.getAll();

      if (!resp.data || typeof resp.data !== "object") {
        return {
          success: true,
          data: [],
        };
      }

      const snapshots = Object.keys(resp.data)
        .map((id) => ({
          id,
          ...resp.data[id],
        }))
        .filter((snapshot) => snapshot.calc_session_id === calcSessionId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return {
        success: true,
        data: snapshots,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get snapshot history",
      };
    }
  }

  /**
   * Tính toán lại litres_needed dựa trên các thông số
   * @param {object} params - Các tham số tính toán
   * @param {number} params.area_m2 - Diện tích (m²)
   * @param {number} params.cover_m2_per_L - Độ phủ (m²/L)
   * @param {number} params.coats - Số lớp sơn
   * @param {number} params.wastage_pct - Tỷ lệ hao hụt (0.0 - 1.0)
   * @returns {object} Kết quả tính toán
   */
  static calculateLitresNeeded(params) {
    const { area_m2, cover_m2_per_L, coats, wastage_pct } = params;

    if (!area_m2 || !cover_m2_per_L || !coats) {
      return {
        success: false,
        error: "Missing required calculation parameters",
      };
    }

    const baseNeeded = (area_m2 * coats) / cover_m2_per_L;
    const litresNeeded = baseNeeded * (1 + wastage_pct);

    return {
      success: true,
      data: {
        base_litres: parseFloat(baseNeeded.toFixed(2)),
        litres_needed: parseFloat(litresNeeded.toFixed(2)),
        wastage_litres: parseFloat((litresNeeded - baseNeeded).toFixed(2)),
      },
    };
  }
}
