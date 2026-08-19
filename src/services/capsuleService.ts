import { RescueCapsule } from '@/types/capsule';
import { idbService } from './idbService';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, query, where, getDocs, documentId } from 'firebase/firestore';

class CapsuleService {
  async generateCapsule(capsuleData: Omit<RescueCapsule, 'id' | 'createdAt' | 'integrityValue' | 'isPendingServerVerification'>): Promise<RescueCapsule> {
    const id = crypto.randomUUID();
    
    const capsule: RescueCapsule = {
      ...capsuleData,
      id,
      createdAt: new Date().toISOString(),
    };

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await fetch('/api/capsule/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(capsule),
        });

        if (response.ok) {
          const { signature } = await response.json();
          capsule.integrityValue = signature;
          capsule.isPendingServerVerification = false;
        } else {
          // If server fails but we are online, still mark as pending
          capsule.isPendingServerVerification = true;
          await idbService.enqueueSyncItem(id, 'CAPSULE_SIGN', capsule);
        }
      } catch (err) {
        console.error('Error fetching capsule signature:', err);
        capsule.isPendingServerVerification = true;
        await idbService.enqueueSyncItem(id, 'CAPSULE_SIGN', capsule);
      }
    } else {
      // Offline mode
      capsule.isPendingServerVerification = true;
      await idbService.enqueueSyncItem(id, 'CAPSULE_SIGN', capsule);
    }

    // Attempt to write to Firestore immediately if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'capsules', capsule.id), capsule);
      } catch (err) {
        console.error('Error saving capsule to Firestore:', err);
      }
    }

    // Save capsule locally so the UI can display it
    await idbService.saveCapsule(capsule);

    return capsule;
  }

  async getCapsule(id: string): Promise<RescueCapsule | undefined> {
    return (await idbService.getCapsule(id)) as RescueCapsule | undefined;
  }

  async getCapsulesForIncidents(incidentIds: string[]): Promise<RescueCapsule[]> {
    if (!db || incidentIds.length === 0) return [];
    
    // Firestore limit for 'in' queries is 10, chunk if needed but we'll assume a reasonable batch here
    const chunks = [];
    for (let i = 0; i < incidentIds.length; i += 10) {
      chunks.push(incidentIds.slice(i, i + 10));
    }
    
    const capsules: RescueCapsule[] = [];
    for (const chunk of chunks) {
      const q = query(collection(db, 'capsules'), where('incidentId', 'in', chunk));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        capsules.push(doc.data() as RescueCapsule);
      });
    }
    return capsules;
  }
}

export const capsuleService = new CapsuleService();
