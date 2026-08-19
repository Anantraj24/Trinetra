export enum JourneyMode {
  NOMAD = 'NOMAD',
  WATCH = 'WATCH',
  GUARDIAN = 'GUARDIAN',
  SENTINEL = 'SENTINEL',
}

export enum ConnectivityState {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
}

export enum HazardTrustLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERIFIED = 'VERIFIED',
}

export enum UserRole {
  TOURIST = 'TOURIST',
  AUTHORITY = 'AUTHORITY',
}
export * from './safetyPass';
export * from './journey';