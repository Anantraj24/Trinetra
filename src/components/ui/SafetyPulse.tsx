import { JourneyMode } from '@/types/index';
import { ShieldCheck, Eye, ShieldAlert, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function SafetyPulse({ status = 'active' }: { status?: 'active' | 'warning' | 'danger' }) {
  const colors = {
    active: 'bg-success',
    warning: 'bg-[#F5A623]',
    danger: 'bg-alert',
  };
  return (
    <div className="relative flex h-4 w-4">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[status]}`}></span>
      <span className={`relative inline-flex rounded-full h-4 w-4 ${colors[status]}`}></span>
    </div>
  );
}

export function SafetyPulseCard({ score = 0, confidence = 1, mode = JourneyMode.NOMAD }: { score?: number; confidence?: number; mode?: JourneyMode }) {
  let statusColor = 'bg-success';
  let textColor = 'text-success';
  let borderClass = 'border-success/30';
  let message = 'All signals nominal. TRINETRA is standing by.';
  let Icon = ShieldCheck;

  if (mode === JourneyMode.WATCH) {
    statusColor = 'bg-[#F5A623]';
    textColor = 'text-[#F5A623]';
    borderClass = 'border-[#F5A623]/30';
    message = 'Unusual signals detected. Monitoring closely.';
    Icon = Eye;
  } else if (mode === JourneyMode.GUARDIAN) {
    statusColor = 'bg-orange-500';
    textColor = 'text-orange-500';
    borderClass = 'border-orange-500/30';
    message = 'Elevated risk. Ready for Safety Check.';
    Icon = Shield;
  } else if (mode === JourneyMode.SENTINEL) {
    statusColor = 'bg-alert';
    textColor = 'text-alert';
    borderClass = 'border-alert/30';
    message = 'Critical risk detected. Escalate immediately.';
    Icon = ShieldAlert;
  }

  return (
    <GlassCard className={`p-6 border-t-4 ${borderClass} flex flex-col`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 ${statusColor}`}></span>
            <div className={`relative flex items-center justify-center rounded-full h-10 w-10 ${statusColor} text-white`}>
              <Icon size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-black text-taupe-dark tracking-tight text-xl">{mode}</h3>
            <p className="text-sm font-medium text-taupe capitalize">{Math.round(confidence * 100)}% Confidence</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black ${textColor}`}>{score}</div>
          <div className="text-xs font-bold text-taupe uppercase tracking-wider">Score</div>
        </div>
      </div>
      
      <div className="bg-sand/30 rounded-xl p-4 mt-auto">
        <p className="text-taupe-dark font-medium text-sm">{message}</p>
      </div>
    </GlassCard>
  );
}