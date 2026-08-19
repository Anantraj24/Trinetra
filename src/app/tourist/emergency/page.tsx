'use client';

import { useRouter } from 'next/navigation';
import { AppSurface, PrimaryButton } from '@/components/ui';
import { ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EmergencyStatusPage() {
  const router = useRouter();
  
  // Fake state for demo visual progress
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2000);
    const t2 = setTimeout(() => setStage(2), 5000);
    const t3 = setTimeout(() => setStage(3), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex-1 bg-alert/5 p-6 lg:p-12 w-full min-h-[calc(100vh-80px)] flex flex-col relative pb-32">
      
      <div className="flex flex-col items-center justify-center pt-8 pb-12 text-center">
        <div className="w-24 h-24 bg-alert/20 rounded-full flex items-center justify-center mb-6 animate-pulse border-4 border-alert/30">
          <ShieldAlert size={48} className="text-alert" />
        </div>
        
        <h1 className="text-3xl font-black text-alert mb-2 tracking-tight">EMERGENCY SOS</h1>
        <p className="text-taupe-dark font-medium max-w-md">
          TRINETRA has broadcasted your Rescue Capsule. Responders are being notified. Stay calm and preserve battery.
        </p>
      </div>

      <AppSurface className="p-6 md:p-8 max-w-lg mx-auto w-full border border-alert/20 bg-white">
        <h3 className="font-bold text-taupe-dark mb-6 border-b border-sand pb-4">Rescue Protocol Status</h3>
        
        <div className="space-y-6 relative">
          
          {/* Timeline track */}
          <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-sand-light -z-10" />

          {/* Stage 0 */}
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stage >= 0 ? 'bg-success text-white' : 'bg-sand text-white'}`}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className={`font-bold ${stage >= 0 ? 'text-taupe-dark' : 'text-taupe'}`}>SOS Triggered</p>
              <p className="text-xs text-taupe mt-1">Manual trigger or system auto-escalation registered.</p>
            </div>
          </div>

          {/* Stage 1 */}
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stage >= 1 ? 'bg-success text-white' : stage === 0 ? 'bg-alert/20 text-alert animate-pulse' : 'bg-sand text-white'}`}>
              {stage >= 1 ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-alert" />}
            </div>
            <div>
              <p className={`font-bold ${stage >= 1 ? 'text-taupe-dark' : 'text-taupe'}`}>Rescue Capsule Compiled</p>
              <p className="text-xs text-taupe mt-1">Journey data, offline telemetry, and safety pass combined.</p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stage >= 2 ? 'bg-success text-white' : stage === 1 ? 'bg-alert/20 text-alert animate-pulse' : 'bg-sand text-white'}`}>
              {stage >= 2 ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-alert" />}
            </div>
            <div>
              <p className={`font-bold ${stage >= 2 ? 'text-taupe-dark' : 'text-taupe'}`}>Transmitting via Shadow Network</p>
              <p className="text-xs text-taupe mt-1">Searching for nearby peer devices or cellular signals...</p>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stage >= 3 ? 'bg-success text-white' : stage === 2 ? 'bg-alert/20 text-alert animate-pulse' : 'bg-sand text-white'}`}>
              {stage >= 3 ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-alert" />}
            </div>
            <div>
              <p className={`font-bold ${stage >= 3 ? 'text-taupe-dark' : 'text-taupe'}`}>Authority Nexus Acknowledged</p>
              <p className="text-xs text-taupe mt-1">Responders have received your capsule and last known location.</p>
            </div>
          </div>

        </div>

      </AppSurface>

      <div className="max-w-lg mx-auto w-full mt-8 flex flex-col gap-4">
        <PrimaryButton className="w-full bg-alert hover:bg-red-600 flex items-center justify-center gap-2">
          <PhoneCall size={18} /> Call Local Emergency Services
        </PrimaryButton>
        <button 
          onClick={() => router.push('/tourist/journey')} 
          className="text-taupe font-bold text-sm underline hover:text-taupe-dark"
        >
          Return to Dashboard
        </button>
      </div>

    </div>
  );
}
