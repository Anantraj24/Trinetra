'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, PageHeader, GlassCard, PrimaryButton, StatusPill, SafetyCheckSheet, SafetyPulseCard } from '@/components/ui';
import { JourneyMode, ConnectivityState } from '@/types/index';
import { useAuth } from '@/contexts/AuthContext';
import { journeyService } from '@/services/journeyService';
import { incidentService } from '@/services/incidentService';
import { idbService } from '@/services/idbService';
import { Journey, JourneyStatus } from '@/types/journey';
import { IncidentEventType } from '@/types/incident';
import { evaluateRisk, RiskEngineInputs, RiskEngineOutputs } from '@/lib/riskEngine';
import { ShieldAlert, RefreshCw, Settings2 } from 'lucide-react';

export default function LiveJourneyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo Controls State
  const [demoInputs, setDemoInputs] = useState<RiskEngineInputs>({
    routeDeviationKm: 0,
    hazardSeverity: 0,
    inactivityMinutes: 0,
    connectivity: ConnectivityState.ONLINE,
    missedCheckins: 0,
    localHour: new Date().getHours(),
    batteryPercent: 80,
    explicitSOS: false,
  });

  const [riskOutputs, setRiskOutputs] = useState<RiskEngineOutputs | null>(null);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState(false);

  // Safety Check State
  const [isSafetyCheckOpen, setIsSafetyCheckOpen] = useState(false);
  const [lastAcknowledgedScore, setLastAcknowledgedScore] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchActiveJourney = async () => {
      try {
        // Try idb first
        let active = await idbService.getFirstActiveJourney();
        if (!active && user?.uid) {
          // fallback to firestore
          active = await journeyService.getActiveJourney(user.uid) || undefined;
          if (active) {
            await idbService.saveActiveJourney(active);
          }
        }
        setJourney(active || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveJourney();
  }, [user]);

  const handleAutoEscalation = async (score: number) => {
    if (!journey || !user?.uid || journey.status === JourneyStatus.SOS) return;
    try {
      await incidentService.createIncident(journey.id, user.uid, "TRINETRA auto-escalated due to critical evidence and missing check-ins.", score);
      await incidentService.addIncidentEvent(journey.id, IncidentEventType.SYSTEM_ESCALATION, "System auto-escalated to SOS.");
      await journeyService.updateJourneyStatus(journey.id, JourneyStatus.SOS);
      
      const j = await idbService.getFirstActiveJourney();
      if (j && j.id === journey.id) {
        j.status = JourneyStatus.SOS;
        await idbService.saveActiveJourney(j);
      }

      router.push('/tourist/emergency');
    } catch (err) {
      console.error(err);
    }
  };

  // Evaluate risk whenever demo inputs change
  useEffect(() => {
    if (!journey) return;
    const outputs = evaluateRisk(demoInputs);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRiskOutputs(outputs);

    // Trigger Safety Check
    if (outputs.shouldVerify && outputs.score > lastAcknowledgedScore) {
      setIsSafetyCheckOpen(true);
    }

    // Trigger Auto-Escalation
    if (outputs.shouldEscalate) {
      handleAutoEscalation(outputs.score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoInputs, journey, lastAcknowledgedScore]);

  const handleDemoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    
    if (type === 'number') parsedValue = parseFloat(value) || 0;
    if (type === 'range') parsedValue = parseFloat(value) || 0;
    if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setDemoInputs(prev => ({ ...prev, [name]: parsedValue }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Human-in-the-loop Actions
  const handleSafe = async () => {
    if (!journey) return;
    try {
      // Create Event
      await incidentService.addIncidentEvent(journey.id, IncidentEventType.SAFETY_CONFIRMED, "User manually confirmed safety during check.");
      
      // Reset local missed checkins for demo
      setDemoInputs(prev => ({ ...prev, missedCheckins: 0 }));
      setLastAcknowledgedScore(riskOutputs?.score || 0);
      setIsSafetyCheckOpen(false);
      showToast("Safety confirmed. TRINETRA stands by.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleHelp = async () => {
    if (!journey || !user?.uid) return;
    setIsSafetyCheckOpen(false);
    try {
      // Create Emergency Incident
      await incidentService.createIncident(journey.id, user.uid, "User explicitly requested help during Safety Check.", riskOutputs?.score || 100);
      await journeyService.updateJourneyStatus(journey.id, JourneyStatus.SOS);
      
      const j = await idbService.getFirstActiveJourney();
      if (j && j.id === journey.id) {
        j.status = JourneyStatus.SOS;
        await idbService.saveActiveJourney(j);
      }

      router.push('/tourist/emergency');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoResponse = () => {
    // Demo only
    setIsSafetyCheckOpen(false);
    setDemoInputs(prev => ({ ...prev, missedCheckins: prev.missedCheckins + 1 }));
    showToast("Simulating no response... missed checkins increased.");
  };


  if (loading) {
    return <div className="p-12 text-center text-taupe font-bold">Loading TRINETRA Link...</div>;
  }

  if (!journey) {
    return (
      <div className="flex-1 p-6 lg:p-12">
        <PageHeader title="Live Journey" subtitle="No active journey detected." />
        <PrimaryButton onClick={() => router.push('/tourist/journey/new')}>Create New Journey</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full relative pb-32">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Live Journey" subtitle="Active trip monitoring." className="mb-0" />
        <StatusPill status="success" label="ACTIVE" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core View */}
        <div className="flex flex-col gap-6">
          <SafetyPulseCard 
            score={riskOutputs?.score || 0} 
            confidence={riskOutputs?.confidence || 1} 
            mode={riskOutputs?.mode || JourneyMode.NOMAD}
          />

          <AppSurface className="p-6 md:p-8">
            <h3 className="font-bold text-taupe-dark mb-4">Journey Intel</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Origin</span>
                <span className="text-taupe-dark font-bold">{journey.origin.name}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Destination</span>
                <span className="text-taupe-dark font-bold">{journey.destination.name}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-2">
                <span className="text-taupe font-medium">Expected Return</span>
                <span className="text-taupe-dark font-bold">{new Date(journey.expectedReturnTime).toLocaleTimeString()}</span>
              </div>
            </div>
          </AppSurface>
        </div>

        {/* Demo Risk Injector */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 border-alert/20 bg-alert/5">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsDemoControlsOpen(!isDemoControlsOpen)}>
              <h3 className="font-bold text-alert flex items-center gap-2"><Settings2 size={18} /> Demo Risk Injector</h3>
              <span className="text-xs font-bold text-alert underline">{isDemoControlsOpen ? 'Hide' : 'Show'}</span>
            </div>
            
            {isDemoControlsOpen && (
              <div className="space-y-4 text-sm mt-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-taupe-dark flex justify-between">
                    Route Deviation (km) <span>{demoInputs.routeDeviationKm}km</span>
                  </label>
                  <input type="range" name="routeDeviationKm" min="0" max="10" step="0.5" value={demoInputs.routeDeviationKm} onChange={handleDemoInputChange} className="accent-alert" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-taupe-dark flex justify-between">
                    Hazard Severity <span>{(demoInputs.hazardSeverity * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" name="hazardSeverity" min="0" max="1" step="0.1" value={demoInputs.hazardSeverity} onChange={handleDemoInputChange} className="accent-alert" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-taupe-dark flex justify-between">
                    Missed Check-ins <span>{demoInputs.missedCheckins}</span>
                  </label>
                  <input type="range" name="missedCheckins" min="0" max="5" step="1" value={demoInputs.missedCheckins} onChange={handleDemoInputChange} className="accent-alert" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-taupe-dark">Connectivity</label>
                  <select name="connectivity" value={demoInputs.connectivity} onChange={handleDemoInputChange} className="p-2 rounded-lg border border-sand">
                    <option value="ONLINE">Online</option>
                    <option value="POOR">Poor</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
                
                <div className="pt-2 border-t border-alert/20 flex gap-2">
                  <button 
                    onClick={() => setDemoInputs({...demoInputs, explicitSOS: true})}
                    className="flex-1 bg-alert text-white py-2 rounded-full font-bold shadow-sm hover:bg-red-600 flex justify-center items-center gap-2"
                  >
                    <ShieldAlert size={16} /> TRIGGER MANUAL SOS
                  </button>
                  <button 
                    onClick={() => setDemoInputs({...demoInputs, missedCheckins: 0, routeDeviationKm: 0, hazardSeverity: 0, connectivity: ConnectivityState.ONLINE, explicitSOS: false})}
                    className="p-2 border border-alert/30 text-alert rounded-full hover:bg-alert/10"
                    title="Reset Simulator"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Reasoning Viewer */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-taupe-dark mb-4">Live Analysis</h3>
            {riskOutputs?.reasons.length === 0 ? (
              <p className="text-taupe text-sm">No anomalous signals detected.</p>
            ) : (
              <ul className="space-y-3">
                {riskOutputs?.reasons.map((r, i) => (
                  <li key={i} className="flex flex-col border-l-2 border-[#4A90E2] pl-3 py-1">
                    <span className="font-bold text-sm text-taupe-dark">{r.signal} <span className="text-[#4A90E2] ml-1">+{r.contribution}</span></span>
                    <span className="text-xs text-taupe">{r.explanation}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>

      <SafetyCheckSheet 
        isOpen={isSafetyCheckOpen} 
        reasons={riskOutputs?.reasons || []} 
        isDemoMode={true} 
        onSafe={handleSafe} 
        onHelp={handleHelp} 
        onNoResponse={handleNoResponse} 
      />

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-taupe-dark text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm animate-in fade-in slide-in-from-bottom-4 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
