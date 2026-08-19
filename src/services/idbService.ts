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
  }
};
