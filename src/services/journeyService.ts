import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Journey, JourneyStatus } from '@/types/journey';
import { JourneyContractFormData } from '@/features/tourist/JourneySchema';

const COLLECTION = 'journeys';

export const journeyService = {
  
  async createDraftJourney(touristId: string, data: JourneyContractFormData): Promise<Journey> {
    if (!db) throw new Error('Firestore is not initialized');
    
    const journeyRef = doc(collection(db, COLLECTION));
    const now = new Date().toISOString();
    
    const journeyData: Journey = {
      id: journeyRef.id,
      touristId,
      origin: data.origin,
      destination: data.destination,
      startTime: data.startTime,
      expectedReturnTime: data.expectedReturnTime,
      checkInIntervalMinutes: data.checkInIntervalMinutes,
      safeCorridorRadiusMeters: data.safeCorridorRadiusMeters,
      status: JourneyStatus.DRAFT,
      offlineRiskScore: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(journeyRef, journeyData);
    return journeyData;
  },

  async updateJourneyStatus(journeyId: string, status: JourneyStatus): Promise<void> {
    if (!db) throw new Error('Firestore is not initialized');
    
    const docRef = doc(db, COLLECTION, journeyId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  },

  async getActiveJourney(touristId: string): Promise<Journey | null> {
    if (!db) throw new Error('Firestore is not initialized');
    
    const q = query(
      collection(db, COLLECTION), 
      where('touristId', '==', touristId),
      where('status', '==', JourneyStatus.ACTIVE),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Journey;
    }
    return null;
  },

  async getAllActiveJourneys(): Promise<Journey[]> {
    if (!db) throw new Error('Firestore is not initialized');
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', JourneyStatus.ACTIVE)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Journey);
  }
};
