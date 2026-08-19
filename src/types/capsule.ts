import { RiskReason } from '@/lib/riskEngine';
import { Hazard } from './hazard';

export interface RescueCapsule {
  id: string; // The capsule ID
  incidentId: string;
  journeyId: string;
  severity: number;
  riskScore: number;
  confidence: number;
  trigger: 'MANUAL_SOS' | 'AUTO_ESCALATION' | 'USER_CONFIRMED_HELP';
  createdAt: string; // ISO String
  
  lastSafeState: {
    lat?: number;
    lng?: number;
    timestamp?: string; // ISO String
  };

  currentEvidence: {
    routeDeviationKm: number;
    connectivity: string;
    missedCheckins: number;
    inactivityMinutes: number;
  };

  reasons: RiskReason[];
  
  hazardContext?: Hazard[];

  touristEmergencyFields: {
    bloodGroup?: string;
    emergencyContact?: string;
    medicalNotes?: string;
  };

  integrityValue?: string; // Server HMAC signature
  isPendingServerVerification?: boolean; // True if generated offline
}
