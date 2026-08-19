export enum JourneyStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  SOS = 'SOS',
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface Journey {
  id: string;
  touristId: string;
  
  origin: GeoLocation;
  destination: GeoLocation;
  
  startTime: string; // ISO String
  expectedReturnTime: string; // ISO String
  
  checkInIntervalMinutes: number;
  safeCorridorRadiusMeters: number;
  
  status: JourneyStatus;
  offlineRiskScore: number;
  
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}
