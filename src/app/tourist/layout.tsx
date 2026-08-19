'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { DesktopSidebar, BottomDock, ProfileDrawer, NavItem } from '@/components/ui';
import { Home, Shield, Map, Package, User } from 'lucide-react';

export default function TouristLayout({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const touristNavItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/tourist' },
    { icon: Shield, label: 'Safety Pass', href: '/tourist/safety' },
    { icon: Map, label: 'Journey', href: '/tourist/journey' },
    { icon: Package, label: 'Offline Pack', href: '/tourist/offline' },
    { 
      icon: User, 
      label: 'Profile', 
      href: '#', // Prevents active route mismatch
      onClick: () => setIsProfileOpen(true) 
    },
  ];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TOURIST]}>
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <DesktopSidebar items={touristNavItems} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto pb-24 lg:pb-0 relative">
          {children}
        </main>

        {/* Mobile Bottom Dock (hidden on desktop) */}
        <BottomDock items={touristNavItems} />

        {/* Profile Drawer */}
        <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
