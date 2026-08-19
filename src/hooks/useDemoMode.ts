'use client';

import { useState, useEffect } from 'react';

const DEMO_MODE_KEY = 'trinetra_demo_mode';

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Read from session storage on mount
    try {
      const stored = sessionStorage.getItem(DEMO_MODE_KEY);
      if (stored === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDemoMode(true);
      }
    } catch (e) {
      console.error('Failed to read demo mode from session storage', e);
    }
    setIsInitialized(true);
  }, []);

  const setDemoMode = (active: boolean) => {
    setIsDemoMode(active);
    try {
      if (active) {
        sessionStorage.setItem(DEMO_MODE_KEY, 'true');
      } else {
        sessionStorage.removeItem(DEMO_MODE_KEY);
      }
    } catch (e) {
      console.error('Failed to write demo mode to session storage', e);
    }
  };

  return { isDemoMode, setDemoMode, isInitialized };
}
