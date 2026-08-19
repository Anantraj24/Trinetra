import { Home, Shield, Map, User } from 'lucide-react';
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
}