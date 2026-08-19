import { idbService } from './idbService';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

class OfflineSyncService {
  private syncing = false;

  async syncQueue(): Promise<void> {
    if (this.syncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[OfflineSyncService] Currently offline, skipping sync.');
      return;
    }

    this.syncing = true;
    try {
      const queue = await idbService.getSyncQueue();
      if (!queue || queue.length === 0) {
        this.syncing = false;
        return;
      }

      console.log(`[OfflineSyncService] Found ${queue.length} items to sync.`);

      for (const item of queue) {
        try {
          // Based on type, we push to the correct collection
          let collectionName = '';
          if (item.type === 'INCIDENT') {
            collectionName = 'incidents';
          } else if (item.type === 'INCIDENT_EVENT') {
            collectionName = 'incidentEvents';
          } else if (item.type === 'TELEMETRY') {
            collectionName = 'telemetry';
          } else {
            console.warn(`[OfflineSyncService] Unknown item type: ${item.type}`);
            await idbService.dequeueSyncItem(item.id);
            continue;
          }

          // In this prototype, the payload already contains the exact document structure we need
          // We assume item.payload.id exists and matches the document ID we want to create
          const payload = item.payload as Record<string, unknown>;
          const docId = (payload.id as string) || item.id;
          const docRef = doc(db, collectionName, docId);
          
          await setDoc(docRef, payload, { merge: true });
          
          // If successful, remove from queue
          await idbService.dequeueSyncItem(item.id);
          console.log(`[OfflineSyncService] Synced item ${item.id} successfully.`);

        } catch (itemErr) {
          console.error(`[OfflineSyncService] Failed to sync item ${item.id}:`, itemErr);
          // If a network error occurs, we break the loop to retry later.
          // Other types of errors might require skipping, but for safety critical data we retry.
          break; 
        }
      }
    } catch (err) {
      console.error('[OfflineSyncService] Error during sync queue processing:', err);
    } finally {
      this.syncing = false;
    }
  }

  // Set up listeners for online events
  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineSyncService] Online event detected. Triggering sync.');
        this.syncQueue();
      });
      
      // Also try to sync on init just in case
      this.syncQueue();
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
