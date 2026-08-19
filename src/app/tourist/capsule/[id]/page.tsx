'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppSurface, PrimaryButton, SecondaryButton, GlassCard } from '@/components/ui';
import { capsuleService } from '@/services/capsuleService';
import { RescueCapsule } from '@/types/capsule';
import { ShieldAlert, Download, ArrowLeft, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RescueCapsulePage() {
  const params = useParams();
  const router = useRouter();
  const capsuleId = typeof params?.id === 'string' ? params.id : '';
  
  const [capsule, setCapsule] = useState<RescueCapsule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (capsuleId) {
      capsuleService.getCapsule(capsuleId).then(data => {
        setCapsule(data || null);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load capsule:', err);
        setLoading(false);
      });
    }
  }, [capsuleId]);

  const handleDownload = () => {
    if (!capsule) return;
    const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RescueCapsule-${capsule.incidentId || capsule.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldAlert size={48} className="text-taupe mb-4 opacity-50" />
          <p className="text-taupe font-bold">Decrypting Rescue Capsule...</p>
        </div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full text-center p-8">
          <AlertTriangle size={48} className="text-alert mx-auto mb-4" />
          <h2 className="text-xl font-bold text-taupe-dark mb-2">Capsule Not Found</h2>
          <p className="text-taupe mb-6">The specified Rescue Capsule could not be located in local storage.</p>
          <PrimaryButton onClick={() => router.push('/tourist/journey')} className="w-full">
            Return to Safety Screen
          </PrimaryButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-ivory p-4 md:p-6 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-alert/10 flex items-center justify-center border border-alert/20">
              <ShieldAlert size={24} className="text-alert" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-taupe-dark tracking-tight leading-none mb-1">RESCUE CAPSULE</h1>
              <p className="text-sm font-bold text-taupe">INCIDENT ID: {capsule.incidentId || 'UNASSIGNED'}</p>
            </div>
          </div>
        </div>

        {/* Integrity Verified Indicator */}
        {capsule.isPendingServerVerification ? (
          <div className="w-full bg-alert/10 border border-alert/30 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-alert shrink-0" size={20} />
            <p className="text-sm font-bold text-alert">Pending server verification (Offline Mode)</p>
          </div>
        ) : (
          <div className="w-full bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck className="text-success shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-success">Integrity Verified</p>
              <p className="text-xs text-success/80 font-mono mt-1 break-all">{capsule.integrityValue}</p>
            </div>
          </div>
        )}

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Risk Overview */}
          <AppSurface className="p-5">
            <h3 className="text-xs font-bold text-taupe uppercase tracking-wider mb-4 border-b border-sand pb-2 flex items-center gap-2">
              <Activity size={14} /> Risk Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Severity</span>
                <span className="text-sm font-bold text-alert">{(capsule.severity * 100).toFixed(0)} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Safety Pulse</span>
                <span className="text-sm font-bold text-taupe-dark">{capsule.riskScore} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Confidence</span>
                <span className="text-sm font-bold text-taupe-dark">{(capsule.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Trigger</span>
                <span className="text-xs font-bold bg-alert text-white px-2 py-0.5 rounded-full">
                  {capsule.trigger.replace('_', ' ')}
                </span>
              </div>
            </div>
          </AppSurface>

          {/* Telemetry Evidence */}
          <AppSurface className="p-5">
            <h3 className="text-xs font-bold text-taupe uppercase tracking-wider mb-4 border-b border-sand pb-2">
              Telemetry Evidence
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Route Deviation</span>
                <span className="text-sm font-bold text-taupe-dark">{capsule.currentEvidence.routeDeviationKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Connectivity</span>
                <span className="text-sm font-bold text-taupe-dark">{capsule.currentEvidence.connectivity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Missed Check-ins</span>
                <span className="text-sm font-bold text-alert">{capsule.currentEvidence.missedCheckins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-taupe-dark font-medium">Inactivity</span>
                <span className="text-sm font-bold text-taupe-dark">{capsule.currentEvidence.inactivityMinutes} min</span>
              </div>
            </div>
          </AppSurface>

          {/* Last Safe State */}
          <AppSurface className="p-5 md:col-span-2">
            <h3 className="text-xs font-bold text-taupe uppercase tracking-wider mb-4 border-b border-sand pb-2">
              Last Safe State & Hazard Context
            </h3>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <p className="text-sm text-taupe-dark font-medium mb-1">Last Safe Coordinates</p>
                <p className="text-sm font-mono font-bold text-taupe">
                  {capsule.lastSafeState.lat?.toFixed(5) || 'UNKNOWN'}, {capsule.lastSafeState.lng?.toFixed(5) || 'UNKNOWN'}
                </p>
                {capsule.lastSafeState.timestamp && (
                  <p className="text-xs text-taupe mt-1">Recorded: {new Date(capsule.lastSafeState.timestamp).toLocaleTimeString()}</p>
                )}
              </div>
              
              {capsule.hazardContext && capsule.hazardContext.length > 0 && (
                <div className="bg-sand/30 p-3 rounded-lg flex-1">
                  <p className="text-xs font-bold text-taupe-dark mb-2">Nearest Assessed Hazard</p>
                  <p className="text-sm font-bold text-alert">{capsule.hazardContext[0].type}</p>
                  <p className="text-xs text-taupe mt-1">Source: {capsule.hazardContext[0].source} ({capsule.hazardContext[0].trustLevel})</p>
                </div>
              )}
            </div>
          </AppSurface>

          {/* Escalation Reasons */}
          <AppSurface className="p-5 md:col-span-2">
            <h3 className="text-xs font-bold text-taupe uppercase tracking-wider mb-4 border-b border-sand pb-2">
              Why TRINETRA Escalated
            </h3>
            <div className="space-y-3">
              {capsule.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-ivory-warm p-3 rounded-lg border border-sand">
                  <div className="w-5 h-5 rounded-full bg-alert/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-alert font-bold text-xs">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-taupe-dark">{reason.signal}</p>
                    <p className="text-xs text-taupe mt-1">{reason.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </AppSurface>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <PrimaryButton 
            onClick={() => router.push('/tourist/emergency')}
            className="flex-1 bg-alert hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={18} /> View Emergency Status
          </PrimaryButton>
          
          <SecondaryButton 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download JSON
          </SecondaryButton>
        </div>
        
        <button 
          onClick={() => router.push('/tourist/journey')}
          className="w-full py-4 text-sm font-bold text-taupe hover:text-taupe-dark transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Safety Screen
        </button>

      </div>
    </div>
  );
}
