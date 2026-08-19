import { JourneyMode, ConnectivityState, HazardTrustLevel } from '@/types';

export const DEMO_SAFETY_PULSE = {
  score: 94,
  mode: JourneyMode.NOMAD,
  confidence: 'High Confidence',
  message: 'Environment is stable. Proceed with regular check-ins.',
  status: 'active' as const, // For the SafetyPulse indicator
};

export const DEMO_ACTIVE_JOURNEY = {
  id: 'journey-001',
  origin: 'Base Camp 4',
  destination: 'High Altitude Observatory',
  progressPercent: 42,
  nextCheckIn: '45 mins',
  connectivity: ConnectivityState.ONLINE,
};

export const DEMO_NEARBY_RISK = {
  id: 'hazard-102',
  title: 'Severe Weather Alert',
  distance: '4.2 km',
  trust: HazardTrustLevel.VERIFIED,
};

export const DEMO_RECENT_ACTIVITY = [
  {
    id: 'act-1',
    time: '10:42 AM',
    description: 'Passed Checkpoint Alpha',
    type: 'success',
  },
  {
    id: 'act-2',
    time: '09:15 AM',
    description: 'Journey Contract verified by local authority',
    type: 'info',
  },
  {
    id: 'act-3',
    time: '08:30 AM',
    description: 'Offline Pack synced successfully',
    type: 'neutral',
  },
];
