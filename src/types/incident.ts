import { IncidentStatus } from './index';

export enum IncidentEventType {
  SAFETY_CONFIRMED = 'SAFETY_CONFIRMED',
  EMERGENCY_TRIGGERED = 'EMERGENCY_TRIGGERED',
  NO_RESPONSE = 'NO_RESPONSE',
  SYSTEM_ESCALATION = 'SYSTEM_ESCALATION',
  RESPONDER_ASSIGNED = 'RESPONDER_ASSIGNED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  type: IncidentEventType;
  timestamp: string; // ISO string
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  journeyId: string;
  touristId: string;
  status: IncidentStatus;
  
  reportedAt: string; // ISO string
  resolvedAt?: string; // ISO string
  
  severity: number; // 0..100 based on risk engine
  responderId?: string;
  
  description: string;
}
