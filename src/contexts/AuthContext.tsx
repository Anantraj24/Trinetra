'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser, createUser } from '@/services/db';
import { UserDocument } from '@/lib/schemas';
import { UserRole } from '@/types';

interface AuthContextType {
  user: UserDocument | null;
  loading: boolean;
  error: Error | null;
  signInAsRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInAsRole: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If auth is undefined (e.g. env config missing), we should not crash the app
    // but just set error state or keep loading false so UI can show a warning
    if (!auth) {
      setError(new Error('Firebase auth not initialized'));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch custom user profile
          const userProfile = await getUser(firebaseUser.uid);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAsRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const { user: fbUser } = await signInAnonymously(auth);
      // Check if user exists in our db, if not, create
      const existingUser = await getUser(fbUser.uid);
      if (!existingUser) {
        const newUser: UserDocument = {
          uid: fbUser.uid,
          role,
          name: `${role} ${fbUser.uid.substring(0, 4)}`,
        };
        await createUser(newUser);
        setUser(newUser);
      } else {
        // If they exist but want a different role, maybe we just update it
        // For prototype, we can just set it
        setUser(existingUser);
      }
    } catch (err: any) {
      console.error('SignIn Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('SignOut Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInAsRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
