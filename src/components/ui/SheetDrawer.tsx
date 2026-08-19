export function SheetDrawer({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
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
}