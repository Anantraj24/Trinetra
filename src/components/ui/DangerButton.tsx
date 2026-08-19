export function DangerButton({ children, onClick, disabled, className = '', type = 'button' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string; type?: 'button' | 'submit' | 'reset' }) {
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`bg-alert text-white rounded-full py-4 px-6 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}