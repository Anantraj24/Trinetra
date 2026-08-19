import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Incident, IncidentEvent, IncidentEventType } from '@/types/incident';
import { IncidentStatus } from '@/types';
import { idbService } from './idbService';

class IncidentService {
  private collectionName = 'incidents';
  private eventsCollectionName = 'incidentEvents';

  async createIncident(
    journeyId: string, 
    touristId: string, 
    description: string, 
    severity: number
  ): Promise<Incident> {
    const newRef = doc(collection(db, this.collectionName));
    const newIncident: Incident = {
      id: newRef.id,
      journeyId,
      touristId,
      status: IncidentStatus.CREATED,
      reportedAt: new Date().toISOString(),
      severity,
      description
    };
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await idbService.enqueueSyncItem(newIncident.id, 'INCIDENT', newIncident);
      return newIncident;
    }

    try {
      await setDoc(newRef, newIncident);
    } catch (_e) {
      await idbService.enqueueSyncItem(newIncident.id, 'INCIDENT', newIncident);
    }
    return newIncident;
  }

  async addIncidentEvent(
    incidentId: string, 
    type: IncidentEventType, 
    description: string, 
    metadata?: Record<string, unknown>
  ): Promise<IncidentEvent> {
    const newRef = doc(collection(db, this.eventsCollectionName));
    const newEvent: IncidentEvent = {
      id: newRef.id,
      incidentId,
      type,
      timestamp: new Date().toISOString(),
      description,
      metadata
    };
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await idbService.enqueueSyncItem(newEvent.id, 'INCIDENT_EVENT', newEvent);
      return newEvent;
    }

    try {
      await setDoc(newRef, newEvent);
    } catch (_e) {
      await idbService.enqueueSyncItem(newEvent.id, 'INCIDENT_EVENT', newEvent);
    }
    return newEvent;
  }

  async updateIncidentStatus(incidentId: string, status: IncidentStatus): Promise<void> {
    const docRef = doc(db, this.collectionName, incidentId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      ...(status === IncidentStatus.RESOLVED ? { resolvedAt: new Date().toISOString() } : {})
    });
  }

  /** Fetch a single incident by its document ID. */
  async getIncidentById(incidentId: string): Promise<Incident | null> {
    const docRef = doc(db, this.collectionName, incidentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Incident;
  }

  /** Fetch all IncidentEvents linked to an incident, ordered chronologically. */
  async getEventsForIncident(incidentId: string): Promise<IncidentEvent[]> {
    const q = query(
      collection(db, this.eventsCollectionName),
      where('incidentId', '==', incidentId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as IncidentEvent);
  }

  /** Assign a responder: update the incident and create a RESPONDER_ASSIGNED event. */
  async assignResponder(incidentId: string, responderId: string, responderCallsign: string): Promise<void> {
    const docRef = doc(db, this.collectionName, incidentId);
    await updateDoc(docRef, {
      responderId,
      status: IncidentStatus.ASSIGNED,
      updatedAt: new Date().toISOString(),
    });
    await this.addIncidentEvent(
      incidentId,
      IncidentEventType.RESPONDER_ASSIGNED,
      `Responder ${responderCallsign} assigned to incident.`,
      { responderId, responderCallsign }
    );
  }

  listenToActiveIncident(journeyId: string, callback: (incident: Incident | null) => void): () => void {
    const q = query(
      collection(db, this.collectionName), 
      where('journeyId', '==', journeyId),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const incident = snapshot.docs[0].data() as Incident;
        await idbService.saveIncident(incident);
        callback(incident);
      }
    }, (error) => {
      console.error("Error listening to incident:", error);
    });

    return unsubscribe;
  }

  /** Listen to a specific incident by ID for real-time updates. */
  listenToIncident(incidentId: string, callback: (incident: Incident | null) => void): () => void {
    const docRef = doc(db, this.collectionName, incidentId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as Incident);
      }
    }, (error) => {
      console.error("Error listening to incident:", error);
    });
    return unsubscribe;
  }

  async getAllIncidents(): Promise<Incident[]> {
    if (!db) throw new Error('Firestore is not initialized');
    const q = query(collection(db, this.collectionName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Incident);
  }
}

export const incidentService = new IncidentService();
