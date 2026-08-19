'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppSurface, GlassCard, PrimaryButton, SecondaryButton,
  SafetyPulseCard, TrustLevelBadge, StatusPill, ShadowCorridorCard,
  JourneyMap, QRCodePlaceholder, MetricCard
} from '@/components/ui';
import { evaluateRisk, RiskEngineInputs } from '@/lib/riskEngine';
import {
  DEMO_STEPS, DEMO_TOURIST_PASS, DEMO_JOURNEY_CONTRACT,
  DEMO_LANDSLIDE_HAZARD, DemoStep
} from '@/lib/demoScenario';
import { DEMO_RESPONDERS } from '@/types/responder';
import { JourneyMode, ConnectivityState, IncidentStatus, HazardTrustLevel } from '@/types';
import {
  ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2,
  ShieldAlert, ShieldCheck, Wifi, WifiOff, MapPin, Radio,
  Activity, UserCheck, CheckCircle2, Clock, FileJson, AlertTriangle,
  Play, Sparkles, Mountain, Shield, Eye, ArrowRight
} from 'lucide-react';

export default function SIHGuidedDemoPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isAssigned, setIsAssigned] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [synced, setSynced] = useState<boolean>(false);

  const step: DemoStep = DEMO_STEPS[currentStepIndex];

  // Dynamic Risk Engine Calculation based on step inputs
  const currentRiskOutputs = useMemo(() => {
    if (!step.riskInputs) {
      return evaluateRisk({
        routeDeviationKm: 0,
        hazardSeverity: 0,
        inactivityMinutes: 0,
        connectivity: ConnectivityState.ONLINE,
        missedCheckins: 0,
        localHour: 10,
        batteryPercent: 95,
        explicitSOS: false,
      });
    }
    return evaluateRisk(step.riskInputs);
  }, [step.riskInputs]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (nextIdx >= 13) setSynced(true);
      if (nextIdx >= 16) setIsAssigned(true);
      if (nextIdx >= 18) setIsResolved(true);
    }
  }, [currentStepIndex]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (prevIdx < 13) setSynced(false);
      if (prevIdx < 16) setIsAssigned(false);
      if (prevIdx < 18) setIsResolved(false);
    }
  }, [currentStepIndex]);

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsAssigned(false);
    setIsResolved(false);
    setSynced(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'p') {
        setIsPresentationMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Render View by Target
  const renderStepContent = () => {
    switch (step.targetView) {
      // Step 1: Safety Pass
      case 'SAFETY_PASS':
        return (
          <div className="flex flex-col items-center max-w-lg mx-auto w-full gap-6 animate-in fade-in duration-300">
            <div className="w-full bg-[#8B8178]/15 border border-[#8B8178]/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-taupe-dark text-white flex items-center justify-center font-black text-xl">
                    TRI
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-taupe-dark">{DEMO_TOURIST_PASS.name}</h2>
                    <p className="text-xs font-mono text-taupe">PASS: TRI-SIH-2024-001</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-success-soft text-success text-xs font-bold rounded-full">ACTIVE</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white/60 p-3 rounded-xl">
                  <span className="text-taupe font-semibold uppercase">Blood Group</span>
                  <div className="text-sm font-bold text-taupe-dark mt-0.5">{DEMO_TOURIST_PASS.bloodGroup}</div>
                </div>
                <div className="bg-white/60 p-3 rounded-xl">
                  <span className="text-taupe font-semibold uppercase">Expiry</span>
                  <div className="text-sm font-bold text-taupe-dark mt-0.5">Aug 26, 2026</div>
                </div>
              </div>

              <div className="bg-white/60 p-3 rounded-xl text-xs">
                <span className="text-taupe font-semibold uppercase">Emergency Contact</span>
                <div className="text-sm font-medium text-taupe-dark mt-0.5">{DEMO_TOURIST_PASS.emergencyContact}</div>
              </div>

              <div className="p-3.5 bg-forest/10 rounded-2xl border border-forest/20 text-xs text-taupe-dark leading-relaxed">
                <strong className="text-forest">Ghost Mode Protected:</strong> Full journey is never continuously streamed to authority servers. Biometric safety credentials are only decrypted upon an escalated emergency.
              </div>

              <div className="flex justify-center pt-2">
                <QRCodePlaceholder identifier="AARAV-SIH-2024" />
              </div>
            </div>
          </div>
        );

      // Step 2: Journey Contract
      case 'JOURNEY_CONTRACT':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-sand-light">
                <h3 className="font-bold text-taupe-dark text-lg">Yuksom → Dzongri Route Contract</h3>
                <StatusPill status="success" label="DRAFT READY" />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-sand-light/60">
                  <span className="text-taupe">Origin Trailhead</span>
                  <span className="font-bold text-taupe-dark">Yuksom (1,780m)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sand-light/60">
                  <span className="text-taupe">Peak Destination</span>
                  <span className="font-bold text-taupe-dark">Dzongri View Point (3,950m)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sand-light/60">
                  <span className="text-taupe">Corridor Radius</span>
                  <span className="font-bold text-taupe-dark">500 meters</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sand-light/60">
                  <span className="text-taupe">Check-in Interval</span>
                  <span className="font-bold text-taupe-dark">Every 30 mins</span>
                </div>
              </div>

              <div className="bg-sand/20 p-4 rounded-2xl text-xs space-y-2 mt-2">
                <div className="font-bold text-taupe-dark flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-forest" /> Regional Safety Pack (Sikkim Alpha)
                </div>
                <div className="grid grid-cols-2 gap-1 text-taupe text-[11px]">
                  <span>✓ 1:25k Topo Vectors</span>
                  <span>✓ Offline Shadow Corridor</span>
                  <span>✓ 3 High-Altitude Huts</span>
                  <span>✓ SDMA Emergency Frequencies</span>
                </div>
              </div>
            </AppSurface>

            <div className="flex flex-col gap-4">
              <JourneyMap />
              <div className="text-center text-xs text-taupe italic">
                Interactive SVG Safety Corridor with precomputed fallback corridors.
              </div>
            </div>
          </div>
        );

      // Steps 3, 4, 5: Live Journey Monitor
      case 'LIVE_MONITOR':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
            <div className="flex flex-col gap-6">
              <SafetyPulseCard
                score={currentRiskOutputs.score}
                confidence={currentRiskOutputs.confidence}
                mode={currentRiskOutputs.mode}
              />

              <AppSurface className="p-6">
                <h3 className="font-bold text-taupe-dark mb-3 text-base">Active Journey Telemetry</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-sand/15 rounded-xl">
                    <span className="text-taupe font-semibold">Route Drift</span>
                    <div className="text-sm font-bold text-taupe-dark mt-0.5">
                      {step.riskInputs?.routeDeviationKm || 0} km
                    </div>
                  </div>
                  <div className="p-3 bg-sand/15 rounded-xl">
                    <span className="text-taupe font-semibold">Connectivity</span>
                    <div className="text-sm font-bold text-forest mt-0.5 flex items-center gap-1">
                      <Wifi size={13} /> {step.riskInputs?.connectivity || 'ONLINE'}
                    </div>
                  </div>
                  <div className="p-3 bg-sand/15 rounded-xl">
                    <span className="text-taupe font-semibold">Battery</span>
                    <div className="text-sm font-bold text-taupe-dark mt-0.5">{step.riskInputs?.batteryPercent || 95}%</div>
                  </div>
                  <div className="p-3 bg-sand/15 rounded-xl">
                    <span className="text-taupe font-semibold">Risk Mode</span>
                    <div className="text-sm font-bold text-taupe-dark mt-0.5">{currentRiskOutputs.mode}</div>
                  </div>
                </div>
              </AppSurface>
            </div>

            <div className="flex flex-col gap-6">
              <AppSurface className="p-6">
                <h3 className="font-bold text-taupe-dark mb-4 text-base">Proximity Environmental Threat</h3>
                <div className="border border-sand-light p-4 rounded-2xl bg-white shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-alert font-bold text-sm">
                      <AlertTriangle size={16} /> {DEMO_LANDSLIDE_HAZARD.type}
                    </div>
                    <TrustLevelBadge level={DEMO_LANDSLIDE_HAZARD.trustLevel} />
                  </div>
                  <p className="text-xs text-taupe">{DEMO_LANDSLIDE_HAZARD.description}</p>
                  <div className="text-[11px] text-taupe flex justify-between pt-2 border-t border-sand-light">
                    <span>Source: {DEMO_LANDSLIDE_HAZARD.source}</span>
                    <span className="font-bold text-alert">Severity: 85%</span>
                  </div>
                </div>
              </AppSurface>

              <AppSurface className="p-6">
                <h3 className="font-bold text-taupe-dark mb-3 text-base">Real-Time Risk Multipliers</h3>
                {currentRiskOutputs.reasons.length === 0 ? (
                  <p className="text-xs text-taupe italic">All parameters within nominal safety thresholds.</p>
                ) : (
                  <div className="space-y-2">
                    {currentRiskOutputs.reasons.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-sand/15 rounded-xl text-xs">
                        <span className="font-bold text-taupe-dark">{r.signal}</span>
                        <span className="font-black text-taupe-dark">+{r.contribution} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </AppSurface>
            </div>
          </div>
        );

      // Steps 6, 8: Survival Mode
      case 'SURVIVAL_MODE':
        return (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="bg-alert/10 border border-alert/20 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WifiOff className="text-alert" size={24} />
                <div>
                  <div className="font-black text-alert text-sm uppercase tracking-wider">Survival Mode Active</div>
                  <div className="text-xs text-taupe-dark">Cellular disconnected. TRINETRA Core operating autonomously on-device.</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-alert text-white rounded-full text-xs font-bold">OFFLINE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm">
                <div className="text-xs text-taupe uppercase font-semibold">TRINETRA Core</div>
                <div className="text-lg font-bold text-forest mt-1">Local (WASM/TS)</div>
                <div className="text-[11px] text-taupe mt-0.5">Evaluating on-device</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm">
                <div className="text-xs text-taupe uppercase font-semibold">IndexedDB Cache</div>
                <div className="text-lg font-bold text-taupe-dark mt-1">Yuksom Regional Pack</div>
                <div className="text-[11px] text-taupe mt-0.5">Offline vector grid</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm">
                <div className="text-xs text-taupe uppercase font-semibold">Event Queue</div>
                <div className="text-lg font-bold text-orange-600 mt-1">Queued Locally</div>
                <div className="text-[11px] text-taupe mt-0.5">Sync on reconnection</div>
              </div>
            </div>

            <SafetyPulseCard
              score={currentRiskOutputs.score}
              confidence={currentRiskOutputs.confidence}
              mode={currentRiskOutputs.mode}
            />
          </div>
        );

      // Step 7: Shadow Corridor
      case 'SHADOW_CORRIDOR':
        return (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-300">
            <ShadowCorridorCard
              hazard={DEMO_LANDSLIDE_HAZARD}
              nearestCheckpoint="Tsokha Ridge Alpine Shelter (3,050m)"
              distanceKm={3.8}
              direction="North-East"
            />
          </div>
        );

      // Steps 9, 10: Human in the Loop Safety Check
      case 'SAFETY_CHECK':
        return (
          <div className="max-w-lg mx-auto w-full animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-forest/30 shadow-xl flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-forest/15 text-forest flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-taupe-dark">TRINETRA Safety Check</h3>
                  <p className="text-xs text-taupe">We detected multiple unusual journey signals.</p>
                </div>
              </div>

              <div className="space-y-2 bg-sand/15 p-4 rounded-2xl text-xs">
                <div className="font-bold text-taupe-dark mb-1">Detected Risk Evidence:</div>
                <div className="flex items-center justify-between text-taupe-dark">
                  <span>• 1.4 km Trail Drift</span>
                  <span className="font-bold">+25 pts</span>
                </div>
                <div className="flex items-center justify-between text-taupe-dark">
                  <span>• Bakhim Landslide Zone Proximity</span>
                  <span className="font-bold">+35 pts</span>
                </div>
                <div className="flex items-center justify-between text-taupe-dark">
                  <span>• Prolonged Inactivity (45m)</span>
                  <span className="font-bold">+15 pts</span>
                </div>
              </div>

              {currentStepIndex === 9 && (
                <div className="p-3 bg-orange-100 border border-orange-200 rounded-xl text-xs text-orange-800 font-medium">
                  Simulation: Tourist does not respond within check-in window. Missed check-in count incremented to 1.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 rounded-2xl bg-forest text-white font-bold text-sm hover:bg-forest/90 transition-all">
                  I&apos;M SAFE
                </button>
                <button className="py-3 px-4 rounded-2xl bg-alert text-white font-bold text-sm hover:bg-red-600 transition-all">
                  NEED HELP
                </button>
              </div>
            </div>
          </div>
        );

      // Step 11: Multi-Evidence Threshold Trigger
      case 'ESCALATION_TRIGGER':
        return (
          <div className="max-w-xl mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-8 border-2 border-alert/40 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-alert flex items-center justify-center">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-alert">SENTINEL Threshold Crossed</h3>
                  <p className="text-xs text-taupe">Auto-escalation triggered by multi-sensor evidence.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs bg-sand/15 p-4 rounded-2xl">
                <div className="font-bold text-taupe-dark text-sm mb-2">TRINETRA Escalation Criteria:</div>
                <div className="flex items-center justify-between text-forest font-bold">
                  <span>✓ SENTINEL Mode (Score ≥ 80)</span>
                  <span>90 / 100</span>
                </div>
                <div className="flex items-center justify-between text-forest font-bold">
                  <span>✓ High Confidence (≥ 0.75)</span>
                  <span>88%</span>
                </div>
                <div className="flex items-center justify-between text-forest font-bold">
                  <span>✓ ≥ 1 Missed Check-in</span>
                  <span>2 Missed</span>
                </div>
                <div className="flex items-center justify-between text-forest font-bold">
                  <span>✓ ≥ 3 Independent Signals</span>
                  <span>4 Signals (Deviation + Hazard + Inactivity + Missed)</span>
                </div>
              </div>

              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl font-medium">
                Generating Offline Rescue Capsule with local cryptographic signature.
              </div>
            </AppSurface>
          </div>
        );

      // Step 12: Rescue Capsule View
      case 'RESCUE_CAPSULE':
        return (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-300">
            <GlassCard className="p-6 sm:p-8 border-2 border-taupe-dark/30 shadow-xl flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-taupe-dark text-white flex items-center justify-center">
                    <FileJson size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-taupe-dark">Rescue Capsule #CAP-SIH-992</h3>
                    <p className="text-xs font-mono text-taupe">Integrity HMAC: a4f8c9...d2e1 (Offline Queued)</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">SENTINEL (90)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-sand/20 rounded-xl">
                  <span className="text-taupe font-semibold">Confidence</span>
                  <div className="text-sm font-bold text-taupe-dark mt-0.5">88%</div>
                </div>
                <div className="p-3 bg-sand/20 rounded-xl">
                  <span className="text-taupe font-semibold">Trigger</span>
                  <div className="text-sm font-bold text-alert mt-0.5">AUTO_ESCALATION</div>
                </div>
                <div className="p-3 bg-sand/20 rounded-xl">
                  <span className="text-taupe font-semibold">Deviation</span>
                  <div className="text-sm font-bold text-taupe-dark mt-0.5">1.4 km</div>
                </div>
                <div className="p-3 bg-sand/20 rounded-xl">
                  <span className="text-taupe font-semibold">Blood Group</span>
                  <div className="text-sm font-bold text-taupe-dark mt-0.5">O+</div>
                </div>
              </div>

              <div className="bg-sand/15 p-4 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-taupe-dark">Last Safe GPS Snapshot:</div>
                <div className="font-mono text-taupe-dark">27.3714°N, 88.2226°E (Yuksom Ridge) • Altitude: 2,420m</div>
              </div>
            </GlassCard>
          </div>
        );

      // Step 13: Online Restored
      case 'ONLINE_RESTORED':
        return (
          <div className="max-w-md mx-auto w-full text-center flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-success-soft text-success flex items-center justify-center">
              <Wifi size={40} />
            </div>
            <h3 className="text-2xl font-black text-taupe-dark">Connectivity Re-Established</h3>
            <p className="text-sm text-taupe">Cellular/Satellite link active. TRINETRA background sync daemon initiated.</p>
          </div>
        );

      // Step 14: Sync Progress
      case 'SYNC_PROGRESS':
        return (
          <div className="max-w-xl mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-taupe-dark">Offline Sync Complete</h3>
                  <p className="text-xs text-taupe">Idempotent queue flushed to Firestore collections.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-success-soft rounded-xl flex justify-between font-medium text-success">
                  <span>✓ Rescue Capsule #CAP-SIH-992</span>
                  <span>SYNCED</span>
                </div>
                <div className="p-3 bg-success-soft rounded-xl flex justify-between font-medium text-success">
                  <span>✓ 4 Incident Events (Deviation, Hazard, Inactivity, Escalation)</span>
                  <span>SYNCED</span>
                </div>
                <div className="p-3 bg-success-soft rounded-xl flex justify-between font-medium text-success">
                  <span>✓ Server HMAC Verification & Timestamp Stamp</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            </AppSurface>
          </div>
        );

      // Step 15: Authority Nexus Overview
      case 'AUTHORITY_NEXUS':
        return (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Active Journeys" value="1" />
              <MetricCard title="NOMAD/WATCH" value="0" />
              <MetricCard title="GUARDIAN" value="0" />
              <MetricCard title="Open SENTINEL" value="1" />
            </div>

            <AppSurface className="p-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-sand-light">
                <h3 className="font-bold text-taupe-dark text-lg">Nexus Exception Queue</h3>
                <span className="text-xs font-semibold text-alert bg-red-100 px-3 py-1 rounded-full">1 CRITICAL</span>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-taupe uppercase border-b border-sand-light">
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Tourist</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Top Evidence</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-light/50 bg-red-50/40">
                    <td className="p-3 font-mono font-bold text-taupe-dark">INC-SIH-001</td>
                    <td className="p-3 font-bold text-taupe-dark">Aarav Sharma</td>
                    <td className="p-3 font-black text-alert">90</td>
                    <td className="p-3 text-taupe">1.4km drift, Landslide, Inactivity (45m)</td>
                    <td className="p-3 font-bold text-alert">CREATED</td>
                    <td className="p-3 text-right">
                      <button className="px-3 py-1.5 bg-taupe-dark text-white rounded-lg font-bold">Open</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </AppSurface>
          </div>
        );

      // Step 16: Authority Incident Details
      case 'AUTHORITY_INCIDENT':
        return (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <AppSurface className="p-6">
                <h3 className="font-bold text-taupe-dark mb-3 text-base">Incident Summary & Evidence</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-sand/15 rounded-xl flex justify-between">
                    <span className="text-taupe">Tourist:</span>
                    <span className="font-bold text-taupe-dark">Aarav Sharma (O+ / +91-9876543210)</span>
                  </div>
                  <div className="p-3 bg-sand/15 rounded-xl flex justify-between">
                    <span className="text-taupe">GPS Coordinate:</span>
                    <span className="font-mono font-bold text-taupe-dark">27.3714°N, 88.2226°E</span>
                  </div>
                  <div className="p-3 bg-sand/15 rounded-xl flex justify-between">
                    <span className="text-taupe">Trail Section:</span>
                    <span className="font-bold text-taupe-dark">Bakhim Gorge Slope (Zone 4)</span>
                  </div>
                </div>
              </AppSurface>

              <AppSurface className="p-6">
                <h3 className="font-bold text-taupe-dark mb-3 text-base">Chronological Evidence Timeline</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-sand/20 rounded-xl flex justify-between">
                    <span>1. Route deviation detected (+1.4km drift)</span>
                    <span className="text-taupe">07:45</span>
                  </div>
                  <div className="p-2.5 bg-sand/20 rounded-xl flex justify-between">
                    <span>2. In proximity to VERIFIED Landslide</span>
                    <span className="text-taupe">08:00</span>
                  </div>
                  <div className="p-2.5 bg-sand/20 rounded-xl flex justify-between">
                    <span>3. Inactivity 45 mins</span>
                    <span className="text-taupe">08:45</span>
                  </div>
                  <div className="p-2.5 bg-red-100 text-red-800 font-bold rounded-xl flex justify-between">
                    <span>4. Safety Check Missed → AUTO ESCALATION</span>
                    <span>09:00</span>
                  </div>
                </div>
              </AppSurface>
            </div>

            <div className="flex flex-col gap-6">
              <SafetyPulseCard score={90} confidence={0.88} mode={JourneyMode.SENTINEL} />
            </div>
          </div>
        );

      // Step 17: Assign Mountain Rescue MR-04
      case 'ASSIGN_RESPONDER':
        return (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-6 sm:p-8 border-2 border-forest/30 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-taupe-dark">Responder Recommendation</h3>
                  <p className="text-xs text-taupe">&quot;Nearest is not always safest.&quot; Terrain & capability advisory.</p>
                </div>
                <span className="px-3 py-1 bg-forest/15 text-forest text-xs font-bold rounded-full">RECOMMENDED</span>
              </div>

              <div className="p-5 bg-forest/5 border border-forest/20 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-forest/30 flex items-center justify-center text-forest">
                    <Mountain size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-taupe-dark text-base">Mountain Rescue MR-04</h4>
                    <p className="text-xs text-taupe">ETA: ~25 mins • High-Altitude & Rope Extraction Certified</p>
                  </div>
                </div>
                <p className="text-xs text-taupe-dark leading-relaxed">
                  Reasoning: Police units cannot access off-road gorge terrain. MR-04 possesses wilderness navigation and hypothermia trauma equipment required for Yuksom-Dzongri trail conditions.
                </p>
              </div>

              <PrimaryButton onClick={handleNext} className="w-full py-3.5 flex items-center justify-center gap-2">
                <UserCheck size={18} /> Confirm Assignment: MR-04
              </PrimaryButton>
            </AppSurface>
          </div>
        );

      // Step 18: Tourist Live Status
      case 'TOURIST_EMERGENCY_STATUS':
        return (
          <div className="max-w-md mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-6 sm:p-8 flex flex-col gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 mx-auto flex items-center justify-center animate-pulse">
                <Activity size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-taupe-dark">Help is Dispatched</h3>
                <p className="text-xs text-taupe mt-1">Responder assigned by TRINETRA Nexus Command.</p>
              </div>

              <div className="p-4 bg-sand/20 rounded-2xl text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-taupe font-semibold">Assigned Unit:</span>
                  <span className="font-bold text-taupe-dark">Mountain Rescue MR-04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe font-semibold">Estimated ETA:</span>
                  <span className="font-bold text-forest">~20 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe font-semibold">Safe Action:</span>
                  <span className="font-bold text-taupe-dark">Remain at current rock shelter</span>
                </div>
              </div>
            </AppSurface>
          </div>
        );

      // Step 19: Resolve Incident
      case 'RESOLVE_INCIDENT':
        return (
          <div className="max-w-md mx-auto w-full animate-in fade-in duration-300">
            <AppSurface className="p-8 flex flex-col items-center text-center gap-5 border-2 border-success/30">
              <div className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-taupe-dark">Incident Successfully Resolved</h3>
                <p className="text-xs text-taupe mt-1">Tourist safe. Audit trail permanently sealed in immutable record.</p>
              </div>
              <div className="p-4 bg-sand/15 rounded-2xl text-xs text-taupe-dark text-left w-full space-y-1.5">
                <div>✓ Rescue capsule signed by HMAC SHA-256</div>
                <div>✓ Zero surveillance leak of private nomad journey</div>
                <div>✓ Complete SIH 19-Step Scenario validated</div>
              </div>
              <PrimaryButton onClick={handleRestart} className="w-full mt-2">
                <RotateCcw size={16} /> Restart SIH Demo
              </PrimaryButton>
            </AppSurface>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Demo Bar */}
      {!isPresentationMode && (
        <header className="bg-white/90 backdrop-blur-md border-b border-sand-light sticky top-0 z-40 px-4 py-3 flex flex-col gap-2">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-taupe-dark text-white font-black text-sm flex items-center justify-center">
                TRI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-forest tracking-wider">SIH 2024 Guided Demo</span>
                  <span className="text-xs font-mono bg-sand-light px-2 py-0.5 rounded text-taupe-dark">
                    Step {step.number} of {DEMO_STEPS.length}
                  </span>
                </div>
                <h1 className="text-base font-bold text-taupe-dark truncate">{step.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPresentationMode(true)}
                className="p-2 text-taupe hover:text-taupe-dark hover:bg-sand-light rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Presentation Mode (P)"
              >
                <Maximize2 size={15} /> Presentation
              </button>
              <button
                onClick={handleRestart}
                className="p-2 text-taupe hover:text-alert hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Restart Demo (R)"
              >
                <RotateCcw size={15} /> Restart
              </button>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="max-w-7xl mx-auto w-full bg-forest/10 border border-forest/20 rounded-xl px-4 py-2 text-xs text-taupe-dark flex items-center gap-2">
            <Sparkles size={15} className="text-forest shrink-0" />
            <span className="font-medium">{step.explanation}</span>
          </div>
        </header>
      )}

      {/* Floating Presentation Mode Exit Toggle */}
      {isPresentationMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-sand-light shadow-md">
          <span className="text-xs font-bold text-taupe">Step {step.number}/{DEMO_STEPS.length}</span>
          <button
            onClick={() => setIsPresentationMode(false)}
            className="p-1 hover:bg-sand-light rounded-full text-taupe-dark"
            title="Exit Presentation Mode (P)"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col justify-center max-w-7xl mx-auto w-full">
        {renderStepContent()}
      </main>

      {/* Bottom Floating Step Controller */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-sand-light py-3 px-4 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 rounded-full border border-sand-light font-bold text-xs text-taupe-dark hover:bg-sand-light transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'bg-forest scale-125'
                    : idx < currentStepIndex
                    ? 'bg-sand-dark'
                    : 'bg-sand-light'
                }`}
                title={`Step ${s.number}: ${s.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-taupe-dark text-white font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-full bg-forest text-white font-bold text-xs hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-md"
              >
                <RotateCcw size={16} /> Finish & Restart
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
