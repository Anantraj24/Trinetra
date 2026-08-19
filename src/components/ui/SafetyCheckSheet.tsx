'use client';

import { SheetDrawer } from './SheetDrawer';
import { DangerButton } from './DangerButton';
import { RiskReason } from '@/lib/riskEngine';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SafetyCheckSheetProps {
  isOpen: boolean;
  reasons: RiskReason[];
  isDemoMode: boolean;
  onSafe: () => void;
  onHelp: () => void;
  onNoResponse: () => void;
}

export function SafetyCheckSheet({
  isOpen,
  reasons,
  isDemoMode,
  onSafe,
  onHelp,
  onNoResponse
}: SafetyCheckSheetProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    // Note: We don't auto-escalate here because the risk engine handles it via missing check-ins.
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setCountdown(30), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const topReasons = reasons.sort((a, b) => b.contribution - a.contribution).slice(0, 3);

  return (
    <SheetDrawer isOpen={isOpen} onClose={() => {}}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center mb-4 border border-alert/20 animate-pulse">
          <AlertCircle size={32} className="text-alert" />
        </div>
        
        <h2 className="text-xl font-bold text-taupe-dark mb-2">TRINETRA Safety Check</h2>
        <p className="text-taupe mb-6 leading-relaxed">
          We noticed multiple unusual journey signals. Please confirm you are safe.
        </p>

        <div className="w-full bg-ivory-warm rounded-xl p-4 mb-8 border border-sand text-left space-y-3">
          {topReasons.map((reason, i) => (
            <div key={i} className="flex justify-between items-start gap-4">
              <span className="font-bold text-taupe-dark text-sm">{reason.signal}</span>
              <span className="text-taupe text-xs leading-tight flex-1 text-right">{reason.explanation}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={onSafe}
            className="w-full p-4 rounded-full font-bold text-white bg-success hover:bg-[#208b53] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShieldCheck size={20} /> I&apos;M SAFE
          </button>
          
          <DangerButton onClick={onHelp} className="w-full">
            NEED HELP
          </DangerButton>
        </div>

        {isDemoMode && (
          <button 
            onClick={onNoResponse}
            className="mt-6 text-sm font-bold text-taupe hover:text-taupe-dark transition-colors underline"
          >
            SIMULATE NO RESPONSE
          </button>
        )}

        <div className="mt-6 text-xs font-bold text-sand-dark">
          Verification expires in <span className={countdown < 10 ? 'text-alert' : ''}>00:{countdown.toString().padStart(2, '0')}</span>
        </div>
      </div>
    </SheetDrawer>
  );
}
