// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const dir = path.join(process.cwd(), 'src', 'components', 'ui');
fs.mkdirSync(dir, { recursive: true });

const components = {
  'AppSurface.tsx': `export function AppSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-ivory-warm lg:justify-center overflow-x-hidden">
      <div className="w-full lg:max-w-4xl flex relative min-h-screen bg-ivory-warm shadow-sm">
        {children}
      </div>
    </div>
  );
}`,
  'GlassCard.tsx': `export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-sand-light/50 \${className}\`}>
      {children}
    </div>
  );
}`,
  'PageHeader.tsx': `export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1 px-6 pt-12 pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-taupe-dark">{title}</h1>
      {subtitle && <p className="text-taupe text-lg">{subtitle}</p>}
    </div>
  );
}`,
  'SectionHeader.tsx': `export function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-taupe-dark mb-4">{title}</h2>;
}`,
  'Pill.tsx': `export function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={\`px-3 py-1 rounded-full text-sm font-medium bg-sand-light text-taupe-dark \${className}\`}>
      {children}
    </span>
  );
}`,
  'StatusPill.tsx': `export function StatusPill({ status, label }: { status: 'success' | 'alert' | 'neutral'; label: string }) {
  const styles = {
    success: 'bg-success-soft text-success',
    alert: 'bg-alert-soft text-alert',
    neutral: 'bg-sand-light text-taupe-dark',
  };
  return (
    <span className={\`px-3 py-1 rounded-full text-sm font-medium \${styles[status]}\`}>
      {label}
    </span>
  );
}`,
  'PrimaryButton.tsx': `export function PrimaryButton({ children, onClick, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={\`bg-taupe-dark text-white rounded-full py-4 px-6 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 \${className}\`}
    >
      {children}
    </button>
  );
}`,
  'SecondaryButton.tsx': `export function SecondaryButton({ children, onClick, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={\`bg-sand-light text-taupe-dark rounded-full py-4 px-6 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 \${className}\`}
    >
      {children}
    </button>
  );
}`,
  'DangerButton.tsx': `export function DangerButton({ children, onClick, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={\`bg-alert text-white rounded-full py-4 px-6 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 \${className}\`}
    >
      {children}
    </button>
  );
}`,
  'IconButton.tsx': `import { LucideIcon } from 'lucide-react';
export function IconButton({ icon: Icon, onClick, className = '' }: { icon: LucideIcon; onClick?: () => void; className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={\`p-3 rounded-full bg-sand-light text-taupe-dark hover:bg-sand transition-colors active:scale-95 \${className}\`}
    >
      <Icon size={24} />
    </button>
  );
}`,
  'BottomDock.tsx': `import { Home, Shield, Map, User } from 'lucide-react';
export function BottomDock() {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none lg:hidden z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-full px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-sand-light flex gap-8 pointer-events-auto">
        <button className="text-taupe-dark hover:text-taupe transition-colors"><Home size={24} /></button>
        <button className="text-taupe-dark hover:text-taupe transition-colors"><Map size={24} /></button>
        <button className="text-taupe-dark hover:text-taupe transition-colors"><Shield size={24} /></button>
        <button className="text-taupe-dark hover:text-taupe transition-colors"><User size={24} /></button>
      </div>
    </div>
  );
}`,
  'DesktopSidebar.tsx': `import { Home, Shield, Map, User } from 'lucide-react';
export function DesktopSidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 min-h-screen bg-ivory border-r border-sand-light p-6 z-40 shrink-0">
      <div className="text-2xl font-bold text-taupe-dark mb-12 tracking-tight">TRINETRA</div>
      <nav className="flex flex-col gap-4">
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl bg-sand-light text-taupe-dark font-medium"><Home size={20} /> Home</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><Map size={20} /> Journey</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><Shield size={20} /> Safety</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><User size={20} /> Profile</a>
      </nav>
    </div>
  );
}`,
  'SheetDrawer.tsx': `export function SheetDrawer({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div className="fixed inset-0 bg-taupe-dark/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-3xl p-6 relative shadow-2xl z-10 animate-in slide-in-from-bottom-full duration-300">
        <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mb-6 lg:hidden" />
        {children}
      </div>
    </div>
  );
}`,
  'MetricCard.tsx': `export function MetricCard({ title, value, unit, icon: Icon }: { title: string; value: string | number; unit?: string; icon?: React.ElementType }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-sand-light flex flex-col gap-2">
      <div className="flex items-center gap-2 text-taupe font-medium">
        {Icon && <Icon size={18} />}
        {title}
      </div>
      <div className="text-3xl font-bold text-taupe-dark flex items-baseline gap-1">
        {value}
        {unit && <span className="text-lg text-taupe font-medium">{unit}</span>}
      </div>
    </div>
  );
}`,
  'EmptyState.tsx': `import { FileQuestion } from 'lucide-react';
export function EmptyState({ title, description, icon: Icon = FileQuestion }: { title: string; description: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-sand-light/30 rounded-3xl border border-dashed border-sand">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-taupe mb-4 shadow-sm">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-taupe-dark mb-1">{title}</h3>
      <p className="text-taupe">{description}</p>
    </div>
  );
}`,
  'Skeleton.tsx': `export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={\`animate-pulse bg-sand-light rounded-xl \${className}\`} />
  );
}`,
  'SafetyPulse.tsx': `export function SafetyPulse({ status = 'active' }: { status?: 'active' | 'warning' | 'danger' }) {
  const colors = {
    active: 'bg-success',
    warning: 'bg-[#F5A623]',
    danger: 'bg-alert',
  };
  return (
    <div className="relative flex h-4 w-4">
      <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${colors[status]}\`}></span>
      <span className={\`relative inline-flex rounded-full h-4 w-4 \${colors[status]}\`}></span>
    </div>
  );
}`,
  'ConnectivityBadge.tsx': `import { Wifi, WifiOff } from 'lucide-react';
export function ConnectivityBadge({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft text-success text-xs font-semibold">
        <Wifi size={14} /> ONLINE
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-alert-soft text-alert text-xs font-semibold">
      <WifiOff size={14} /> OFFLINE
    </div>
  );
}`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(dir, name), content);
}
console.log('Components generated.');
