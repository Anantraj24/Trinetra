export function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-sand-light text-taupe-dark ${className}`}>
      {children}
    </span>
  );
}