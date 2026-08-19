import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { SafetyPass } from '@/types';
import { SafetyPassFormData } from '@/features/tourist/SafetyPassSchema';

const COLLECTION = 'safetyPasses';

export const safetyPassService = {
  async getSafetyPass(uid: string): Promise<SafetyPass | null> {
    if (!db) throw new Error('Firestore is not initialized');
    
    const docRef = doc(db, COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SafetyPass;
    }
    return null;
  },

  async saveSafetyPass(uid: string, data: SafetyPassFormData): Promise<SafetyPass> {
    if (!db) throw new Error('Firestore is not initialized');

    const docRef = doc(db, COLLECTION, uid);
    const existing = await this.getSafetyPass(uid);

    const now = new Date().toISOString();
    
    // Default expiry: 30 days from now if creating new
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const passData: SafetyPass = {
      uid,
      name: data.name,
      phone: data.phone,
      emergencyContact: data.emergencyContact,
      bloodGroup: data.bloodGroup,
      medicalNote: data.medicalNote || '',
      isActive: true,
      expiryDate: existing?.expiryDate || expiryDate.toISOString(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await setDoc(docRef, passData);
    return passData;
  },

  async deactivateSafetyPass(uid: string): Promise<void> {
    if (!db) throw new Error('Firestore is not initialized');
    
    const docRef = doc(db, COLLECTION, uid);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }
};
