export type ConnectivityState = 'ONLINE' | 'POOR' | 'OFFLINE';
export type JourneyMode = 'NOMAD' | 'WATCH' | 'GUARDIAN' | 'SENTINEL';

export interface RiskEngineInputs {
  routeDeviationKm: number;
  hazardSeverity: number; // 0..1
  inactivityMinutes: number;
  connectivity: ConnectivityState;
  missedCheckins: number;
  localHour: number; // 0..23
  batteryPercent: number; // 0..100
  explicitSOS: boolean;
}

export interface RiskReason {
  signal: string;
  normalizedSeverity: number; // 0..1
  contribution: number; // points added to score
  explanation: string;
}

export interface RiskEngineOutputs {
  score: number; // 0..100
  confidence: number; // 0..1
  mode: JourneyMode;
  reasons: RiskReason[];
  shouldVerify: boolean;
  shouldEscalate: boolean;
}

export function evaluateRisk(inputs: RiskEngineInputs): RiskEngineOutputs {
  if (inputs.explicitSOS) {
    return {
      score: 100,
      confidence: 1.0,
      mode: 'SENTINEL',
      reasons: [{
        signal: 'Explicit SOS',
        normalizedSeverity: 1.0,
        contribution: 100,
        explanation: 'User manually triggered an SOS alert.'
      }],
      shouldVerify: false,
      shouldEscalate: true
    };
  }

  let score = 0;
  const reasons: RiskReason[] = [];
  let confidence = 1.0;

  // 1. Route Deviation
  if (inputs.routeDeviationKm > 0.5) {
    const severity = Math.min(inputs.routeDeviationKm / 5, 1.0);
    const contribution = Math.min(inputs.routeDeviationKm * 10, 40);
    score += contribution;
    reasons.push({
      signal: 'Route Deviation',
      normalizedSeverity: severity,
      contribution: Math.round(contribution),
      explanation: `Deviated ${inputs.routeDeviationKm.toFixed(1)}km from expected route.`
    });
  } else if (inputs.routeDeviationKm > 0.1) {
    score += 5;
    reasons.push({
      signal: 'Small Deviation',
      normalizedSeverity: 0.1,
      contribution: 5,
      explanation: 'Slight drift from center route.'
    });
  }

  // 2. Hazard Proximity
  if (inputs.hazardSeverity > 0) {
    const contribution = inputs.hazardSeverity * 35;
    score += contribution;
    reasons.push({
      signal: 'Hazard Proximity',
      normalizedSeverity: inputs.hazardSeverity,
      contribution: Math.round(contribution),
      explanation: 'In or near a known hazard zone.'
    });
  }

  // 3. Missed Check-ins
  if (inputs.missedCheckins > 0) {
    const severity = Math.min(inputs.missedCheckins / 3, 1.0);
    const contribution = Math.min(inputs.missedCheckins * 25, 45);
    score += contribution;
    reasons.push({
      signal: 'Missed Check-ins',
      normalizedSeverity: severity,
      contribution: Math.round(contribution),
      explanation: `Missed ${inputs.missedCheckins} scheduled check-ins.`
    });
  }

  // 4. Inactivity
  if (inputs.inactivityMinutes > 30) {
    const severity = Math.min((inputs.inactivityMinutes - 30) / 120, 1.0);
    const contribution = Math.min((inputs.inactivityMinutes - 30) / 4, 25);
    score += contribution;
    reasons.push({
      signal: 'Prolonged Inactivity',
      normalizedSeverity: severity,
      contribution: Math.round(contribution),
      explanation: `No movement detected for ${inputs.inactivityMinutes} minutes.`
    });
  }

  // 5. Connectivity
  if (inputs.connectivity === 'OFFLINE') {
    score += 10;
    confidence -= 0.3; // Lowers confidence as data gets stale
    reasons.push({
      signal: 'Connectivity Loss',
      normalizedSeverity: 1.0,
      contribution: 10,
      explanation: 'Device is offline. Tracking relies on stale data or offline sync.'
    });
  } else if (inputs.connectivity === 'POOR') {
    score += 5;
    confidence -= 0.1;
    reasons.push({
      signal: 'Poor Connectivity',
      normalizedSeverity: 0.5,
      contribution: 5,
      explanation: 'Network signal is weak.'
    });
  }

  // 6. Battery
  if (inputs.batteryPercent <= 20) {
    const severity = (20 - inputs.batteryPercent) / 20;
    const contribution = 10 + (severity * 10);
    score += contribution;
    reasons.push({
      signal: 'Low Battery',
      normalizedSeverity: Math.max(severity, 0.1),
      contribution: Math.round(contribution),
      explanation: `Battery critically low at ${inputs.batteryPercent}%.`
    });
  }

  // 7. Night Time
  if (inputs.localHour >= 19 || inputs.localHour < 6) {
    score += 5;
    reasons.push({
      signal: 'Night Operations',
      normalizedSeverity: 0.3,
      contribution: 5,
      explanation: 'Operating during night hours carries elevated risk.'
    });
  }

  // Normalize score
  score = Math.min(Math.round(score), 100);
  confidence = Math.max(confidence, 0.0);

  // Determine Mode
  let mode: JourneyMode = 'NOMAD';
  if (score >= 80) mode = 'SENTINEL';
  else if (score >= 55) mode = 'GUARDIAN';
  else if (score >= 30) mode = 'WATCH';

  // Determine Escalation & Verification
  const independentSignalsCount = reasons.length;
  
  let shouldEscalate = false;
  if (mode === 'SENTINEL' && confidence >= 0.75 && inputs.missedCheckins > 0 && independentSignalsCount >= 3) {
    shouldEscalate = true;
  }

  let shouldVerify = false;
  if (!shouldEscalate && score >= 55) {
    shouldVerify = true;
  }

  return {
    score,
    confidence,
    mode,
    reasons,
    shouldVerify,
    shouldEscalate
  };
}
