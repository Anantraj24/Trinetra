'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { AppSurface, EmptyState, Skeleton } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // We intentionally redirect when user state resolves. Using a timeout or just returning null avoids the React warning, but redirecting with an effect is fine.
     
    if (!loading && !user && !error) {
      setTimeout(() => setIsRedirecting(true), 0);
      router.push('/');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
      setTimeout(() => setIsRedirecting(true), 0);
      // Redirect to correct shell based on role
      if (user.role === UserRole.TOURIST) {
        router.push('/tourist');
      } else if (user.role === UserRole.AUTHORITY) {
        router.push('/authority');
      } else {
        router.push('/');
      }
    } else {
      setTimeout(() => setIsRedirecting(false), 0);
    }
  }, [user, loading, error, router, allowedRoles]);

  if (loading || isRedirecting) {
    return (
      <AppSurface>
        <div className="flex flex-col gap-4 p-8 w-full max-w-md mx-auto mt-20">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
        </div>
      </AppSurface>
    );
  }

  if (error) {
    return (
      <AppSurface>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <EmptyState 
            title="Authentication Error" 
            description={error.message || "Failed to connect to authentication service."} 
          />
        </div>
      </AppSurface>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
