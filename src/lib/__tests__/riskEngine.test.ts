import { describe, it, expect } from 'vitest';
import { evaluateRisk, RiskEngineInputs } from '../riskEngine';

const baseInput: RiskEngineInputs = {
  routeDeviationKm: 0,
  hazardSeverity: 0,
  inactivityMinutes: 0,
  connectivity: 'ONLINE',
  missedCheckins: 0,
  localHour: 12,
  batteryPercent: 80,
  explicitSOS: false,
};

describe('TRINETRA Risk Engine', () => {
  it('handles a normal journey', () => {
    const result = evaluateRisk({ ...baseInput });
    expect(result.score).toBe(0);
    expect(result.mode).toBe('NOMAD');
    expect(result.shouldEscalate).toBe(false);
    expect(result.shouldVerify).toBe(false);
  });

  it('handles small deviation (GPS noise)', () => {
    const result = evaluateRisk({ ...baseInput, routeDeviationKm: 0.2 });
    expect(result.score).toBe(5);
    expect(result.mode).toBe('NOMAD');
    expect(result.reasons[0].signal).toBe('Small Deviation');
  });

  it('handles resting without danger', () => {
    const result = evaluateRisk({ ...baseInput, inactivityMinutes: 45 });
    // 45 mins -> 15 mins over threshold -> 15/4 = 3.75 -> ~4 points
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(30);
    expect(result.mode).toBe('NOMAD');
  });

  it('handles verified hazard only', () => {
    const result = evaluateRisk({ ...baseInput, hazardSeverity: 0.9 });
    // 0.9 * 35 = 31.5 -> 32
    expect(result.score).toBe(32);
    expect(result.mode).toBe('WATCH');
  });

  it('handles connectivity loss only', () => {
    const result = evaluateRisk({ ...baseInput, connectivity: 'OFFLINE' });
    expect(result.score).toBe(10);
    expect(result.confidence).toBe(0.7);
    expect(result.mode).toBe('NOMAD');
  });

  it('handles route deviation + hazard', () => {
    const result = evaluateRisk({ 
      ...baseInput, 
      routeDeviationKm: 2.0, // 2 * 10 = 20 pts
      hazardSeverity: 0.8    // 0.8 * 35 = 28 pts
    });
    // total 48 pts
    expect(result.score).toBe(48);
    expect(result.mode).toBe('WATCH');
  });

  it('handles multi-signal Guardian', () => {
    const result = evaluateRisk({ 
      ...baseInput, 
      routeDeviationKm: 1.5, // 15 pts
      hazardSeverity: 0.5,   // 17.5 pts
      batteryPercent: 15,    // 15 pts
      localHour: 22          // 5 pts
    });
    // total ~52.5 pts, wait let's increase deviation to get >= 55
    const result2 = evaluateRisk({
      ...baseInput,
      routeDeviationKm: 3.0, // 30 pts
      hazardSeverity: 0.5,   // 18 pts
      batteryPercent: 10,    // 15 pts
      localHour: 22          // 5 pts
    });
    // total = 30 + 18 + 15 + 5 = 68 pts
    expect(result2.score).toBeGreaterThanOrEqual(55);
    expect(result2.mode).toBe('GUARDIAN');
    expect(result2.shouldVerify).toBe(true);
    expect(result2.shouldEscalate).toBe(false);
  });

  it('handles critical evidence with no response (escalation)', () => {
    const result = evaluateRisk({ 
      ...baseInput, 
      routeDeviationKm: 5.0, // 40 pts
      hazardSeverity: 1.0,   // 35 pts
      missedCheckins: 2,     // ~45 pts
    });
    // Total should be capped at 100
    expect(result.score).toBe(100);
    expect(result.mode).toBe('SENTINEL');
    expect(result.confidence).toBeGreaterThanOrEqual(0.75); // Should be 1.0
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    expect(result.shouldEscalate).toBe(true);
    expect(result.shouldVerify).toBe(false);
  });

  it('handles manual SOS bypassing thresholds', () => {
    const result = evaluateRisk({ 
      ...baseInput, 
      explicitSOS: true 
    });
    expect(result.score).toBe(100);
    expect(result.mode).toBe('SENTINEL');
    expect(result.shouldEscalate).toBe(true);
    expect(result.shouldVerify).toBe(false);
    expect(result.reasons[0].signal).toBe('Explicit SOS');
  });

  it('handles low-confidence situation', () => {
    const result = evaluateRisk({ 
      ...baseInput, 
      routeDeviationKm: 5.0, // 40 pts
      hazardSeverity: 1.0,   // 35 pts
      missedCheckins: 1,     // 25 pts
      connectivity: 'OFFLINE'// 10 pts, confidence drops by 0.3
    });
    // Total > 100 -> caps at 100.
    // Confidence = 0.7
    expect(result.score).toBe(100);
    expect(result.mode).toBe('SENTINEL');
    expect(result.confidence).toBeLessThan(0.75);
    // Escalation requires confidence >= 0.75
    expect(result.shouldEscalate).toBe(false);
    // When score >= 55 and NOT escalated, shouldVerify should be true
    expect(result.shouldVerify).toBe(true);
  });
});
