import { z } from 'zod';
import { UserRole, IncidentStatus } from '@/types';

// Generic coordinate schema
export const GeoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// User Schema
export const UserSchema = z.object({
  uid: z.string(),
  role: z.nativeEnum(UserRole),
  name: z.string().min(1, 'Name is required'),
  contactDetails: z.object({
    phone: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
  }).optional(),
  createdAt: z.date().optional(),
});
export type UserDocument = z.infer<typeof UserSchema>;

// Journey Status Enum (since it wasn't in index.ts)
export enum JourneyStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  SOS = 'SOS',
}

// Journey Schema
export const JourneySchema = z.object({
  id: z.string().optional(),
  touristId: z.string(),
  startLocation: GeoPointSchema,
  endLocation: GeoPointSchema,
  status: z.nativeEnum(JourneyStatus),
  offlineRiskScore: z.number().min(0).max(100),
  createdAt: z.date().optional(),
});
export type JourneyDocument = z.infer<typeof JourneySchema>;

// Incident Schema
export const IncidentSchema = z.object({
  id: z.string().optional(),
  journeyId: z.string(),
  touristId: z.string(),
  status: z.nativeEnum(IncidentStatus),
  responderId: z.string().nullable().optional(),
  reportedAt: z.date().optional(),
});
export type IncidentDocument = z.infer<typeof IncidentSchema>;
