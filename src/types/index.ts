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
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
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
 