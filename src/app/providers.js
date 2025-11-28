'use client';

import { useEffect } from 'react';

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || Date.now();

export function Providers({ children }) {
  useEffect(() => {
    // Check for updates every 5 minutes
    const checkInterval = setInterval(() => {
      fetch('/').then((res) => {
        const newBuildId = res.headers.get('X-Build-ID');
        if (newBuildId && newBuildId !== BUILD_ID) {
          // New build available
          window.location.reload();
        }
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, []);

  return children;
}