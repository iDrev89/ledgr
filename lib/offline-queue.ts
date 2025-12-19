"use client";

import { offlineOperationsDB, type OfflineOperation } from "./indexed-db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class OfflineQueue {
  private static instance: OfflineQueue;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  async enqueue(operation: Omit<OfflineOperation, "id" | "retryCount">) {
    try {
      const id = await offlineOperationsDB.add({
        ...operation,
        retryCount: 0,
        status: "pending",
      });
      console.log(`Operation enqueued with id: ${id}`);
      return id;
    } catch (error) {
      console.error("Error enqueueing operation:", error);
      throw error;
    }
  }

  async startProcessing() {
    if (this.isProcessing) {
      console.log("Queue processing already running");
      return;
    }

    this.isProcessing = true;
    console.log("Starting offline queue processing");

    // Process immediately
    await this.processQueue();

    // Then process every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log("Stopped offline queue processing");
  }

  private async processQueue() {
    try {
      const pendingOperations = await offlineOperationsDB.getPending();

      if (pendingOperations.length === 0) {
        return;
      }

      console.log(`Processing ${pendingOperations.length} pending operations`);

      for (const operation of pendingOperations) {
        await this.processOperation(operation);
      }
    } catch (error) {
      console.error("Error processing queue:", error);
    }
  }

  private async processOperation(operation: OfflineOperation) {
    if (!operation.id) {
      console.error("Operation has no id, skipping");
      return;
    }

    // Check if we've exceeded max retries
    if (operation.retryCount >= MAX_RETRIES) {
      await offlineOperationsDB.markAsFailed(
        operation.id,
        `Max retries (${MAX_RETRIES}) exceeded`
      );
      console.error(
        `Operation ${operation.id} failed after ${MAX_RETRIES} retries`
      );
      return;
    }

    try {
      // Mark as processing
      await offlineOperationsDB.markAsProcessing(operation.id);

      // Execute the operation
      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operation.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mark as completed
      await offlineOperationsDB.markAsCompleted(operation.id);
      console.log(`Operation ${operation.id} completed successfully`);

      // Optionally delete completed operations after a delay
      setTimeout(() => {
        if (operation.id) {
          offlineOperationsDB.delete(operation.id);
        }
      }, 5000);
    } catch (error) {
      console.error(`Error processing operation ${operation.id}:`, error);

      // Increment retry count and mark as pending for retry
      await offlineOperationsDB.incrementRetryCount(operation.id);
      await offlineOperationsDB.update(operation.id, {
        status: "pending",
        lastError: error instanceof Error ? error.message : "Unknown error",
      });

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  async retryFailed() {
    const failedOperations = await offlineOperationsDB.getFailedOperations();
    console.log(`Retrying ${failedOperations.length} failed operations`);

    for (const operation of failedOperations) {
      if (operation.id) {
        await offlineOperationsDB.update(operation.id, {
          status: "pending",
          retryCount: 0,
        });
      }
    }

    await this.processQueue();
  }

  async getPendingCount(): Promise<number> {
    const pending = await offlineOperationsDB.getPending();
    return pending.length;
  }

  async getFailedCount(): Promise<number> {
    const failed = await offlineOperationsDB.getFailedOperations();
    return failed.length;
  }

  async clearCompleted() {
    await offlineOperationsDB.clearCompleted();
  }

  async clearAll() {
    await offlineOperationsDB.clearAll();
  }
}

// Helper function to enqueue operations easily
export const enqueueOfflineOperation = async (
  operation: Omit<OfflineOperation, "id" | "retryCount" | "status" | "timestamp">
) => {
  const queue = OfflineQueue.getInstance();
  return await queue.enqueue({
    ...operation,
    timestamp: Date.now(),
  });
};
