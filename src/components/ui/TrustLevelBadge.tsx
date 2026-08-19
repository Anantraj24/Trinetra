import { HazardTrustLevel } from '@/types/index';
import { ShieldCheck, Landmark, Cpu, Eye, ShieldQuestion } from 'lucide-react';

interface TrustLevelBadgeProps {
  level: HazardTrustLevel;
  className?: string;
}

export function TrustLevelBadge({ level, className = '' }: TrustLevelBadgeProps) {
  const getConfig = () => {
    switch (level) {
      case HazardTrustLevel.VERIFIED:
        return {
          icon: <ShieldCheck size={14} className="mr-1.5" />,
          label: 'AUTHORITY VERIFIED',
          styles: 'bg-safe/10 text-safe border border-safe/20',
        };
      case HazardTrustLevel.ESTABLISHED:
        return {
          icon: <Landmark size={14} className="mr-1.5" />,
          label: 'ESTABLISHED SOURCE',
          styles: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        };
      case HazardTrustLevel.AUTOMATED:
        return {
          icon: <Cpu size={14} className="mr-1.5" />,
          label: 'SYSTEM GENERATED',
          styles: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
        };
      case HazardTrustLevel.INFERRED:
        return {
          icon: <Eye size={14} className="mr-1.5" />,
          label: 'INFERRED RISK',
          styles: 'bg-taupe/20 text-sand/70 border border-dashed border-sand/30',
        };
      case HazardTrustLevel.UNVERIFIED:
        return {
          icon: <ShieldQuestion size={14} className="mr-1.5" />,
          label: 'UNVERIFIED REPORT',
          styles: 'bg-warning/10 text-warning border border-warning/20',
        };
      default:
        return {
          icon: <ShieldQuestion size={14} className="mr-1.5" />,
          label: 'UNKNOWN',
          styles: 'bg-taupe/20 text-sand/50',
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider ${config.styles} ${className}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
