'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppSurface, GlassCard, PrimaryButton, SecondaryButton, Skeleton, EmptyState } from '@/components/ui';
import { SafetyPulseCard } from '@/components/ui/SafetyPulse';
import { TrustLevelBadge } from '@/components/ui/TrustLevelBadge';
import { incidentService } from '@/services/incidentService';
import { capsuleService } from '@/services/capsuleService';
import { Incident, IncidentEvent, IncidentEventType } from '@/types/incident';
import { IncidentStatus, JourneyMode } from '@/types';
import { RescueCapsule } from '@/types/capsule';
import { Responder, DEMO_RESPONDERS } from '@/types/responder';
import { RiskReason } from '@/lib/riskEngine';
import {
  ArrowLeft, ShieldAlert, ShieldCheck, AlertTriangle, Radio, Clock,
  MapPin, Wifi, WifiOff, Battery, UserCheck, CheckCircle2, XCircle,
  Mountain, Car, Ambulance as AmbulanceIcon, ChevronDown, ChevronUp,
  FileJson, Activity, Zap, Eye
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function modeFromScore(score: number): JourneyMode {
  if (score >= 80) return JourneyMode.SENTINEL;
  if (score >= 55) return JourneyMode.GUARDIAN;
  if (score >= 30) return JourneyMode.WATCH;
  return JourneyMode.NOMAD;
}

const eventIcon: Record<string, React.ElementType> = {
  [IncidentEventType.SAFETY_CONFIRMED]: ShieldCheck,
  [IncidentEventType.EMERGENCY_TRIGGERED]: ShieldAlert,
  [IncidentEventType.NO_RESPONSE]: XCircle,
  [IncidentEventType.SYSTEM_ESCALATION]: Zap,
  [IncidentEventType.RESPONDER_ASSIGNED]: UserCheck,
  [IncidentEventType.INCIDENT_RESOLVED]: CheckCircle2,
  [IncidentEventType.CANCELLATION_REQUESTED]: XCircle,
  [IncidentEventType.CONDITION_UPDATED]: Activity,
};

const eventColor: Record<string, string> = {
  [IncidentEventType.SAFETY_CONFIRMED]: 'bg-success text-white',
  [IncidentEventType.EMERGENCY_TRIGGERED]: 'bg-alert text-white',
  [IncidentEventType.NO_RESPONSE]: 'bg-orange-500 text-white',
  [IncidentEventType.SYSTEM_ESCALATION]: 'bg-alert text-white',
  [IncidentEventType.RESPONDER_ASSIGNED]: 'bg-sky-500 text-white',
  [IncidentEventType.INCIDENT_RESOLVED]: 'bg-success text-white',
  [IncidentEventType.CANCELLATION_REQUESTED]: 'bg-orange-500 text-white',
  [IncidentEventType.CONDITION_UPDATED]: 'bg-taupe text-white',
};

function getResponderIcon(type: string) {
  if (type === 'MOUNTAIN_RESCUE') return Mountain;
  if (type === 'POLICE') return Car;
  return AmbulanceIcon;
}

/** Simple rule-based recommendation – Nearest is not always safest. */
function recommendResponder(capsule: RescueCapsule | null, responders: Responder[]): { responder: Responder; explanation: string } | null {
  if (responders.length === 0) return null;

  // Rule: if there's a route deviation + connectivity loss → Mountain Rescue
  const hasRouteDeviation = capsule && capsule.currentEvidence.routeDeviationKm > 1;
  const isOffline = capsule && capsule.currentEvidence.connectivity === 'OFFLINE';

  if (hasRouteDeviation || isOffline) {
    const mr = responders.find(r => r.type === 'MOUNTAIN_RESCUE' && r.availability !== 'BUSY');
    if (mr) {
      return {
        responder: mr,
        explanation: `Route deviation (${capsule?.currentEvidence.routeDeviationKm.toFixed(1)}km) and connectivity conditions suggest off-road extraction capability is required. ${mr.callsign} has wilderness navigation and rope rescue capability. Nearest is not always safest — road units cannot reach trail locations.`,
      };
    }
  }

  // Rule: if severity is medical-level → Ambulance
  if (capsule && capsule.severity >= 80) {
    const amb = responders.find(r => r.type === 'AMBULANCE' && r.availability !== 'BUSY');
    if (amb) {
      return {
        responder: amb,
        explanation: `Critical severity (${capsule.severity}) indicates potential medical emergency. ${amb.callsign} has advanced trauma care. Nearest is not always safest — prioritize medical capability over arrival speed.`,
      };
    }
  }

  // Default: fastest available unit
  const available = responders.filter(r => r.availability === 'AVAILABLE');
  if (available.length > 0) {
    return {
      responder: available[0],
      explanation: `Based on current evidence, ${available[0].callsign} is the recommended responder with the fastest estimated arrival. Nearest is not always safest — consider terrain and capability before confirming.`,
    };
  }

  return { responder: responders[0], explanation: 'All responders are currently busy. Assigning first available.' };
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.incidentId as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [capsule, setCapsule] = useState<RescueCapsule | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pulse', 'escalation', 'timeline', 'responder']));

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const loadData = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    setError(null);
    try {
      const [inc, cap, evts] = await Promise.all([
        incidentService.getIncidentById(incidentId),
        capsuleService.getCapsuleForIncident(incidentId),
        incidentService.getEventsForIncident(incidentId),
      ]);
      setIncident(inc);
      setCapsule(cap);
      setEvents(evts);
    } catch (err) {
      console.error('Failed to load incident detail', err);
      setError('Unable to load incident data. Check connectivity.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time incident listener
  useEffect(() => {
    if (!incidentId) return;
    const unsub = incidentService.listenToIncident(incidentId, (inc) => {
      if (inc) setIncident(inc);
    });
    return unsub;
  }, [incidentId]);

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleAssignResponder = async (resp: Responder) => {
    if (!incident) return;
    setActionLoading(true);
    try {
      await incidentService.assignResponder(incident.id, resp.id, resp.callsign);
      setShowAssignPicker(false);
      await loadData(); // Refresh events
    } catch (err) {
      console.error('Failed to assign responder', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkInProgress = async () => {
    if (!incident) return;
    setActionLoading(true);
    try {
      await incidentService.updateIncidentStatus(incident.id, IncidentStatus.IN_PROGRESS);
      await incidentService.addIncidentEvent(incident.id, IncidentEventType.SYSTEM_ESCALATION, 'Incident marked as IN PROGRESS by authority.');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!incident) return;
    setActionLoading(true);
    try {
      await incidentService.updateIncidentStatus(incident.id, IncidentStatus.RESOLVED);
      await incidentService.addIncidentEvent(incident.id, IncidentEventType.INCIDENT_RESOLVED, 'Incident resolved by authority. History retained.');
      setShowResolveConfirm(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Loading / Error ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8 max-w-[1200px] mx-auto w-full">
        <Skeleton className="h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-60 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="flex-1 p-4 lg:p-8 max-w-[1200px] mx-auto w-full">
        <EmptyState
          icon={ShieldAlert}
          title={error ? 'Load Error' : 'Incident Not Found'}
          description={error || `Incident ${incidentId} does not exist or has been removed.`}
        />
        <div className="flex justify-center mt-6">
          <SecondaryButton onClick={() => router.push('/authority/incidents')}>
            <ArrowLeft size={16} /> Back to Incidents
          </SecondaryButton>
        </div>
      </div>
    );
  }

  const mode = capsule ? modeFromScore(capsule.riskScore) : modeFromScore(incident.severity);
  const score = capsule?.riskScore ?? incident.severity;
  const confidence = capsule?.confidence ?? 0.5;
  const reasons: RiskReason[] = capsule?.reasons ?? [];
  const recommendation = recommendResponder(capsule, DEMO_RESPONDERS);
  const isResolved = incident.status === IncidentStatus.RESOLVED;

  // ─── Collapsible Section Header ───────────────────────────────────────
  const SectionToggle = ({ sectionKey, title, icon: Icon }: { sectionKey: string; title: string; icon: React.ElementType }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full text-left group"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={18} className="text-taupe" />
        <h3 className="font-bold text-taupe-dark text-base">{title}</h3>
      </div>
      {expandedSections.has(sectionKey) ? (
        <ChevronUp size={18} className="text-taupe group-hover:text-taupe-dark transition-colors" />
      ) : (
        <ChevronDown size={18} className="text-taupe group-hover:text-taupe-dark transition-colors" />
      )}
    </button>
  );

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-6 pb-12">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/authority/incidents')}
          className="flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-taupe-dark transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Incidents
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-black text-taupe-dark tracking-tight">Incident Detail</h1>
              {isResolved && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success">RESOLVED</span>
              )}
            </div>
            <p className="text-taupe font-medium text-sm font-mono">{incident.id}</p>
          </div>
          <div className="text-sm text-taupe">
            Reported {formatTime(incident.reportedAt)}
            {incident.resolvedAt && <span className="ml-3">• Resolved {formatTime(incident.resolvedAt)}</span>}
          </div>
        </div>
      </div>

      {/* ─── Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* 1. Incident Summary */}
          <AppSurface className="p-5 lg:p-6">
            <h3 className="font-bold text-taupe-dark text-base mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-taupe" /> Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Status</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  isResolved ? 'bg-success-soft text-success' :
                  incident.status === IncidentStatus.IN_PROGRESS ? 'bg-sky-100 text-sky-700' :
                  incident.status === IncidentStatus.ASSIGNED ? 'bg-indigo-100 text-indigo-700' :
                  'bg-alert-soft text-alert'
                }`}>
                  {incident.status}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Severity</div>
                <span className={`text-xl font-black ${score >= 80 ? 'text-alert' : score >= 55 ? 'text-orange-500' : 'text-taupe-dark'}`}>{score}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Mode</div>
                <span className="font-bold text-taupe-dark">{mode}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Journey</div>
                <span className="font-mono text-xs text-taupe-dark truncate block">{incident.journeyId.substring(0, 12)}…</span>
              </div>
            </div>
            {incident.description && (
              <p className="mt-4 text-sm text-taupe-dark bg-sand/20 rounded-xl p-3">{incident.description}</p>
            )}
          </AppSurface>

          {/* 2. Safety Pulse + Confidence */}
          <div>
            <SectionToggle sectionKey="pulse" title="Safety Pulse" icon={Activity} />
            {expandedSections.has('pulse') && (
              <div className="mt-3">
                <SafetyPulseCard score={score} confidence={confidence} mode={mode} />
              </div>
            )}
          </div>

          {/* 4. Why TRINETRA Escalated */}
          <AppSurface className="p-5 lg:p-6">
            <SectionToggle sectionKey="escalation" title="Why TRINETRA Escalated" icon={Zap} />
            {expandedSections.has('escalation') && (
              <div className="mt-4">
                {reasons.length === 0 ? (
                  <p className="text-sm text-taupe italic">No structured reasons available for this incident.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-sand/15 rounded-xl">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black ${
                          reason.normalizedSeverity >= 0.8 ? 'bg-alert/15 text-alert' :
                          reason.normalizedSeverity >= 0.5 ? 'bg-orange-100 text-orange-600' :
                          'bg-sand-light text-taupe-dark'
                        }`}>
                          +{reason.contribution}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-taupe-dark">{reason.signal}</span>
                            <span className="text-xs text-taupe">
                              severity {Math.round(reason.normalizedSeverity * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-taupe mt-0.5">{reason.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AppSurface>

          {/* 7. Evidence Timeline */}
          <AppSurface className="p-5 lg:p-6">
            <SectionToggle sectionKey="timeline" title="Evidence Timeline" icon={Clock} />
            {expandedSections.has('timeline') && (
              <div className="mt-4 relative">
                {events.length === 0 ? (
                  <p className="text-sm text-taupe italic">No events recorded yet.</p>
                ) : (
                  <div className="space-y-0">
                    {/* Vertical track */}
                    <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-sand-light" />
                    {events.map((evt, idx) => {
                      const Icon = eventIcon[evt.type] || Activity;
                      const color = eventColor[evt.type] || 'bg-sand text-taupe-dark';
                      return (
                        <div key={evt.id} className="flex items-start gap-4 relative pb-5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm ${color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm text-taupe-dark">{evt.type.replace(/_/g, ' ')}</span>
                              <span className="text-xs text-taupe whitespace-nowrap">{timeAgo(evt.timestamp)}</span>
                            </div>
                            <p className="text-xs text-taupe mt-0.5">{evt.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </AppSurface>
        </div>

        {/* RIGHT COLUMN — 1/3 */}
        <div className="flex flex-col gap-6">

          {/* 3. Rescue Capsule */}
          {capsule && (
            <GlassCard className="p-5">
              <h3 className="font-bold text-taupe-dark text-base mb-4 flex items-center gap-2">
                <FileJson size={18} className="text-taupe" /> Rescue Capsule
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-taupe uppercase font-semibold">Risk Score</span>
                  <div className={`text-xl font-black ${capsule.riskScore >= 80 ? 'text-alert' : 'text-taupe-dark'}`}>
                    {capsule.riskScore}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase font-semibold">Confidence</span>
                  <div className="text-xl font-black text-taupe-dark">{Math.round(capsule.confidence * 100)}%</div>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase font-semibold">Trigger</span>
                  <div className="font-medium text-taupe-dark">{capsule.trigger.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase font-semibold">Integrity</span>
                  <div className="flex items-center gap-1">
                    {capsule.integrityValue ? (
                      <>
                        <CheckCircle2 size={14} className="text-success" />
                        <span className="text-xs font-medium text-success">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span className="text-xs font-medium text-orange-500">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Tourist emergency fields */}
              {(capsule.touristEmergencyFields.bloodGroup || capsule.touristEmergencyFields.emergencyContact) && (
                <div className="mt-4 pt-3 border-t border-sand-light">
                  <div className="text-xs text-taupe font-semibold uppercase mb-2">Tourist Info (Disclosed)</div>
                  {capsule.touristEmergencyFields.bloodGroup && (
                    <div className="text-sm text-taupe-dark mb-1">
                      <span className="text-taupe">Blood: </span>{capsule.touristEmergencyFields.bloodGroup}
                    </div>
                  )}
                  {capsule.touristEmergencyFields.emergencyContact && (
                    <div className="text-sm text-taupe-dark mb-1">
                      <span className="text-taupe">Emergency: </span>{capsule.touristEmergencyFields.emergencyContact}
                    </div>
                  )}
                  {capsule.touristEmergencyFields.medicalNotes && (
                    <div className="text-sm text-taupe-dark">
                      <span className="text-taupe">Medical: </span>{capsule.touristEmergencyFields.medicalNotes}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {/* 5. Last Safe State */}
          {capsule?.lastSafeState && (
            <GlassCard className="p-5">
              <h3 className="font-bold text-taupe-dark text-base mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-taupe" /> Last Safe State
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                {capsule.lastSafeState.lat != null && capsule.lastSafeState.lng != null && (
                  <div className="bg-sand/20 rounded-xl p-3 font-mono text-xs text-taupe-dark">
                    {capsule.lastSafeState.lat.toFixed(5)}, {capsule.lastSafeState.lng.toFixed(5)}
                  </div>
                )}
                {capsule.lastSafeState.timestamp && (
                  <div className="text-xs text-taupe">
                    <Clock size={12} className="inline mr-1" />
                    {formatTime(capsule.lastSafeState.timestamp)}
                  </div>
                )}
              </div>

              {/* Current evidence snapshot */}
              <div className="mt-4 pt-3 border-t border-sand-light grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-taupe" />
                  <span className="text-taupe-dark font-medium">{capsule.currentEvidence.routeDeviationKm.toFixed(1)}km deviation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {capsule.currentEvidence.connectivity === 'OFFLINE' ? (
                    <WifiOff size={14} className="text-alert" />
                  ) : (
                    <Wifi size={14} className="text-success" />
                  )}
                  <span className="text-taupe-dark font-medium">{capsule.currentEvidence.connectivity}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio size={14} className="text-taupe" />
                  <span className="text-taupe-dark font-medium">{capsule.currentEvidence.missedCheckins} missed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-taupe" />
                  <span className="text-taupe-dark font-medium">{capsule.currentEvidence.inactivityMinutes}m inactive</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 6. Hazard Context */}
          {capsule?.hazardContext && capsule.hazardContext.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="font-bold text-taupe-dark text-base mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-taupe" /> Hazard Context
              </h3>
              <div className="flex flex-col gap-3">
                {capsule.hazardContext.map((hz) => (
                  <div key={hz.id} className="bg-sand/15 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-taupe-dark">{hz.type}</span>
                      <TrustLevelBadge level={hz.trustLevel} />
                    </div>
                    <p className="text-xs text-taupe line-clamp-2">{hz.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-taupe">
                      <span>Severity: {Math.round(hz.severity * 100)}%</span>
                      <span>Source: {hz.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* 8. Responder Recommendation */}
          <AppSurface className="p-5">
            <SectionToggle sectionKey="responder" title="Responder Recommendation" icon={UserCheck} />
            {expandedSections.has('responder') && (
              <div className="mt-4">
                {recommendation ? (
                  <>
                    {(() => {
                      const RecIcon = getResponderIcon(recommendation.responder.type);
                      return (
                        <div className="bg-sand/20 rounded-xl p-4 border border-sand-light mb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-sand-light">
                              <RecIcon size={20} className="text-taupe-dark" />
                            </div>
                            <div>
                              <div className="font-bold text-taupe-dark">{recommendation.responder.callsign}</div>
                              <div className="flex items-center gap-2 text-xs text-taupe">
                                <span className={`w-2 h-2 rounded-full ${recommendation.responder.availability === 'AVAILABLE' ? 'bg-success' : 'bg-orange-400'}`} />
                                {recommendation.responder.availability} • ETA {recommendation.responder.demoETA}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-taupe leading-relaxed">{recommendation.explanation}</p>
                        </div>
                      );
                    })()}

                    <div className="bg-ivory-warm/60 rounded-xl p-3 text-xs text-taupe border border-sand-light/50 mb-4 flex items-start gap-2">
                      <Eye size={14} className="flex-shrink-0 mt-0.5 text-taupe" />
                      <span>&quot;Nearest is not always safest.&quot; TRINETRA recommends based on terrain, capability, and evidence — not just proximity.</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-taupe italic">No responders available.</p>
                )}
              </div>
            )}
          </AppSurface>

          {/* 9. Response Status / Actions */}
          <GlassCard className="p-5 border-t-4 border-forest/30">
            <h3 className="font-bold text-taupe-dark text-base mb-4 flex items-center gap-2">
              <Radio size={18} className="text-taupe" /> Response Controls
            </h3>

            {incident.responderId && (
              <div className="mb-4 bg-sky-50 rounded-xl p-3 border border-sky-100">
                <div className="text-xs text-sky-600 font-semibold uppercase mb-1">Assigned</div>
                <div className="text-sm font-bold text-sky-800">
                  {DEMO_RESPONDERS.find(r => r.id === incident.responderId)?.callsign || incident.responderId}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!isResolved && !incident.responderId && (
                <PrimaryButton
                  onClick={() => setShowAssignPicker(true)}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <UserCheck size={16} /> Assign Responder
                </PrimaryButton>
              )}

              {!isResolved && incident.responderId && incident.status !== IncidentStatus.IN_PROGRESS && (
                <PrimaryButton
                  onClick={handleMarkInProgress}
                  disabled={actionLoading}
                  className="w-full bg-sky-600 hover:bg-sky-700"
                >
                  <Activity size={16} /> Mark In Progress
                </PrimaryButton>
              )}

              {!isResolved && (
                <SecondaryButton
                  onClick={() => setShowResolveConfirm(true)}
                  disabled={actionLoading}
                  className="w-full text-success border-success/30 hover:bg-success-soft"
                >
                  <CheckCircle2 size={16} /> Resolve Incident
                </SecondaryButton>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ─── Assign Responder Picker Modal ─────────────────────────────── */}
      {showAssignPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-lg p-6 bg-white shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-taupe-dark text-lg">Select Responder</h3>
              <button onClick={() => setShowAssignPicker(false)} className="text-taupe hover:text-taupe-dark">
                <XCircle size={22} />
              </button>
            </div>

            <div className="bg-ivory-warm/60 rounded-xl p-3 text-xs text-taupe border border-sand-light/50 mb-5 flex items-start gap-2">
              <Eye size={14} className="flex-shrink-0 mt-0.5" />
              <span>&quot;Nearest is not always safest.&quot; Review capabilities and access limitations before assigning.</span>
            </div>

            <div className="flex flex-col gap-4">
              {DEMO_RESPONDERS.map((resp) => {
                const RIcon = getResponderIcon(resp.type);
                const isRecommended = recommendation?.responder.id === resp.id;
                return (
                  <div
                    key={resp.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isRecommended ? 'border-forest bg-success-soft/30' : 'border-sand-light hover:border-taupe bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sand-light flex items-center justify-center flex-shrink-0">
                        <RIcon size={24} className="text-taupe-dark" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-taupe-dark">{resp.callsign}</span>
                          {isRecommended && (
                            <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded-full uppercase">Recommended</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-taupe mb-2">
                          <span className={`w-2 h-2 rounded-full ${resp.availability === 'AVAILABLE' ? 'bg-success' : resp.availability === 'ON_CALL' ? 'bg-orange-400' : 'bg-alert'}`} />
                          {resp.availability} • ETA {resp.demoETA}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {resp.capabilities.map((cap, i) => (
                            <span key={i} className="px-2 py-0.5 bg-sand-light rounded-full text-[10px] font-medium text-taupe-dark">{cap}</span>
                          ))}
                        </div>

                        <p className="text-[11px] text-taupe italic">{resp.accessLimitations}</p>
                      </div>
                    </div>

                    <PrimaryButton
                      onClick={() => handleAssignResponder(resp)}
                      disabled={actionLoading || resp.availability === 'BUSY'}
                      className="w-full mt-3 py-2.5 text-sm"
                    >
                      <UserCheck size={14} /> Assign {resp.callsign.split(' ')[0]}
                    </PrimaryButton>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ─── Resolve Confirmation Modal ────────────────────────────────── */}
      {showResolveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-white shadow-xl">
            <h3 className="font-bold text-taupe-dark text-lg mb-2">Resolve Incident?</h3>
            <p className="text-sm text-taupe mb-6">
              This will mark the incident as resolved. All history, events, and Rescue Capsule data will be retained permanently. The tourist&apos;s Emergency Status page will update in real time.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setShowResolveConfirm(false)} className="flex-1">Cancel</SecondaryButton>
              <PrimaryButton
                onClick={handleResolve}
                disabled={actionLoading}
                className="flex-1 bg-success hover:bg-green-600"
              >
                <CheckCircle2 size={16} /> Confirm Resolve
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
