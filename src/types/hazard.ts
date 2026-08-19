import { HazardTrustLevel } from './index';

export interface Hazard {
  id: string;
  type: string;
  severity: number; // 0 to 1
  trustLevel: HazardTrustLevel;
  source: string;
  publishedAt: string;
  expiresAt: string;
  distance?: number; // in meters or km, depending on context
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
