'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { DesktopSidebar, ProfileDrawer, NavItem, SheetDrawer } from '@/components/ui';
import { ShieldAlert, AlertTriangle, Users, History, Activity, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const authorityNavItems: NavItem[] = [
    { icon: Activity, label: 'Nexus', href: '/authority' },
    { icon: ShieldAlert, label: 'Incidents', href: '/authority/incidents' },
    { icon: AlertTriangle, label: 'Hazards', href: '/authority/hazards' },
    { icon: Users, label: 'Responders', href: '/authority/responders' },
    { icon: History, label: 'History', href: '/authority/history' },
    { 
      icon: User, 
      label: 'Profile', 
      href: '#',
      onClick: () => setIsProfileOpen(true) 
    },
  ];

  return (
    <ProtectedRoute allowedRoles={[UserRole.AUTHORITY]}>
      <div className="flex h-screen bg-zinc-50 overflow-hidden flex-col lg:flex-row">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-ivory border-b border-sand-light">
          <div className="text-xl font-bold text-taupe-dark tracking-tight">TRINETRA Nexus</div>
          <button onClick={() => setIsMobileNavOpen(true)} className="p-2">
            <Menu className="text-taupe-dark" />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <SheetDrawer isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold text-taupe-dark">Menu</div>
              <button onClick={() => setIsMobileNavOpen(false)}><X className="text-taupe" /></button>
            </div>
            {authorityNavItems.map(item => {
              const Icon = item.icon;
              if (item.onClick) {
                return (
                  <button 
                    key={item.label}
                    onClick={() => { item.onClick!(); setIsMobileNavOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors w-full text-left font-medium"
                  >
                    <Icon size={20} /> {item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl font-medium transition-colors ${
                    pathname === item.href ? 'bg-sand-light text-taupe-dark' : 'text-taupe hover:bg-sand-light/50'
                  }`}
                >
                  <Icon size={20} /> {item.label}
                </Link>
              );
            })}
          </div>
        </SheetDrawer>

        {/* Desktop Sidebar */}
        <DesktopSidebar items={authorityNavItems} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
          {children}
        </main>

        {/* Profile Drawer */}
        <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
