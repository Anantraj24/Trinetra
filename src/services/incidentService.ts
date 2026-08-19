import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Incident, IncidentEvent, IncidentEventType } from '@/types/incident';
import { IncidentStatus } from '@/types';

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
      status: IncidentStatus.OPEN,
      reportedAt: new Date().toISOString(),
      severity,
      description
    };
    
    await setDoc(newRef, newIncident);
    return newIncident;
  }

  async addIncidentEvent(
    incidentId: string, 
    type: IncidentEventType, 
    description: string, 
    metadata?: Record<string, unknown>
  ): Promise<IncidentEvent> {
    // Note: if there is no incidentId yet (e.g. SAFETY_CONFIRMED without an incident),
    // we might just log it with a dummy or unlinked incidentId for prototype purposes,
    // or we can allow incidentId to be optional. 
    // Wait, the schema says incidentId is required. 
    // If the user hasn't escalated, there is no Incident. So maybe we link events to JourneyId instead of IncidentId?
    // Let's create the event anyway, linking it to the incidentId or just passing the journeyId if incident doesn't exist.
    // For now, let's assume we pass journeyId as incidentId if no incident exists, or we modify the type.
    
    const newRef = doc(collection(db, this.eventsCollectionName));
    const newEvent: IncidentEvent = {
      id: newRef.id,
      incidentId,
      type,
      timestamp: new Date().toISOString(),
      description,
      metadata
    };
    
    await setDoc(newRef, newEvent);
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
}

export const incidentService = new IncidentService();
