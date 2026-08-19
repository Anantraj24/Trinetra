import { LucideIcon } from 'lucide-react';
export function IconButton({ icon: Icon, onClick, className = '' }: { icon: LucideIcon; onClick?: () => void; className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-full bg-sand-light text-taupe-dark hover:bg-sand transition-colors active:scale-95 ${className}`}
    >
      <Icon size={24} />
    </button>
  );
}