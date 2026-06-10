'use client';

import React, { useState } from 'react';

export default function SignInDesktopPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleBrowserSignIn = async () => {
        setLoading(true);
        setStatus('Starting authentication server...');
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const { listen } = await import('@tauri-apps/api/event');

            let unlisten: (() => void) | null = null;
            unlisten = await listen<string>('auth-code-received', async (event) => {
                const code = event.payload;
                setStatus('Exchanging authorization code...');
                
                try {
                    const res = await fetch('http://localhost:8000/auth/exchange', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    
                    if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.message || 'Token exchange failed');
                    }
                    
                    const data = await res.json();
                    
                    setStatus('Securing tokens in system keychain...');
                    await invoke('save_tokens', { 
                        accessToken: data.access_token, 
                        refreshToken: data.refresh_token 
                    });
                    
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    if (data.email) {
                        localStorage.setItem('user_email', data.email);
                    }
                    
                    setStatus('Successfully authenticated!');
                    
                    if (unlisten) unlisten();
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (err: any) {
                    console.error(err);
                    setStatus(`Authentication failed: ${err.message || err}`);
                    setLoading(false);
                }
            });

            await invoke('start_auth_server');
            setStatus('Waiting for browser authentication...');
        } catch (err: any) {
            console.error('Failed to initiate login:', err);
            setStatus(`Failed to open browser: ${err.message || err}`);
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#fcf9f8] text-[#1c1b1b] h-screen w-full flex overflow-hidden light" style={{ fontFamily: 'Geist, sans-serif' }}>
            {/* Left Side: Login Form */}
            <div className="w-full md:w-[45%] lg:w-[40%] h-full flex flex-col items-center justify-center bg-white px-6 md:px-8 py-8 md:py-12 relative z-10 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-y-auto">
                <div className="w-full max-w-md flex flex-col items-center text-center my-auto">
                    {/* Logo */}
                    <img 
                        alt="SRY Studio Logo" 
                        className="w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-10 rounded-full" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy7il437CLGEn341EIuhEY5GX9phd5WUxN6uWIUDWXvnuH55o2SBxuey0reC98qyphyFBQyZpLp9Wl1I-16jUkSrmRSiQ5U8TnFMyw8lNf-DRtzjGu9ZNbWXTlT0yazQPQtrRRJDxLBKMrjE5jUOYFljQ_I7sUSiKIyZ20LGY0H0Y59HFuz9dMO2LkZPaL07Us7rJ9i5VfMIgK_X-EvgDP0sKlP5XPgiBUCo-xFLKlUAXLNGh4fX7tS7vqqNq0N9j7SDxTAY5z9lE"
                    />
                    {/* Typography */}
                    <h1 className="text-3xl md:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold text-[#1c1b1b] mb-4">Let's get you started</h1>
                    <p className="text-base md:text-[18px] leading-[1.6] text-[#464554] mb-8 md:mb-12 max-w-sm">The most powerful AI Studio</p>
                    
                    {/* CTA */}
                    <button 
                        className="w-full text-white h-12 rounded-xl flex items-center justify-between px-6 hover:bg-zinc-800 transition-colors shadow-sm active:scale-[0.98] bg-black disabled:bg-zinc-500" 
                        onClick={handleBrowserSignIn}
                        disabled={loading}
                    >
                        <span className="text-[13px] leading-[1.4] tracking-[0.02em] font-semibold">
                            {loading ? 'Signing in...' : 'Sign in via browser'}
                        </span>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                    </button>

                    {status && (
                        <p className="mt-4 text-sm font-medium text-[#464554] animate-pulse">
                            {status}
                        </p>
                    )}
                </div>

                {/* Footer Links */}
                <div className="mt-8 md:absolute md:bottom-8 w-full flex justify-center gap-4 text-center">
                    <a className="text-[13px] leading-[1.4] tracking-[0.02em] font-medium text-[#767586] hover:text-[#1c1b1b] transition-colors" href="#">Terms of Service</a>
                    <span className="text-[#c7c4d7]">•</span>
                    <a className="text-[13px] leading-[1.4] tracking-[0.02em] font-medium text-[#767586] hover:text-[#1c1b1b] transition-colors" href="#">Privacy Policy</a>
                </div>
            </div>

            {/* Right Side: Immersive Hero */}
            <div className="hidden md:flex flex-1 h-full relative items-center justify-center bg-[#f0edec] overflow-hidden">
                {/* Background Asset */}
                <div className="absolute inset-0 w-full h-full">
                    <img 
                        alt="A world-class, professional cinematic background for an AI studio. A minimalist 'Silk Flow' aesthetic: flowing ivory and soft lavender fabric textures." 
                        className="w-full h-full object-cover opacity-90" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuClxVw3cnCJJhYGbbgGyfFCZ6GH78nO4S_SvHzw7RQ9dFnF134uD9ms0ggUSTcoAlYlho2UJ4oiRMKTD1ukqG9cUbHhR9iA-Z6ITdWr4XnfmeQJr8dyzaJSiECckCs9uxuR4vAtoq5Bl3O6XFfJUT4QDhb-wlA1DiEdKPN4aeBjCUx6IaUlFUG6daHSzTaYS8H7SFFEVedkE-19VJ6tE273KdynNKvFfS3M-BivSne1v66XFdJtWqWTDVUgRbUppLfD27aeXHrjMiw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>

                {/* Floating UI Element */}
                <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-[#e5e2e1] rounded-[24px] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.04)] w-full max-w-md transform transition-transform hover:-translate-y-1">
                    {/* Slack Mockup Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e5e2e1]">
                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white text-[22px] font-medium">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-[#1c1b1b]">AI Workflows</h3>
                            <p className="text-[13px] font-medium text-[#464554]">Automate creative and production pipelines</p>
                        </div>
                    </div>

                    {/* Workflow Preview */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e1e0ff] flex items-center justify-center text-[#4648d4] font-bold text-sm">
                            WS
                        </div>
                        <div className="flex-1 bg-[#f6f3f2] rounded-2xl rounded-tl-none p-4 shadow-sm border border-[#e5e2e1]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#4648d4] uppercase tracking-wider">Product Studio</span>
                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Active
                                </span>
                            </div>
                            <p className="text-[14px] text-[#1c1b1b] mb-3">
                                Placing product bottle in a premium cinematic marble setup with warm sunset lighting.
                            </p>
                            <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4648d4] h-full w-[75%] rounded-full animate-pulse"></div>
                            </div>
                            <div className="mt-3 text-xs font-medium text-[#767586] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">speed</span>
                                Processing at 14.2 TFLOPS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
