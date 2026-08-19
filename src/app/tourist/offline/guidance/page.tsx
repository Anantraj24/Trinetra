'use client';

import { useRouter } from 'next/navigation';
import { AppSurface, PrimaryButton, SecondaryButton } from '@/components/ui';
import { Navigation, Map, ShieldAlert, ArrowLeft, TriangleAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { idbService } from '@/services/idbService';
import { Hazard, HazardTrustLevel } from '@/types/index';

export default function OfflineGuidancePage() {
  const router = useRouter();
  const [hazard, setHazard] = useState<Hazard | null>(null);

  useEffect(() => {
    // In a real app we'd load the nearest hazard from the cached pack
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHazard({
      id: 'demo-hazard-1',
      type: 'Flash Flood Warning',
      severity: 0.85,
      trustLevel: HazardTrustLevel.VERIFIED,
      source: 'Local Meteorological Department',
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      distance: 2.5,
      description: 'Severe flash flooding detected along the primary river crossing. Primary route is impassable.'
    });
  }, []);

  return (
    <AppSurface>
      <div className="flex flex-col h-full bg-[#2A2624]">
        <div className="flex-1 relative flex flex-col">
          {/* Main Map Area */}
          <div className="flex-1 relative bg-black/60 overflow-hidden">
            {/* SVG Offline Map */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
              <path d="M 50 500 Q 150 400 200 300 T 350 100" fill="none" stroke="#e0d7c5" strokeWidth="3" strokeDasharray="6 6" opacity="0.4" />
              
              {/* Fallback corridor */}
              <path d="M 50 500 Q 80 350 200 200 T 300 50" fill="none" stroke="#4A90E2" strokeWidth="6" strokeDasharray="8 6" />
              
              {/* Hazard */}
              <circle cx="200" cy="300" r="60" fill="rgba(231, 76, 60, 0.15)" stroke="#e74c3c" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="200" cy="300" r="8" fill="#e74c3c" />
              
              {/* Safe Checkpoint */}
              <rect x="285" y="35" width="30" height="30" rx="6" fill="#2ecc71" />
              
              {/* User Position */}
              <circle cx="50" cy="500" r="10" fill="#4A90E2" stroke="#fff" strokeWidth="3" />
            </svg>

            {/* Floating Top Bar */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-sand/80 hover:text-sand">
                <ArrowLeft size={20} />
                <span className="font-medium text-sm">Exit Guidance</span>
              </button>
            </div>
          </div>

          {/* Bottom Guidance Drawer */}
          <div className="bg-[#3B3530] p-6 rounded-t-3xl shadow-2xl z-10 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation size={24} className="text-safe" />
                <h2 className="text-xl font-bold text-sand">Guidance Active</h2>
              </div>
              <div className="bg-black/30 px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-sand/80">
                OFFLINE MODE
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sand/60 text-xs font-bold uppercase tracking-wider mb-1">Next Checkpoint</p>
                  <p className="text-lg font-bold text-sand">Ranger Station Alpha</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-safe">4.2 <span className="text-sm text-sand/60">km</span></p>
                </div>
              </div>
              <p className="text-sand/80 text-sm">Follow the blue dashed corridor. Avoid the primary route valley.</p>
            </div>

            {hazard && (
              <div className="flex items-start gap-3 p-3 mb-6 rounded-xl bg-alert/10 border border-alert/20">
                <TriangleAlert size={20} className="text-alert shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-alert mb-1">Hazard Ahead</h4>
                  <p className="text-xs text-sand/80 line-clamp-2">{hazard.description}</p>
                </div>
              </div>
            )}

            <PrimaryButton className="w-full flex items-center justify-center gap-2 py-4 text-lg">
              <ShieldAlert size={20} />
              EMERGENCY SOS
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AppSurface>
  );
}
