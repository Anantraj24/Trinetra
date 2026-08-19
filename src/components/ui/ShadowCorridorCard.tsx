import { Hazard } from '@/types/index';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { Map as MapIcon, Navigation, Route, AlertTriangle } from 'lucide-react';

interface ShadowCorridorCardProps {
  hazard?: Hazard;
  nearestCheckpoint?: string;
  distanceKm?: number;
  direction?: string;
  onStartGuidance?: () => void;
  className?: string;
}

export function ShadowCorridorCard({ 
  hazard, 
  nearestCheckpoint = 'Ranger Station Alpha',
  distanceKm = 4.2,
  direction = 'North-West',
  onStartGuidance,
  className = ''
}: ShadowCorridorCardProps) {
  
  return (
    <GlassCard className={`p-0 overflow-hidden border-white/10 ${className}`}>
      {/* Map visualization area (SVG placeholder) */}
      <div className="h-48 bg-black/40 relative flex items-center justify-center p-4">
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M 50 150 Q 150 150 200 100 T 350 50" fill="none" stroke="#e0d7c5" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 50 150 Q 120 180 200 120 T 350 100" fill="none" stroke="#2ecc71" strokeWidth="4" />
          {/* Hazard area */}
          <circle cx="200" cy="100" r="30" fill="rgba(231, 76, 60, 0.2)" stroke="#e74c3c" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="200" cy="100" r="4" fill="#e74c3c" />
          
          {/* Fallback corridor */}
          <path d="M 120 160 Q 200 200 280 140 T 350 100" fill="none" stroke="#4A90E2" strokeWidth="3" strokeDasharray="6 4" />
          
          {/* Safe Checkpoint */}
          <rect x="270" y="130" width="20" height="20" rx="4" fill="#2ecc71" />
        </svg>
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <MapIcon size={14} className="text-safe" />
          <span className="text-xs font-bold text-sand tracking-wide">SHADOW CORRIDOR ACTIVE</span>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-5">
        {hazard && (
          <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-alert/10 border border-alert/20">
            <AlertTriangle size={20} className="text-alert shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-alert mb-1">Route Affected: {hazard.type}</h4>
              <p className="text-xs text-sand/80 line-clamp-1">{hazard.description}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-taupe mb-1">
              <Route size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">Fallback Checkpoint</span>
            </div>
            <p className="font-bold text-sand">{nearestCheckpoint}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-1.5 text-taupe mb-1">
              <Navigation size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">Distance & Dir</span>
            </div>
            <p className="font-bold text-sand">{distanceKm} km {direction}</p>
          </div>
        </div>
        
        <PrimaryButton 
          className="w-full flex items-center justify-center gap-2"
          onClick={onStartGuidance}
        >
          <Navigation size={18} />
          START OFFLINE GUIDANCE
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
