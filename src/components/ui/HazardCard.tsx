import { Hazard } from '@/types/index';
import { GlassCard } from './GlassCard';
import { TrustLevelBadge } from './TrustLevelBadge';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

interface HazardCardProps {
  hazard: Hazard;
  onClick?: () => void;
}

export function HazardCard({ hazard, onClick }: HazardCardProps) {
  const isHighSeverity = hazard.severity >= 0.8;
  const cardBorder = isHighSeverity ? 'border-alert/30' : 'border-white/5';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`transition-all ${cardBorder} ${onClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
      onClick={onClick}
    >
      <GlassCard className="p-4">
        <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 text-sand">
          <AlertTriangle size={18} className={isHighSeverity ? 'text-alert' : 'text-warning'} />
          <h3 className="font-bold text-lg">{hazard.type}</h3>
        </div>
        <TrustLevelBadge level={hazard.trustLevel} />
      </div>
      
      <p className="text-sand/80 text-sm mb-4 line-clamp-2">
        {hazard.description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-sand/60">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>Reported {formatDate(hazard.publishedAt)}</span>
        </div>
        {hazard.distance !== undefined && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{hazard.distance}km away</span>
          </div>
        )}
      </div>
      </GlassCard>
    </div>
  );
}
