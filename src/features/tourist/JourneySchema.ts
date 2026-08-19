import { z } from 'zod';

const geoLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().min(1, 'Location name is required'),
});

export const journeyContractSchema = z.object({
  origin: geoLocationSchema,
  destination: geoLocationSchema,
  
  startTime: z.string().min(1, 'Start time is required').refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time format'
  }),
  expectedReturnTime: z.string().min(1, 'Expected return time is required').refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid return time format'
  }),
  
  checkInIntervalMinutes: z.number().min(15, 'Minimum check-in interval is 15 minutes').max(1440, 'Maximum check-in interval is 24 hours'),
  safeCorridorRadiusMeters: z.number().min(100, 'Minimum corridor radius is 100 meters').max(10000, 'Maximum corridor radius is 10km'),
}).refine(data => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.expectedReturnTime).getTime();
  return end > start;
}, {
  message: 'Expected return time must be after start time',
  path: ['expectedReturnTime']
});

export type JourneyContractFormData = z.infer<typeof journeyContractSchema>;
