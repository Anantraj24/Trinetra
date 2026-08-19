import { JourneyMode, ConnectivityState, HazardTrustLevel } from '@/types';
import { SafetyPass } from '@/types/safetyPass';
import { Journey, JourneyStatus } from '@/types/journey';
import { Hazard } from '@/types/hazard';
import { RiskEngineInputs, RiskEngineOutputs } from '@/lib/riskEngine';
import { DEMO_RESPONDERS } from '@/types/responder';

export const DEMO_TOURIST_PASS: SafetyPass = {
  uid: 'tourist-aarav-sharma',
  name: 'Aarav Sharma',
  phone: '+91-9876543210',
  emergencyContact: '+91-9123456789 (Meera Sharma - Sister)',
  bloodGroup: 'O+',
  medicalNote: 'Mild altitude sensitivity, carrying prescribed Acetazolamide.',
  isActive: true,
  createdAt: '2026-08-19T06:00:00.000Z',
  updatedAt: '2026-08-19T06:00:00.000Z',
  expiryDate: '2026-08-26T23:59:59.000Z',
};

export const DEMO_JOURNEY_CONTRACT: Journey = {
  id: 'jrn-sih-yuksom-dzongri-01',
  touristId: 'tourist-aarav-sharma',
  origin: { lat: 27.3714, lng: 88.2226, name: 'Yuksom Trailhead (1,780m)' },
  destination: { lat: 27.3942, lng: 88.1867, name: 'Dzongri View Point (3,950m)' },
  startTime: '2026-08-20T06:30:00.000Z',
  expectedReturnTime: '2026-08-20T18:00:00.000Z',
  checkInIntervalMinutes: 30,
  safeCorridorRadiusMeters: 500,
  status: JourneyStatus.ACTIVE,
  offlineRiskScore: 0,
  createdAt: '2026-08-20T06:00:00.000Z',
  updatedAt: '2026-08-20T06:00:00.000Z',
};

export const DEMO_LANDSLIDE_HAZARD: Hazard = {
  id: 'hzd-sih-bakhim-landslide',
  type: 'Active Landslide & Trail Collapse',
  severity: 0.85,
  trustLevel: HazardTrustLevel.VERIFIED,
  source: 'Sikkim Disaster Management Authority',
  publishedAt: '2026-08-20T07:15:00.000Z',
  expiresAt: '2026-08-21T18:00:00.000Z',
  distance: 1.2,
  description: 'Major rockfall across Bakhim gorge path. Secondary suspension bridge impassable. High terrain instability.',
  region: 'Bakhim River Gorge',
  active: true,
  coordinates: { latitude: 27.3820, longitude: 88.2050 },
};

export interface DemoStep {
  number: number;
  title: string;
  explanation: string;
  phase: 'TOURIST_PREP' | 'LIVE_JOURNEY' | 'OFFLINE_SURVIVAL' | 'ESCALATION' | 'AUTHORITY_NEXUS' | 'RESOLUTION';
  riskInputs?: RiskEngineInputs;
  expectedMode?: JourneyMode;
  targetView: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    number: 1,
    title: 'Safety Pass Issuance',
    explanation: 'Tourist generates verified biometric credentials with zero continuous journey tracking exposure (Ghost Mode).',
    phase: 'TOURIST_PREP',
    targetView: 'SAFETY_PASS',
  },
  {
    number: 2,
    title: 'Journey Safety Contract',
    explanation: 'Deterministic route corridor from Yuksom to Dzongri created with local Regional Safety Pack downloaded to IndexedDB.',
    phase: 'TOURIST_PREP',
    targetView: 'JOURNEY_CONTRACT',
  },
  {
    number: 3,
    title: 'Start Live Journey',
    explanation: 'TRINETRA Core begins local predictive evaluation in NOMAD mode with all telemetry signals nominal.',
    phase: 'LIVE_JOURNEY',
    riskInputs: {
      routeDeviationKm: 0,
      hazardSeverity: 0,
      inactivityMinutes: 0,
      connectivity: ConnectivityState.ONLINE,
      missedCheckins: 0,
      localHour: 10,
      batteryPercent: 95,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.NOMAD,
    targetView: 'LIVE_MONITOR',
  },
  {
    number: 4,
    title: 'Simulate 1.4 km Route Deviation',
    explanation: 'Tourist drifts 1.4 km outside corridor; TRINETRA transitions from NOMAD to WATCH mode without alerting authorities.',
    phase: 'LIVE_JOURNEY',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0,
      inactivityMinutes: 0,
      connectivity: ConnectivityState.ONLINE,
      missedCheckins: 0,
      localHour: 11,
      batteryPercent: 90,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.WATCH,
    targetView: 'LIVE_MONITOR',
  },
  {
    number: 5,
    title: 'Approach VERIFIED Landslide Hazard',
    explanation: 'Authority-verified landslide proximity elevates risk score to 60 (GUARDIAN mode), priming the Human-in-the-Loop check.',
    phase: 'LIVE_JOURNEY',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0.85,
      inactivityMinutes: 0,
      connectivity: ConnectivityState.ONLINE,
      missedCheckins: 0,
      localHour: 12,
      batteryPercent: 82,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.GUARDIAN,
    targetView: 'LIVE_MONITOR',
  },
  {
    number: 6,
    title: 'Simulate Connectivity Loss',
    explanation: 'Cellular connection drops completely. Local TRINETRA Core continues full evaluation seamlessly on-device.',
    phase: 'OFFLINE_SURVIVAL',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0.85,
      inactivityMinutes: 0,
      connectivity: ConnectivityState.OFFLINE,
      missedCheckins: 0,
      localHour: 12,
      batteryPercent: 78,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.GUARDIAN,
    targetView: 'SURVIVAL_MODE',
  },
  {
    number: 7,
    title: 'Show Survival Mode & Shadow Corridor',
    explanation: 'Cached Regional Safety Pack provides offline directional guidance toward the nearest safe high-altitude shelter.',
    phase: 'OFFLINE_SURVIVAL',
    targetView: 'SHADOW_CORRIDOR',
  },
  {
    number: 8,
    title: 'Simulate Prolonged Inactivity',
    explanation: 'No movement detected for 45 minutes in an active hazard zone, compounding multi-sensor risk telemetry.',
    phase: 'OFFLINE_SURVIVAL',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0.85,
      inactivityMinutes: 45,
      connectivity: ConnectivityState.OFFLINE,
      missedCheckins: 0,
      localHour: 13,
      batteryPercent: 70,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.GUARDIAN,
    targetView: 'SURVIVAL_MODE',
  },
  {
    number: 9,
    title: 'Trigger Proactive Safety Check',
    explanation: 'Multi-signal anomalies cross verification threshold (score >= 55) triggering a non-alarming Human-in-the-Loop sheet.',
    phase: 'ESCALATION',
    targetView: 'SAFETY_CHECK',
  },
  {
    number: 10,
    title: 'Simulate No Response (Missed Check-in)',
    explanation: 'Tourist fails to acknowledge prompt; missed check-in counter increments locally in IndexedDB.',
    phase: 'ESCALATION',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0.85,
      inactivityMinutes: 45,
      connectivity: ConnectivityState.OFFLINE,
      missedCheckins: 1,
      localHour: 14,
      batteryPercent: 65,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.SENTINEL,
    targetView: 'SAFETY_CHECK',
  },
  {
    number: 11,
    title: 'Cross Multi-Evidence Threshold',
    explanation: 'SENTINEL mode + high confidence + 4 independent signals (deviation, hazard, inactivity, missed check-in) confirm emergency.',
    phase: 'ESCALATION',
    riskInputs: {
      routeDeviationKm: 1.4,
      hazardSeverity: 0.85,
      inactivityMinutes: 45,
      connectivity: ConnectivityState.OFFLINE,
      missedCheckins: 2,
      localHour: 14,
      batteryPercent: 60,
      explicitSOS: false,
    },
    expectedMode: JourneyMode.SENTINEL,
    targetView: 'ESCALATION_TRIGGER',
  },
  {
    number: 12,
    title: 'Generate Offline Rescue Capsule',
    explanation: 'Tamper-evident cryptographically structured Rescue Capsule generated on-device and queued in local IndexedDB.',
    phase: 'ESCALATION',
    targetView: 'RESCUE_CAPSULE',
  },
  {
    number: 13,
    title: 'Restore Connectivity',
    explanation: 'Device re-enters cellular satellite range; connectivity listener detects ONLINE status.',
    phase: 'ESCALATION',
    targetView: 'ONLINE_RESTORED',
  },
  {
    number: 14,
    title: 'Synchronize Queued Emergency Events',
    explanation: 'Offline event queue pushes Rescue Capsule & incident timeline to Firestore with stable idempotency keys.',
    phase: 'ESCALATION',
    targetView: 'SYNC_PROGRESS',
  },
  {
    number: 15,
    title: 'Open TRINETRA Nexus (Authority View)',
    explanation: 'Operations dashboard surfaces the escalated SENTINEL incident without revealing non-critical tourist location tracking.',
    phase: 'AUTHORITY_NEXUS',
    targetView: 'AUTHORITY_NEXUS',
  },
  {
    number: 16,
    title: 'Inspect Incident Detail & Evidence',
    explanation: 'Authority verifies multi-sensor timeline, last safe coordinates, and reason breakdown (Route Deviation + Hazard Proximity).',
    phase: 'AUTHORITY_NEXUS',
    targetView: 'AUTHORITY_INCIDENT',
  },
  {
    number: 17,
    title: 'Assign Mountain Rescue MR-04',
    explanation: 'Rule-based engine recommends specialized Mountain Rescue unit ("Nearest is not always safest" terrain advisory).',
    phase: 'AUTHORITY_NEXUS',
    targetView: 'ASSIGN_RESPONDER',
  },
  {
    number: 18,
    title: 'Live Tourist Status Synchronization',
    explanation: 'Tourist app updates immediately via Firestore listener showing assigned unit "Mountain Rescue MR-04" on the way.',
    phase: 'RESOLUTION',
    targetView: 'TOURIST_EMERGENCY_STATUS',
  },
  {
    number: 19,
    title: 'Resolve Incident & Archive Audit Trail',
    explanation: 'Authority marks emergency resolved; complete cryptographically signed evidence trail permanently preserved for review.',
    phase: 'RESOLUTION',
    targetView: 'RESOLVE_INCIDENT',
  },
];
