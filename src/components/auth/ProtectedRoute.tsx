'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { AppSurface, EmptyState, Skeleton, PrimaryButton } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, error, signInAsRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !error) {
      // Typically we'd redirect to a login page, but since we are handling role entry here for demo:
      // We can just stay and show the login prompt if user is null
    }
  }, [user, loading, error, router]);

  if (loading) {
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
    return (
      <AppSurface>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-taupe-dark mb-2">TRINETRA</h1>
            <p className="text-taupe">Select your role to enter the prototype.</p>
          </div>
          <PrimaryButton className="w-full" onClick={() => signInAsRole(UserRole.TOURIST)}>
            Enter as Tourist
          </PrimaryButton>
          <PrimaryButton className="w-full bg-taupe-dark text-white hover:bg-taupe" onClick={() => signInAsRole(UserRole.AUTHORITY)}>
            Enter as Authority
          </PrimaryButton>
        </div>
      </AppSurface>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return (
      <AppSurface>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <EmptyState 
            title="Access Denied" 
            description={`Your role (${user.role}) does not have permission to view this page.`}
          />
        </div>
      </AppSurface>
    );
  }

  return <>{children}</>;
}
