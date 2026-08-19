'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, PrimaryButton, SecondaryButton } from '@/components/ui';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldAlert, PhoneCall, CheckCircle2, Activity, Map, ArrowLeft, WifiOff, RefreshCw, XCircle } from 'lucide-react';
import { idbService } from '@/services/idbService';
import { incidentService } from '@/services/incidentService';
import { Incident, IncidentEventType } from '@/types/incident';
import { IncidentStatus } from '@/types';

export default function EmergencyStatusPage() {
  const router = useRouter();
  // user auth is not directly needed here since we use idb service primarily for the local journey
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const init = async () => {
      const journey = await idbService.getFirstActiveJourney();
      if (!journey) {
        setLoading(false);
        return;
      }
      
      const localIncident = await idbService.getFirstIncident();
      if (localIncident && (localIncident as Incident).journeyId === journey.id) {
        setIncident(localIncident as Incident);
      }
      
      unsubscribe = incidentService.listenToActiveIncident(journey.id, (inc) => {
        if (inc) {
          setIncident(inc);
        }
        setLoading(false);
      });
    };
    
    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleUpdateCondition = async (condition: string) => {
    if (!incident) return;
    try {
      await incidentService.addIncidentEvent(incident.id, IncidentEventType.CONDITION_UPDATED, condition);
      setShowConditionModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRequest = async () => {
    if (!incident) return;
    try {
      await incidentService.addIncidentEvent(incident.id, IncidentEventType.CANCELLATION_REQUESTED, "User requested cancellation.");
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <RefreshCw className="animate-spin text-alert w-8 h-8" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[calc(100vh-80px)]">
        <ShieldAlert size={48} className="text-taupe mb-4" />
        <h2 className="text-xl font-bold text-taupe-dark mb-2">No Active Emergency</h2>
        <p className="text-taupe mb-6">You don&apos;t have any active emergency incidents.</p>
        <PrimaryButton onClick={() => router.push('/tourist/journey')}>Return to Journey</PrimaryButton>
      </div>
    );
  }

  const stages = [
    { status: IncidentStatus.CREATED, label: "Emergency Created", desc: "Capsule prepared and queued." },
    { status: IncidentStatus.RECEIVED, label: "Received by Authority", desc: "Nexus has received your request." },
    { status: IncidentStatus.ASSIGNED, label: "Responder Assigned", desc: "Help is on the way." },
    { status: IncidentStatus.IN_PROGRESS, label: "In Progress", desc: "Responder is on-site or acting." },
    { status: IncidentStatus.RESOLVED, label: "Resolved", desc: "Emergency cleared." }
  ];

  const currentStageIndex = stages.findIndex(s => s.status === incident.status);

  return (
    <div className="flex-1 bg-alert/5 p-4 lg:p-12 w-full min-h-[calc(100vh-80px)] flex flex-col relative pb-32">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-4 pb-8 text-center relative">
        {isOffline && (
          <div className="absolute top-0 right-0 bg-alert/10 text-alert text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-alert/20">
            <WifiOff size={12} /> CACHED
          </div>
        )}
        <div className="w-20 h-20 bg-alert/20 rounded-full flex items-center justify-center mb-4 animate-pulse border-4 border-alert/30">
          <ShieldAlert size={40} className="text-alert" />
        </div>
        <h1 className="text-2xl font-black text-alert mb-1 tracking-tight">EMERGENCY SOS</h1>
        <p className="text-taupe-dark font-medium text-sm">
          ID: {incident.id.substring(0,8).toUpperCase()}
        </p>
      </div>

      <AppSurface className="p-5 md:p-8 max-w-lg mx-auto w-full border border-alert/20 bg-white mb-6">
        <h3 className="font-bold text-taupe-dark mb-6 border-b border-sand pb-3">Rescue Protocol Status</h3>
        
        <div className="space-y-5 relative">
          {/* Timeline track */}
          <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-sand-light -z-10" />

          {stages.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;
            
            return (
              <div key={stage.status} className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCompleted ? 'bg-success text-white' : 'bg-sand-light text-taupe'}`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-taupe/30" />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${isCompleted ? 'text-taupe-dark' : 'text-taupe'}`}>{stage.label}</p>
                  <p className={`text-xs mt-0.5 ${isCurrent ? 'text-taupe-dark font-medium' : 'text-taupe'}`}>{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {incident.responderId && (
          <div className="mt-6 pt-4 border-t border-sand">
            <p className="text-xs text-taupe uppercase font-bold mb-1">Assigned Responder</p>
            <p className="text-sm font-medium text-taupe-dark bg-sand-light px-3 py-2 rounded-lg inline-block">
              ID: {incident.responderId}
            </p>
          </div>
        )}
      </AppSurface>

      {/* Action Buttons */}
      <div className="max-w-lg mx-auto w-full grid grid-cols-2 gap-3 mb-4">
        <PrimaryButton 
          onClick={() => router.push(`/tourist/capsule/${incident.id}`)}
          className="flex flex-col items-center justify-center py-3 gap-1 bg-taupe-dark text-white hover:bg-black"
        >
          <Activity size={18} />
          <span className="text-xs">Rescue Capsule</span>
        </PrimaryButton>
        <PrimaryButton 
          onClick={() => router.push('/tourist/offline/guidance')}
          className="flex flex-col items-center justify-center py-3 gap-1 bg-taupe text-white hover:bg-taupe-dark"
        >
          <Map size={18} />
          <span className="text-xs">Shadow Corridor</span>
        </PrimaryButton>
      </div>

      <div className="max-w-lg mx-auto w-full flex flex-col gap-3">
        <SecondaryButton 
          onClick={() => setShowConditionModal(true)}
          className="w-full flex justify-center gap-2"
        >
          <Activity size={16} /> Update My Condition
        </SecondaryButton>
        <SecondaryButton 
          onClick={() => setShowCancelModal(true)}
          className="w-full text-alert border-alert/20 hover:bg-alert/5 flex justify-center gap-2"
        >
          <XCircle size={16} /> Cancel Request
        </SecondaryButton>
      </div>

      {/* Condition Modal */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-white animate-in slide-in-from-bottom-4">
            <h3 className="font-bold text-taupe-dark mb-4 text-lg">Update Condition</h3>
            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => handleUpdateCondition("Safe now")} className="w-full bg-success hover:bg-green-600">Safe now</PrimaryButton>
              <PrimaryButton onClick={() => handleUpdateCondition("Still need help")} className="w-full bg-alert hover:bg-red-600">Still need help</PrimaryButton>
              <PrimaryButton onClick={() => handleUpdateCondition("Injured / cannot move")} className="w-full bg-alert hover:bg-red-600">Injured / cannot move</PrimaryButton>
              <SecondaryButton onClick={() => setShowConditionModal(false)} className="w-full mt-2">Close</SecondaryButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-white">
            <h3 className="font-bold text-alert mb-2 text-lg">Cancel Emergency?</h3>
            <p className="text-sm text-taupe mb-6">
              This will notify responders that you no longer need assistance. This action will be logged.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setShowCancelModal(false)} className="flex-1">Keep Request</SecondaryButton>
              <PrimaryButton onClick={handleCancelRequest} className="flex-1 bg-alert hover:bg-red-600">Confirm Cancel</PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
      
    </div>
  );
}
