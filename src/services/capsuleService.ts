import { RescueCapsule } from '@/types/capsule';
import { idbService } from './idbService';

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

    // Save capsule locally so the UI can display it
    await idbService.saveCapsule(capsule);

    return capsule;
  }

  async getCapsule(id: string): Promise<RescueCapsule | undefined> {
    return (await idbService.getCapsule(id)) as RescueCapsule | undefined;
  }
}

export const capsuleService = new CapsuleService();
