import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Journey } from '@/types/journey';

interface TrinetraDB extends DBSchema {
  active_journey: {
    key: string; // journeyId
    value: Journey;
  };
  safety_pack: {
    key: string; // journeyId
    value: {
      journeyId: string;
      downloadedAt: string;
      data: unknown; // Prototype: stub structure for regional safety data
    };
  };
  hazards: {
    key: string; // hazardId
    value: unknown;
  };
  telemetry: {
    key: string; // telemetryId
    value: unknown;
  };
  capsules: {
    key: string; // capsuleId
    value: unknown; // RescueCapsule
  };
  sync_queue: {
    key: string; // stable id
    value: {
      id: string;
      type: string;
      payload: unknown;
      createdAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<TrinetraDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<TrinetraDB>('trinetra-offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('active_journey')) {
        db.createObjectStore('active_journey', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('safety_pack')) {
        db.createObjectStore('safety_pack', { keyPath: 'journeyId' });
      }
      if (!db.objectStoreNames.contains('hazards')) {
        db.createObjectStore('hazards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('telemetry')) {
        db.createObjectStore('telemetry', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('capsules')) {
        db.createObjectStore('capsules', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    },
  });
}

export const idbService = {
  async saveActiveJourney(journey: Journey): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('active_journey', journey);
  },

  async getActiveJourney(journeyId: string): Promise<Journey | undefined> {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    return db.get('active_journey', journeyId);
  },

  async getFirstActiveJourney(): Promise<Journey | undefined> {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    const tx = db.transaction('active_journey', 'readonly');
    const store = tx.objectStore('active_journey');
    const cursor = await store.openCursor();
    return cursor ? cursor.value : undefined;
  },

  async clearActiveJourney(journeyId: string): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.delete('active_journey', journeyId);
  },

  async saveSafetyPack(journeyId: string, packData: unknown): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('safety_pack', {
      journeyId,
      downloadedAt: new Date().toISOString(),
      data: packData,
    });
  },

  async hasSafetyPack(journeyId: string): Promise<boolean> {
    if (!dbPromise) return false;
    const db = await dbPromise;
    const pack = await db.get('safety_pack', journeyId);
    return !!pack;
  },

  async enqueueSyncItem(id: string, type: string, payload: unknown): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('sync_queue', {
      id,
      type,
      payload,
      createdAt: new Date().toISOString()
    });
  },

  async getSyncQueue(): Promise<{ id: string; type: string; payload: unknown; createdAt: string }[]> {
    if (!dbPromise) return [];
    const db = await dbPromise;
    return db.getAll('sync_queue');
  },

  async dequeueSyncItem(id: string): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.delete('sync_queue', id);
  },

  async getQueueCount(): Promise<number> {
    if (!dbPromise) return 0;
    const db = await dbPromise;
    return db.count('sync_queue');
  },

  async saveCapsule(capsule: unknown): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('capsules', capsule);
  },

  async getCapsule(id: string): Promise<unknown | undefined> {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    return db.get('capsules', id);
  },

  async clearSyncQueue(): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.clear('sync_queue');
  }
};
