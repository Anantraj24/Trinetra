'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/hooks/useDemoMode';
import { 
  GlassCard, 
  SafetyPulse, 
  ConnectivityBadge, 
  Pill, 
  StatusPill, 
  DangerButton,
  Skeleton
} from '@/components/ui';
import { 
  DEMO_SAFETY_PULSE, 
  DEMO_ACTIVE_JOURNEY, 
  DEMO_NEARBY_RISK, 
  DEMO_RECENT_ACTIVITY 
} from '@/features/tourist/DashboardMockData';
import { Shield, Map, Package, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TouristHome() {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemoMode();
  
  // Local state to simulate loading
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  // State calculations
  const isLoading = loading || isInitializing;
  const hasActiveJourney = isDemoMode; // In real app, check user's journey collection

  if (isLoading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/50 p-6 rounded-3xl h-64 border border-sand-light/50 flex flex-col justify-center gap-4">
              <Skeleton className="h-12 w-24 mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white/50 p-6 rounded-3xl h-64 border border-sand-light/50 flex flex-col justify-center gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col max-w-7xl mx-auto w-full relative">
      
      {/* 1. Friendly Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-taupe-dark tracking-tight">Hi, {firstName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={16} className="text-success" />
            <span className="text-taupe font-medium text-sm">Protected by TRINETRA</span>
          </div>
        </div>
        {/* On mobile, profile is handled by bottom dock. On desktop, by sidebar. But we can put a small status badge here. */}
        <div className="hidden lg:block">
          <StatusPill status="success" label="Systems Nominal" />
        </div>
      </header>

      {/* Main Grid for Desktop vs Stack for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
        
        {/* LEFT COLUMN: Safety Pulse & Risks */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* 2. Large Safety Pulse Card */}
          <GlassCard className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-white to-ivory-warm shadow-xl shadow-sand/20">
            <div className="absolute top-4 right-4">
              <SafetyPulse status={hasActiveJourney ? DEMO_SAFETY_PULSE.status : 'warning'} />
            </div>
            
            <div className="flex flex-col items-center gap-2 mb-6">
              <span className="text-sm font-bold tracking-widest uppercase text-taupe">{hasActiveJourney ? DEMO_SAFETY_PULSE.mode : 'No Active Mode'}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-taupe-dark tracking-tighter">
                  {hasActiveJourney ? DEMO_SAFETY_PULSE.score : '--'}
                </span>
                <span className="text-xl font-bold text-taupe">/100</span>
              </div>
              <span className="text-sm font-medium text-success">{hasActiveJourney ? DEMO_SAFETY_PULSE.confidence : 'Awaiting Journey'}</span>
            </div>
            
            <p className="text-taupe-dark font-medium leading-snug">
              {hasActiveJourney ? DEMO_SAFETY_PULSE.message : 'You are currently not on an active journey. Start a new safety contract to enable monitoring.'}
            </p>
          </GlassCard>

          {/* 5. Nearby Risk Card */}
          {hasActiveJourney && (
            <div className="bg-white p-6 rounded-3xl border border-sand-light/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-[#F5A623]" />
                <h3 className="font-bold text-taupe-dark">Nearby Risk</h3>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-taupe-dark">{DEMO_NEARBY_RISK.title}</p>
                  <p className="text-sm font-medium text-taupe">{DEMO_NEARBY_RISK.distance} away</p>
                </div>
                <Pill>{DEMO_NEARBY_RISK.trust}</Pill>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE/RIGHT COLUMN: Journey, Actions, Activity */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* 3. Active Journey Card or Empty State */}
          {hasActiveJourney ? (
            <GlassCard className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Map size={20} className="text-taupe" />
                  <h3 className="font-bold text-taupe-dark">Active Journey</h3>
                </div>
                <ConnectivityBadge isOffline={DEMO_ACTIVE_JOURNEY.connectivity === 'OFFLINE'} />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-taupe-dark">{DEMO_ACTIVE_JOURNEY.origin}</span>
                  <ArrowRight size={16} className="text-taupe mx-2" />
                  <span className="font-semibold text-taupe-dark">{DEMO_ACTIVE_JOURNEY.destination}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-sand-light rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-taupe-dark h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${DEMO_ACTIVE_JOURNEY.progressPercent}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm font-medium text-taupe">
                  <span>{DEMO_ACTIVE_JOURNEY.progressPercent}% Completed</span>
                  <span>Next Check-in: <strong className="text-taupe-dark">{DEMO_ACTIVE_JOURNEY.nextCheckIn}</strong></span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/tourist/journey" className="inline-flex items-center justify-center w-full lg:w-auto px-6 py-3 bg-taupe-dark text-white font-bold rounded-full hover:bg-black transition-colors">
                  Resume Journey <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[250px]">
              <div className="w-16 h-16 bg-sand-light rounded-full flex items-center justify-center mb-2">
                <Map size={32} className="text-taupe" />
              </div>
              <h3 className="text-xl font-bold text-taupe-dark">No Active Journey</h3>
              <p className="text-taupe font-medium max-w-md">Create a new Journey Safety Contract before heading into remote or high-risk areas.</p>
              <Link href="/tourist/journey/new" className="mt-2 inline-flex items-center justify-center px-8 py-3 bg-taupe-dark text-white font-bold rounded-full hover:bg-black transition-colors">
                New Journey
              </Link>
            </GlassCard>
          )}

          {/* 4. Horizontal Quick Actions */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
            <Link href="/tourist/safety" className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-sand-light flex items-center justify-center hover:bg-sand-light transition-colors">
                <Shield size={24} className="text-taupe-dark" />
              </div>
              <span className="text-xs font-bold text-taupe-dark text-center">Safety Pass</span>
            </Link>
            
            <Link href="/tourist/offline" className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-sand-light flex items-center justify-center hover:bg-sand-light transition-colors">
                <Package size={24} className="text-taupe-dark" />
              </div>
              <span className="text-xs font-bold text-taupe-dark text-center">Offline Pack</span>
            </Link>

            <button className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-sand-light flex items-center justify-center hover:bg-sand-light transition-colors">
                <CheckCircle2 size={24} className="text-taupe-dark" />
              </div>
              <span className="text-xs font-bold text-taupe-dark text-center">Check In</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-alert/10 shadow-sm border border-alert/20 flex items-center justify-center hover:bg-alert/20 transition-colors">
                <ShieldAlert size={24} className="text-alert" />
              </div>
              <span className="text-xs font-bold text-alert text-center">Emergency</span>
            </button>
          </div>

          {/* 6. Recent Activity */}
          {hasActiveJourney && (
            <div className="bg-white p-6 rounded-3xl border border-sand-light/50 shadow-sm">
              <h3 className="font-bold text-taupe-dark mb-4">Recent Activity</h3>
              <div className="flex flex-col gap-4">
                {DEMO_RECENT_ACTIVITY.map(act => (
                  <div key={act.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        act.type === 'success' ? 'bg-success' : 
                        act.type === 'info' ? 'bg-[#4A90E2]' : 'bg-taupe'
                      }`} />
                      <div className="w-px h-full bg-sand mt-2" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-taupe-dark">{act.description}</p>
                      <p className="text-xs font-bold text-taupe mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 7. Persistent SOS (Mobile & Desktop) */}
      {/* On desktop we can float it bottom right. On mobile we float it bottom center, just above the dock (pb-24 offset). */}
      <div className="fixed bottom-24 lg:bottom-12 right-1/2 translate-x-1/2 lg:right-12 lg:translate-x-0 z-[40]">
        <DangerButton className="shadow-2xl shadow-alert/30 scale-110 px-8 py-4">
          <PhoneCall size={20} className="mr-2 inline animate-pulse" />
          <span className="tracking-widest">SOS</span>
        </DangerButton>
      </div>

    </div>
  );
}
