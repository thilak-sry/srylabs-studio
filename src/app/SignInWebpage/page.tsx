'use client';

import React, { useState, useEffect } from 'react';

interface SignInWebpageProps {
    onSuccess?: () => void;
}

export default function SignInWebpage({ onSuccess }: SignInWebpageProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [redirectUri, setRedirectUri] = useState<string | null>(null);
    const [redirectStatus, setRedirectStatus] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const rUri = params.get('redirect_uri') || params.get('redirectUri');
        if (rUri) {
            setRedirectUri(rUri);
            
            const token = localStorage.getItem('access_token');
            if (token) {
                const autoRedirect = async () => {
                    setLoading(true);
                    setRedirectStatus('Authenticating your desktop app...');
                    try {
                        const res = await fetch('/api/auth/code', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ access_token: token })
                        });
                        
                        if (!res.ok) {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            setLoading(false);
                            setRedirectStatus('');
                            return;
                        }
                        
                        const data = await res.json();
                        if (data.code) {
                            setRedirectStatus('Redirecting back to SRY Studio...');
                            window.location.href = `${rUri}?code=${data.code}`;
                        }
                    } catch (err) {
                        console.error('Failed auto-redirect:', err);
                        setLoading(false);
                        setRedirectStatus('');
                    }
                };
                
                autoRedirect();
            }
        }
    }, []);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to check email');
            }

            const data = await res.json();
            if (data.exists) {
                setStep('login');
            } else {
                setStep('register');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Invalid email or password');
            }

            const data = await res.json();
            // Store tokens in localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            if (redirectUri) {
                setRedirectStatus('Authenticating your desktop app...');
                try {
                    const codeRes = await fetch('/api/auth/code', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.access_token}`
                        },
                        body: JSON.stringify({ access_token: data.access_token })
                    });
                    if (codeRes.ok) {
                        const codeData = await codeRes.json();
                        setSuccess(true);
                        setRedirectStatus('Redirecting back to SRY Studio...');
                        setTimeout(() => {
                            window.location.href = `${redirectUri}?code=${codeData.code}`;
                        }, 1000);
                        return;
                    }
                } catch (err) {
                    console.error('Failed to get auth code:', err);
                }
            }

            setSuccess(true);
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !password) return;

        setLoading(true);
        setError('');

        try {
            // Register user
            const regRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!regRes.ok) {
                const data = await regRes.json();
                throw new Error(data.message || 'Registration failed.');
            }

            // Immediately login
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!loginRes.ok) {
                const data = await loginRes.json();
                throw new Error(data.message || 'Auto-login failed.');
            }

            const data = await loginRes.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            if (redirectUri) {
                setRedirectStatus('Authenticating your desktop app...');
                try {
                    const codeRes = await fetch('/api/auth/code', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.access_token}`
                        },
                        body: JSON.stringify({ access_token: data.access_token })
                    });
                    if (codeRes.ok) {
                        const codeData = await codeRes.json();
                        setSuccess(true);
                        setRedirectStatus('Redirecting back to SRY Studio...');
                        setTimeout(() => {
                            window.location.href = `${redirectUri}?code=${codeData.code}`;
                        }, 1000);
                        return;
                    }
                } catch (err) {
                    console.error('Failed to get auth code:', err);
                }
            }

            setSuccess(true);
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    if (redirectStatus && loading && !success) {
        return (
            <div 
                className="font-sans text-gray-900 antialiased p-4 min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-cover bg-center bg-no-repeat relative py-8"
                style={{
                    backgroundColor: '#0b1121',
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-46YW63P-owhUgHl73-mk50Dcab5G8jEDO2DkIPgUIw9OAASmQRq7vfxxRV3sNruLDEZeJMjpbQwC3Tn-eOvExBU7brDbnd-y2RbiYkaEtE5UjzBLHabBDRm2OIDTbVRrseNTihWKHBLHLCT2xIdz4fD3l5yy5nhEdQr8SjsVyRz5HIgFS0jG48WBi6IUPh67RmsWXZIYQCvrvmFZ21vs5cGPbVJ8w5m_IEtAHk5f9j4iug_y1n1cYjupeEJ8b-GCzOOKf1oxf6E')",
                    fontFamily: "Inter, sans-serif"
                }}
            >
                <div className="fixed inset-0 w-full h-full z-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)' }} />
                <main className="w-full max-w-md bg-[#fdfbf2] rounded-xl shadow-2xl overflow-hidden py-8 md:py-12 px-6 sm:px-10 md:px-14 flex flex-col items-center relative z-10 text-center">
                    <div className="text-purple-600 text-5xl mb-4 animate-pulse">⟳</div>
                    <h1 className="text-2xl font-semibold mb-2">Connecting to SRY Studio...</h1>
                    <p className="text-gray-600 mb-6">{redirectStatus}</p>
                </main>
            </div>
        );
    }

    if (success) {
        return (
            <div 
                className="font-sans text-gray-900 antialiased p-4 min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-cover bg-center bg-no-repeat relative py-8"
                style={{
                    backgroundColor: '#0b1121',
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-46YW63P-owhUgHl73-mk50Dcab5G8jEDO2DkIPgUIw9OAASmQRq7vfxxRV3sNruLDEZeJMjpbQwC3Tn-eOvExBU7brDbnd-y2RbiYkaEtE5UjzBLHabBDRm2OIDTbVRrseNTihWKHBLHLCT2xIdz4fD3l5yy5nhEdQr8SjsVyRz5HIgFS0jG48WBi6IUPh67RmsWXZIYQCvrvmFZ21vs5cGPbVJ8w5m_IEtAHk5f9j4iug_y1n1cYjupeEJ8b-GCzOOKf1oxf6E')",
                    fontFamily: "Inter, sans-serif"
                }}
            >
                <div className="fixed inset-0 w-full h-full z-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)' }} />
                <main className="w-full max-w-md bg-[#fdfbf2] rounded-xl shadow-2xl overflow-hidden py-8 md:py-12 px-6 sm:px-10 md:px-14 flex flex-col items-center relative z-10 text-center">
                    <div className="text-green-600 text-5xl mb-4">✓</div>
                    <h1 className="text-2xl font-semibold mb-2">Successfully Authenticated!</h1>
                    <p className="text-gray-600 mb-6">{redirectStatus || 'Welcome to SRY Studio.'}</p>
                </main>
            </div>
        );
    }

    return (
        <div
            className="font-sans text-gray-900 antialiased p-4 min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-cover bg-center bg-no-repeat relative py-8"
            style={{
                backgroundColor: '#0b1121',
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-46YW63P-owhUgHl73-mk50Dcab5G8jEDO2DkIPgUIw9OAASmQRq7vfxxRV3sNruLDEZeJMjpbQwC3Tn-eOvExBU7brDbnd-y2RbiYkaEtE5UjzBLHabBDRm2OIDTbVRrseNTihWKHBLHLCT2xIdz4fD3l5yy5nhEdQr8SjsVyRz5HIgFS0jG48WBi6IUPh67RmsWXZIYQCvrvmFZ21vs5cGPbVJ8w5m_IEtAHk5f9j4iug_y1n1cYjupeEJ8b-GCzOOKf1oxf6E')",
                fontFamily: "Inter, sans-serif"
            }}
        >
            {/* Background Overlay */}
            <div
                className="fixed inset-0 w-full h-full z-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)'
                }}
            />

            {/* Login Card */}
            <main className="w-full max-w-md bg-[#fdfbf2] rounded-xl shadow-2xl overflow-hidden py-8 md:py-12 px-6 sm:px-10 md:px-14 flex flex-col items-center relative z-10">
                {/* Header Branding */}
                <div className="text-center mb-6 md:mb-8">
                    <img
                        alt="SRY Studio Logo"
                        className="h-10 md:h-12 w-auto mb-4 md:mb-6 mx-auto"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnWfSQLAEAm1Yp504JzoQEypLymV4xSJkegvjenSIxybZxRxAMPh_1p3_CjDrt9Yxut40qTLemfMv3PVv3NF1_YFYgTaqF9AXzQD5r4G8o6R6qfNowSbuX6RHeMpicF7BBnB0zpjv_95rFNxXaSMBrNw0Xyrfsc2CJvigL8XnSzYjB-C09aWzrBp6VmDLmyJ3ePsqaCLlR8dmUHZH5Sokmfjn4m6Argm_PROtEDR7OMWzI9VcXxjn-Eo_TjtlY3exb4bJXUqj0K5E"
                    />
                    <h1
                        className="text-2xl sm:text-[32px] font-semibold text-gray-900 leading-tight"
                        style={{ fontFamily: "'Crimson Pro', serif" }}
                    >
                        {step === 'register' ? 'Create SRY Account' : 'Log in to SRY Studio'}
                    </h1>
                </div>

                {error && (
                    <div className="w-full mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                {step === 'email' && (
                    <>
                        {/* Email Form */}
                        <form className="w-full" onSubmit={handleEmailSubmit}>
                            <div className="mb-10">
                                <input
                                    className="w-full bg-transparent text-gray-700 placeholder-gray-400 py-2 border-0 border-b border-[#c4c4c4] focus:outline-none focus:ring-0 focus:border-b-[#5e00b8] rounded-none px-0 text-lg"
                                    placeholder="Enter your email"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button
                                className="w-full hover:bg-opacity-90 text-white font-semibold py-3.5 rounded-lg transition-all duration-200 bg-black flex items-center justify-center disabled:bg-zinc-600"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'login' && (
                    <form className="w-full" onSubmit={handleLoginSubmit}>
                        <div className="mb-6">
                            <label className="text-xs text-gray-400 uppercase font-medium">Email Address</label>
                            <input
                                className="w-full bg-transparent text-gray-400 py-2 border-0 border-b border-[#dcd8c9] rounded-none px-0 text-lg cursor-not-allowed"
                                type="email"
                                value={email}
                                readOnly
                            />
                        </div>
                        <div className="mb-10">
                            <label className="text-xs text-gray-400 uppercase font-medium">Password</label>
                            <input
                                className="w-full bg-transparent text-gray-700 placeholder-gray-400 py-2 border-0 border-b border-[#c4c4c4] focus:outline-none focus:ring-0 focus:border-b-[#5e00b8] rounded-none px-0 text-lg"
                                placeholder="Enter your password"
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="w-1/3 hover:bg-zinc-100 text-black border border-black font-semibold py-3.5 rounded-lg transition-all duration-200 bg-transparent"
                                type="button"
                                onClick={() => { setStep('email'); setPassword(''); }}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                className="w-2/3 hover:bg-opacity-90 text-white font-semibold py-3.5 rounded-lg transition-all duration-200 bg-black flex items-center justify-center disabled:bg-zinc-600"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'register' && (
                    <form className="w-full" onSubmit={handleRegisterSubmit}>
                        <div className="mb-6">
                            <label className="text-xs text-gray-400 uppercase font-medium">Email Address</label>
                            <input
                                className="w-full bg-transparent text-gray-400 py-2 border-0 border-b border-[#dcd8c9] rounded-none px-0 text-lg cursor-not-allowed"
                                type="email"
                                value={email}
                                readOnly
                            />
                        </div>
                        <div className="mb-6">
                            <label className="text-xs text-gray-400 uppercase font-medium">Full Name</label>
                            <input
                                className="w-full bg-transparent text-gray-700 placeholder-gray-400 py-2 border-0 border-b border-[#c4c4c4] focus:outline-none focus:ring-0 focus:border-b-[#5e00b8] rounded-none px-0 text-lg"
                                placeholder="Enter your name"
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <div className="mb-10">
                            <label className="text-xs text-gray-400 uppercase font-medium">Password (Min 6 chars)</label>
                            <input
                                className="w-full bg-transparent text-gray-700 placeholder-gray-400 py-2 border-0 border-b border-[#c4c4c4] focus:outline-none focus:ring-0 focus:border-b-[#5e00b8] rounded-none px-0 text-lg"
                                placeholder="Create a password"
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="w-1/3 hover:bg-zinc-100 text-black border border-black font-semibold py-3.5 rounded-lg transition-all duration-200 bg-transparent"
                                type="button"
                                onClick={() => { setStep('email'); setPassword(''); setName(''); }}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                className="w-2/3 hover:bg-opacity-90 text-white font-semibold py-3.5 rounded-lg transition-all duration-200 bg-black flex items-center justify-center disabled:bg-zinc-600"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
