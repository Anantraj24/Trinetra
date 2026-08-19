'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { DesktopSidebar, ProfileDrawer, NavItem } from '@/components/ui';
import { ShieldAlert, AlertTriangle, Users, History, Activity, User } from 'lucide-react';

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        {/* We use DesktopSidebar for authority, but to ensure they can navigate on mobile we can override the hidden class if needed, or rely on desktop use for authorities as requested */}
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
