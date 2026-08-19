'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, GlassCard, PrimaryButton, SecondaryButton, StatusPill, ShadowCorridorCard } from '@/components/ui';
import { idbService } from '@/services/idbService';
import { offlineSyncService } from '@/services/offlineSyncService';
import { WifiOff, Wifi, ShieldAlert, Database, Map, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { ConnectivityState } from '@/types/index';

export default function SurvivalModePage() {
  const router = useRouter();
  const [queueCount, setQueueCount] = useState(0);
  const [connectivity, setConnectivity] = useState<ConnectivityState>(ConnectivityState.OFFLINE);
  const [hasActiveJourney, setHasActiveJourney] = useState(false);
  const [hasSafetyPack, setHasSafetyPack] = useState(false);

  const fetchStatus = async () => {
    try {
      const queue = await idbService.getSyncQueue();
      setQueueCount(queue?.length || 0);
      
      const active = await idbService.getFirstActiveJourney();
      setHasActiveJourney(!!active);
      
      if (active) {
        const hasPack = await idbService.hasSafetyPack(active.id);
        setHasSafetyPack(hasPack);
      }
      
      setConnectivity(navigator.onLine ? ConnectivityState.ONLINE : ConnectivityState.OFFLINE);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
    
    const handleOnline = () => {
      setConnectivity(ConnectivityState.ONLINE);
      fetchStatus();
    };
    
    const handleOffline = () => {
      setConnectivity(ConnectivityState.OFFLINE);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Poll the queue length periodically
    const interval = setInterval(fetchStatus, 3000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetrySync = async () => {
    await offlineSyncService.syncQueue();
    await fetchStatus();
  };

  const handleSimulateDataLoss = () => {
    setConnectivity(ConnectivityState.OFFLINE);
    // In a real app we might disconnect firebase entirely here
  };

  const handleRestoreConnectivity = () => {
    setConnectivity(ConnectivityState.ONLINE);
    handleRetrySync();
  };

  return (
    <AppSurface>
      <div className="flex flex-col h-full bg-[#3B3530]">
        <div className="p-6 lg:p-12 text-sand flex-1">
          <div className="flex items-center gap-3 mb-6">
            <WifiOff className="text-sand opacity-80" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Survival Mode</h1>
              <p className="text-sand/70 text-sm mt-1">TRINETRA is operating on local reserves.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-[#4A90E2]" />
                <span className="font-bold">TRINETRA Core</span>
              </div>
              <StatusPill label="LOCAL" status="neutral" />
            </GlassCard>

            <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className={hasActiveJourney ? 'text-safe' : 'text-taupe'} />
                <span className="font-bold">Journey Contract</span>
              </div>
              <StatusPill label={hasActiveJourney ? 'CACHED' : 'MISSING'} status={hasActiveJourney ? 'success' : 'alert'} />
            </GlassCard>

            <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={hasSafetyPack ? 'text-warning' : 'text-taupe'} />
                <span className="font-bold">Hazard Pack</span>
              </div>
              <StatusPill label={hasSafetyPack ? 'CACHED' : 'MISSING'} status={hasSafetyPack ? 'alert' : 'neutral'} />
            </GlassCard>

            {hasActiveJourney ? (
              <div className="md:col-span-2">
                <ShadowCorridorCard 
                  onStartGuidance={() => router.push('/tourist/offline/guidance')}
                />
              </div>
            ) : (
              <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Map className="text-taupe" />
                  <span className="font-bold">Shadow Corridor</span>
                </div>
                <StatusPill label="UNAVAILABLE" status="neutral" />
              </GlassCard>
            )}
            
            <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-3">
                <RefreshCw className={queueCount > 0 ? 'text-alert' : 'text-sand/50'} />
                <span className="font-bold">Emergency Queue</span>
              </div>
              <StatusPill label={`${queueCount} PENDING`} status={queueCount > 0 ? 'alert' : 'neutral'} />
            </GlassCard>

            <GlassCard className="!bg-black/20 !border-white/10 p-5 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-3">
                {connectivity === ConnectivityState.ONLINE ? <Wifi className="text-safe" /> : <WifiOff className="text-alert" />}
                <span className="font-bold">Cloud Sync</span>
              </div>
              <StatusPill 
                label={connectivity} 
                status={connectivity === ConnectivityState.ONLINE ? 'success' : 'alert'} 
              />
            </GlassCard>
          </div>

          <div className="grid gap-4 mb-8">
            <PrimaryButton className="w-full flex justify-center items-center gap-2" onClick={handleRetrySync} disabled={connectivity !== ConnectivityState.ONLINE || queueCount === 0}>
              <RefreshCw size={18} /> Retry Sync
            </PrimaryButton>
            {!hasActiveJourney && (
              <SecondaryButton className="w-full text-sand border-sand/30 hover:bg-white/10" onClick={() => {}} disabled>
                <Map size={18} /> View Shadow Corridor
              </SecondaryButton>
            )}
            <SecondaryButton className="w-full text-sand border-sand/30 hover:bg-white/10" onClick={() => {}}>
              <AlertTriangle size={18} /> View Cached Hazards
            </SecondaryButton>
            <SecondaryButton className="w-full text-sand border-sand/30 hover:bg-white/10" onClick={() => router.push('/tourist/journey')}>
              <ArrowLeft size={18} /> Return to Journey
            </SecondaryButton>
          </div>
          
          <div className="border-t border-white/10 pt-6 pb-20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand/50 mb-4">Demo Mode Controls</h4>
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-black/30 py-2 rounded-lg text-sm text-sand/80 hover:bg-black/50 transition-colors"
                onClick={handleSimulateDataLoss}
              >
                Simulate Data Loss
              </button>
              <button 
                className="flex-1 bg-black/30 py-2 rounded-lg text-sm text-sand/80 hover:bg-black/50 transition-colors"
                onClick={handleRestoreConnectivity}
              >
                Restore Connectivity
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppSurface>
  );
}
