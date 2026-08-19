'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/hooks/useDemoMode';
import { UserRole } from '@/types';
import { AppSurface, PrimaryButton, SecondaryButton, Skeleton } from '@/components/ui';
import { Shield } from 'lucide-react';

function EyeLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-taupe-dark">
      <path d="M24 10C14.0589 10 5.48556 16.2917 2 24C5.48556 31.7083 14.0589 38 24 38C33.9411 38 42.5144 31.7083 46 24C42.5144 16.2917 33.9411 10 24 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function RoleEntry() {
  const { user, loading, signInAsRole } = useAuth();
  const { setDemoMode } = useDemoMode();
  const router = useRouter();
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === UserRole.TOURIST) {
        router.push('/tourist');
      } else if (user.role === UserRole.AUTHORITY) {
        router.push('/authority');
      }
    }
  }, [user, loading, router]);

  const handleTouristLogin = async () => {
    setIsHandlingAuth(true);
    setDemoMode(false);
    await signInAsRole(UserRole.TOURIST);
  };

  const handleAuthorityLogin = async () => {
    setIsHandlingAuth(true);
    setDemoMode(false);
    await signInAsRole(UserRole.AUTHORITY);
  };

  const handleDemoMode = async () => {
    setIsHandlingAuth(true);
    setDemoMode(true);
    // Demo defaults to Tourist for demonstration purposes
    await signInAsRole(UserRole.TOURIST);
  };

  if (loading || user || isHandlingAuth) {
    return (
      <AppSurface>
        <div className="flex flex-col gap-4 p-8 w-full max-w-md mx-auto mt-20 items-center">
          <Skeleton className="h-12 w-12 rounded-full mb-8" />
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </AppSurface>
    );
  }

  return (
    <AppSurface>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <EyeLogo />
          <h1 className="text-3xl font-bold text-taupe-dark tracking-tight">TRINETRA</h1>
          <p className="text-taupe text-lg font-medium">Predict. Verify. Protect. Even Offline.</p>
        </div>

        <div className="flex flex-col w-full gap-4 mt-8">
          <PrimaryButton onClick={handleTouristLogin} className="w-full h-14 text-lg">
            Continue as Tourist
          </PrimaryButton>
          
          <PrimaryButton onClick={handleAuthorityLogin} className="w-full h-14 text-lg bg-taupe-dark text-white hover:bg-taupe">
            <Shield size={20} className="mr-2 inline" />
            Authority Login
          </PrimaryButton>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-sand-light"></div>
            <span className="flex-shrink-0 mx-4 text-taupe/50 text-xs uppercase font-bold tracking-wider">SIH 2024</span>
            <div className="flex-grow border-t border-sand-light"></div>
          </div>

          <button
            onClick={() => router.push('/demo')}
            className="w-full h-14 text-base font-bold rounded-full bg-forest text-white hover:bg-forest/90 shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            Launch 19-Step SIH Guided Demo →
          </button>
        </div>
      </div>
    </AppSurface>
  );
}
