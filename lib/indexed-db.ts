import Dexie, { type Table } from "dexie";

export interface OfflineOperation {
  id?: number;
  type: "sale" | "expense" | "payment" | "inventory" | "other";
  action: "create" | "update" | "delete";
  endpoint: string;
  data: any;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  timestamp: number;
  retryCount: number;
  lastError?: string;
  status: "pending" | "processing" | "failed" | "completed";
}

export class LedgrDatabase extends Dexie {
  offlineOperations!: Table<OfflineOperation>;

  constructor() {
    super("LedgrDB");
    this.version(1).stores({
      offlineOperations:
        "++id, type, action, status, timestamp, retryCount, endpoint",
    });
  }
}

export const db = new LedgrDatabase();

// Helper functions for offline operations
export const offlineOperationsDB = {
  async add(operation: Omit<OfflineOperation, "id">) {
    return await db.offlineOperations.add(operation);
  },

  async getAll() {
    return await db.offlineOperations.toArray();
  },

  async getPending() {
    return await db.offlineOperations
      .where("status")
      .equals("pending")
      .sortBy("timestamp");
  },

  async update(id: number, changes: Partial<OfflineOperation>) {
    return await db.offlineOperations.update(id, changes);
  },

  async delete(id: number) {
    return await db.offlineOperations.delete(id);
  },

  async markAsProcessing(id: number) {
    return await db.offlineOperations.update(id, { status: "processing" });
  },

  async markAsCompleted(id: number) {
    return await db.offlineOperations.update(id, { status: "completed" });
  },

  async markAsFailed(id: number, error: string) {
    return await db.offlineOperations.update(id, {
      status: "failed",
      lastError: error,
    });
  },

  async incrementRetryCount(id: number) {
    const operation = await db.offlineOperations.get(id);
    if (operation) {
      return await db.offlineOperations.update(id, {
        retryCount: operation.retryCount + 1,
      });
    }
  },

  async clearCompleted() {
    return await db.offlineOperations
      .where("status")
      .equals("completed")
      .delete();
  },

  async clearAll() {
    return await db.offlineOperations.clear();
  },

  async getByType(type: OfflineOperation["type"]) {
    return await db.offlineOperations.where("type").equals(type).toArray();
  },

  async getFailedOperations() {
    return await db.offlineOperations.where("status").equals("failed").toArray();
  },
};
