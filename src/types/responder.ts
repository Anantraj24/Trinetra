export interface Responder {
  id: string;
  callsign: string;
  type: 'MOUNTAIN_RESCUE' | 'POLICE' | 'AMBULANCE';
  capabilities: string[];
  availability: 'AVAILABLE' | 'ON_CALL' | 'BUSY';
  demoETA: string; // e.g. "~25 min"
  accessLimitations: string;
}

export const DEMO_RESPONDERS: Responder[] = [
  {
    id: 'resp-mr-04',
    callsign: 'Mountain Rescue MR-04',
    type: 'MOUNTAIN_RESCUE',
    capabilities: [
      'High-altitude extraction',
      'Rope rescue',
      'Wilderness navigation',
      'Hypothermia treatment',
    ],
    availability: 'AVAILABLE',
    demoETA: '~25 min',
    accessLimitations: 'Cannot operate above 5,200m or in active avalanche zones.',
  },
  {
    id: 'resp-pp-02',
    callsign: 'Police Patrol PP-02',
    type: 'POLICE',
    capabilities: [
      'Road access',
      'Communication relay',
      'First aid',
      'Area search',
    ],
    availability: 'AVAILABLE',
    demoETA: '~15 min',
    accessLimitations: 'No off-road capability. Limited to paved and gravel routes.',
  },
  {
    id: 'resp-am-07',
    callsign: 'Ambulance AM-07',
    type: 'AMBULANCE',
    capabilities: [
      'Advanced trauma care',
      'Defibrillation',
      'Oxygen therapy',
      'Patient transport',
    ],
    availability: 'ON_CALL',
    demoETA: '~35 min',
    accessLimitations: 'Road-access only. Cannot reach trail or off-grid locations directly.',
  },
];
