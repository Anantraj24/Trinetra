export enum JourneyMode {
  NOMAD = 'NOMAD',
  WATCH = 'WATCH',
  GUARDIAN = 'GUARDIAN',
  SENTINEL = 'SENTINEL',
}

export enum ConnectivityState {
  ONLINE = 'ONLINE',
  POOR = 'POOR',
  OFFLINE = 'OFFLINE',
}

export enum IncidentStatus {
  CREATED = 'CREATED',
  RECEIVED = 'RECEIVED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum HazardTrustLevel {
  VERIFIED = 'VERIFIED',
  ESTABLISHED = 'ESTABLISHED',
  AUTOMATED = 'AUTOMATED',
  INFERRED = 'INFERRED',
  UNVERIFIED = 'UNVERIFIED',
}

export enum UserRole {
  TOURIST = 'TOURIST',
  AUTHORITY = 'AUTHORITY',
}
export * from './safetyPass';
export * from './journey';
export * from './incident';
export * from './hazard';  
 export * from './capsule';
export * from './responder';
