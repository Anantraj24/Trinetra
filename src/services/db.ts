import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  UserDocument, UserSchema, 
  JourneyDocument, JourneySchema, 
  IncidentDocument, IncidentSchema 
} from '@/lib/schemas';

const USERS_COLLECTION = 'users';
const JOURNEYS_COLLECTION = 'journeys';
const INCIDENTS_COLLECTION = 'incidents';

// User Repository
export const getUser = async (uid: string): Promise<UserDocument | null> => {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Convert Firestore Timestamp to Date if necessary
    if (data.createdAt && data.createdAt instanceof Timestamp) {
      data.createdAt = data.createdAt.toDate();
    }
    return UserSchema.parse(data);
  }
  return null;
};

export const createUser = async (user: UserDocument): Promise<void> => {
  const validatedData = UserSchema.parse(user);
  const docRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(docRef, {
    ...validatedData,
    createdAt: validatedData.createdAt || Timestamp.now(),
  });
};

// Journey Repository
export const createJourney = async (journey: Omit<JourneyDocument, 'id'>): Promise<string> => {
  const validatedData = JourneySchema.omit({ id: true }).parse(journey);
  const colRef = collection(db, JOURNEYS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...validatedData,
    createdAt: validatedData.createdAt || Timestamp.now(),
  });
  return docRef.id;
};

export const getJourneysByTourist = async (touristId: string): Promise<JourneyDocument[]> => {
  const colRef = collection(db, JOURNEYS_COLLECTION);
  const q = query(colRef, where('touristId', '==', touristId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    if (data.createdAt && data.createdAt instanceof Timestamp) {
      data.createdAt = data.createdAt.toDate();
    }
    return JourneySchema.parse({ ...data, id: doc.id });
  });
};

// Incident Repository
export const createIncident = async (incident: Omit<IncidentDocument, 'id'>): Promise<string> => {
  const validatedData = IncidentSchema.omit({ id: true }).parse(incident);
  const colRef = collection(db, INCIDENTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...validatedData,
    reportedAt: validatedData.reportedAt || Timestamp.now(),
  });
  return docRef.id;
};

export const getIncidents = async (): Promise<IncidentDocument[]> => {
  const colRef = collection(db, INCIDENTS_COLLECTION);
  const querySnapshot = await getDocs(colRef);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    if (data.reportedAt && data.reportedAt instanceof Timestamp) {
      data.reportedAt = data.reportedAt.toDate();
    }
    return IncidentSchema.parse({ ...data, id: doc.id });
  });
};

export const updateIncidentStatus = async (
  incidentId: string, 
  status: IncidentDocument['status'], 
  responderId?: string
): Promise<void> => {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  const updateData: Partial<IncidentDocument> = { status };
  if (responderId) {
    updateData.responderId = responderId;
  }
  await updateDoc(docRef, updateData);
};
