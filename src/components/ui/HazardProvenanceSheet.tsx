import { Hazard, HazardTrustLevel } from '@/types/index';
import { SheetDrawer } from './SheetDrawer';
import { TrustLevelBadge } from './TrustLevelBadge';
import { ShieldCheck, Calendar, Info, MapPin } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface HazardProvenanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: Hazard | null;
}

export function HazardProvenanceSheet({ isOpen, onClose, hazard }: HazardProvenanceSheetProps) {
  if (!hazard) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getTrustDescription = (level: HazardTrustLevel) => {
    switch(level) {
      case HazardTrustLevel.VERIFIED:
        return 'This information has been verified by an official authority or emergency service. It is considered highly reliable.';
      case HazardTrustLevel.ESTABLISHED:
        return 'This report comes from an established institutional source. It is considered reliable.';
      case HazardTrustLevel.AUTOMATED:
        return 'This hazard was detected automatically by sensors or systemic monitoring. Subject to minor inaccuracies.';
      case HazardTrustLevel.INFERRED:
        return 'This risk was inferred from community signals, telemetry anomalies, or historical patterns. Proceed with caution.';
      case HazardTrustLevel.UNVERIFIED:
        return 'This is an unverified report from a single source. It has not been confirmed by authorities.';
      default:
        return 'Provenance unknown.';
    }
  };

  return (
    <SheetDrawer isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-sand mb-2">{hazard.type}</h3>
          <p className="text-sand/80 text-sm">{hazard.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-sand/60 text-sm font-medium">Trust Level</span>
            <TrustLevelBadge level={hazard.trustLevel} />
          </div>
          
          <p className="text-sand/80 text-sm pt-2 border-t border-white/5">
            {getTrustDescription(hazard.trustLevel)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sand/80">
            <Info size={18} className="text-taupe" />
            <div className="text-sm">
              <span className="text-sand/50 block text-xs">Source</span>
              <span className="font-medium">{hazard.source}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sand/80">
            <Calendar size={18} className="text-taupe" />
            <div className="text-sm">
              <span className="text-sand/50 block text-xs">Published</span>
              <span className="font-medium">{formatDate(hazard.publishedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sand/80">
            <Calendar size={18} className="text-taupe" />
            <div className="text-sm">
              <span className="text-sand/50 block text-xs">Expires</span>
              <span className="font-medium">{formatDate(hazard.expiresAt)}</span>
            </div>
          </div>

          {hazard.distance !== undefined && (
            <div className="flex items-center gap-3 text-sand/80">
              <MapPin size={18} className="text-taupe" />
              <div className="text-sm">
                <span className="text-sand/50 block text-xs">Distance</span>
                <span className="font-medium">{hazard.distance} km away</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <PrimaryButton className="w-full" onClick={onClose}>
            Acknowledge
          </PrimaryButton>
        </div>
      </div>
    </SheetDrawer>
  );
}
