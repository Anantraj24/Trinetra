export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-sand-light/50 ${className}`}>
      {children}
    </div>
  );
}