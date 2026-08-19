import { Home, Shield, Map, User } from 'lucide-react';
export function DesktopSidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-ivory border-r border-sand-light p-6 z-40 shrink-0">
      <div className="text-2xl font-bold text-taupe-dark mb-12 tracking-tight">TRINETRA</div>
      <nav className="flex flex-col gap-4">
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl bg-sand-light text-taupe-dark font-medium"><Home size={20} /> Home</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><Map size={20} /> Journey</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><Shield size={20} /> Safety</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors"><User size={20} /> Profile</a>
      </nav>
    </div>
  );
}