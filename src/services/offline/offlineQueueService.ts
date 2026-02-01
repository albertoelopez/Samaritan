import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { store } from '../../store/store';

interface OfflineQueueDB extends DBSchema {
  queue: {
    key: string;
    value: {
      id: string;
      action: any;
      timestamp: number;
      retries: number;
      status: 'pending' | 'processing' | 'failed';
    };
  };
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
}

class OfflineQueueService {
  private db: IDBPDatabase<OfflineQueueDB> | null = null;
  private isProcessing = false;

  async init(): Promise<void> {
    this.db = await openDB<OfflineQueueDB>('homedepot-paisano-offline', 1, {
      upgrade(db) {
        // Create queue store
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('status', 'status');
        }

        // Create cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache');
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async addToQueue(item: Omit<OfflineQueueDB['queue']['value'], 'id' | 'status'>): Promise<void> {
    if (!this.db) await this.init();
    
    const id = `${Date.now()}-${Math.random()}`;
    await this.db!.add('queue', {
      ...item,
      id,
      status: 'pending',
    });
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      if (!this.db) await this.init();
      
      const tx = this.db!.transaction('queue', 'readwrite');
      const index = tx.objectStore('queue').index('status');
      const pendingItems = await index.getAll('pending');
      
      for (const item of pendingItems) {
        try {
          // Update status to processing
          await this.db!.put('queue', { ...item, status: 'processing' });
          
          // Dispatch the action
          await store.dispatch(item.action);
          
          // Remove from queue on success
          await this.db!.delete('queue', item.id);
        } catch (error) {
          console.error('Error processing offline queue item:', error);
          
          // Update retry count and status
          const updatedItem = {
            ...item,
            retries: item.retries + 1,
            status: 'pending' as const,
          };
          
          if (updatedItem.retries > 3) {
            updatedItem.status = 'failed' as const;
          }
          
          await this.db!.put('queue', updatedItem);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Cache methods
  async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) await this.init();
    
    await this.db!.put('cache', {
      data,
      timestamp: Date.now(),
      ttl,
    }, key);
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    const cached = await this.db!.get('cache', key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      await this.db!.delete('cache', key);
      return null;
    }
    
    return cached.data;
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const allKeys = await store.getAllKeys();
    
    for (const key of allKeys) {
      const item = await store.get(key);
      if (item && Date.now() - item.timestamp > item.ttl) {
        await store.delete(key);
      }
    }
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    await this.db!.clear('queue');
    await this.db!.clear('cache');
  }

  // Get queue status
  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    failed: number;
  }> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('queue', 'readonly');
    const index = tx.objectStore('queue').index('status');
    
    const pending = await index.count('pending');
    const processing = await index.count('processing');
    const failed = await index.count('failed');
    
    return { pending, processing, failed };
  }
}

export const offlineQueueService = new OfflineQueueService();