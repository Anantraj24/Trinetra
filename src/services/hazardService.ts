import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { Hazard, HazardTrustLevel } from '@/types';

const COLLECTION = 'hazards';

export interface HazardFormData {
  type: string;
  severity: number;
  trustLevel: HazardTrustLevel;
  source: string;
  publishedAt: string;
  expiresAt: string;
  description: string;
  region?: string;
  distance?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const hazardService = {
  async getAllHazards(): Promise<Hazard[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type || 'Unknown Risk',
          severity: typeof data.severity === 'number' ? data.severity : 0.5,
          trustLevel: (data.trustLevel as HazardTrustLevel) || HazardTrustLevel.UNVERIFIED,
          source: data.source || 'Authority Intel',
          publishedAt: data.publishedAt || new Date().toISOString(),
          expiresAt: data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
          description: data.description || '',
          distance: data.distance,
          coordinates: data.coordinates,
          active: data.active !== false,
          region: data.region,
        } as Hazard & { active?: boolean; region?: string };
      });
    } catch (e) {
      console.error('Error fetching hazards from Firestore:', e);
      return [];
    }
  },

  async getHazardById(id: string): Promise<Hazard | null> {
    if (!db) return null;
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...snap.data(),
    } as Hazard;
  },

  async createHazard(data: HazardFormData): Promise<Hazard> {
    if (!db) throw new Error('Firestore is not initialized');
    const newDocRef = doc(collection(db, COLLECTION));
    const now = new Date().toISOString();
    const hazard: Hazard & { active: boolean; region?: string } = {
      id: newDocRef.id,
      type: data.type,
      severity: data.severity,
      trustLevel: data.trustLevel,
      source: data.source,
      publishedAt: data.publishedAt || now,
      expiresAt: data.expiresAt,
      description: data.description,
      distance: data.distance,
      coordinates: data.coordinates,
      active: true,
      region: data.region,
    };

    await setDoc(newDocRef, hazard);
    return hazard;
  },

  async updateHazard(id: string, updates: Partial<HazardFormData & { active: boolean }>): Promise<void> {
    if (!db) throw new Error('Firestore is not initialized');
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async deactivateHazard(id: string): Promise<void> {
    if (!db) throw new Error('Firestore is not initialized');
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  },
};
