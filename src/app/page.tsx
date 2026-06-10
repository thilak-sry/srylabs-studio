'use client';

import React, { useState, useEffect } from 'react';
import HomePage from "./HomePage/page";
import SignInDesktopPage from "./SignInDesktop/page";
import SignInWebpage from "./SignInWebpage/page";

export default function Home() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const desktop = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
      setIsDesktop(desktop);
      
      if (desktop) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const tokens = await invoke<[string, string] | null>('get_tokens');
          if (tokens) {
            const [accessToken, refreshToken] = tokens;
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Failed to get tokens from keychain:', err);
          setIsAuthenticated(false);
        }
      } else {
        const token = localStorage.getItem('access_token');
        setIsAuthenticated(!!token);
      }
    };
    
    checkAuth();
  }, []);

  if (isDesktop === null) {
    return (
      <div className="bg-[#f5f4f0] h-screen w-full flex items-center justify-center text-zinc-400 font-sans">
        Loading SRY Studio...
      </div>
    );
  }

  if (isAuthenticated) {
    return <HomePage />;
  }

  if (isDesktop) {
    return <SignInDesktopPage />;
  }

  return <SignInWebpage onSuccess={() => setIsAuthenticated(true)} />;
}
