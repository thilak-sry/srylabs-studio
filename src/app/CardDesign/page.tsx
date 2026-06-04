'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ImageCompare from './ImageCompare';

export default function CardDesignPage() {

  // Interaction State
  const [prompt, setPrompt] = useState('A winding river through a valley with snowy mountain peaks, highly detailed...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPro, setIsPro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  // Settings configs
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [sampler, setSampler] = useState('DPM++ 2M Karras');

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'AI Image Generator finished successfully', read: false, time: '2m ago' },
    { id: '2', text: 'You are using 75% of your free credits', read: true, time: '1h ago' },
    { id: '3', text: 'Welcome to Flow Pro trial!', read: true, time: '1d ago' },
  ]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Simulated Generation Handler
  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    showToast('Starting AI image generation...');
    
    // Simulate generation loading with a simple delay
    setTimeout(() => {
      setIsGenerating(false);
      showToast('Image generated successfully in 0.8s!');
    }, 1500);
  };

  const activeNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-[#f0edec] text-on-surface font-body-md h-screen w-full overflow-hidden select-none relative flex justify-center">
      <div className="flex h-full w-full max-w-[1840px] relative">
        
        {/* SIDEBAR */}
        <aside className="w-[240px] h-full flex flex-col bg-[#f0edec] shrink-0">
          <div className="p-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <h1 className="font-headline-md text-xl font-bold">SRY Labs</h1>
              <span className="bg-[#f0dbff] text-[#6900b3] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">
                {isPro ? 'Pro' : 'Trial'}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-all text-left"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span className="text-[14px]">Home</span>
            </Link>

            <a
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg sidebar-active text-on-surface font-semibold"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
              <span className="text-[14px]">Workflows</span>
            </a>

            <a
              onClick={() => showToast('Assets folder accessed')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-colors cursor-pointer"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">folder_open</span>
              <span className="text-[14px]">Assets</span>
            </a>

            <a
              onClick={() => showToast('Models manager loaded')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-colors cursor-pointer"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">memory</span>
              <span className="text-[14px]">Models</span>
            </a>

            <a
              onClick={() => showToast('Generation history loaded')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-colors cursor-pointer"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              <span className="text-[14px]">History</span>
            </a>
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-[#f8f0ff] p-4 rounded-xl mb-4 border border-[#e1e0ff]">
              <p className="text-[13px] font-bold text-primary mb-1">
                Trial ends in <span className="font-black">14 days</span>
              </p>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
                Upgrade to Flow Pro to keep unlimited words and Pro features.
              </p>
              <button
                onClick={() => showToast('Already upgraded or Pro activated')}
                className="w-full bg-black text-white py-2 rounded-lg text-[13px] font-bold hover:bg-zinc-800 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>

            <div className="space-y-1">
              <a
                onClick={() => showToast('Invite referral link copied')}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-zinc-200/50 rounded-lg cursor-pointer text-[13px]"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Invite your team</span>
              </a>
              <a
                onClick={() => showToast('Opened Settings')}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-zinc-200/50 rounded-lg cursor-pointer text-[13px]"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Settings</span>
              </a>
              <a
                onClick={() => showToast('Opened Help docs')}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-zinc-200/50 rounded-lg cursor-pointer text-[13px]"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
                <span>Help</span>
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 h-full flex flex-col pt-16 pb-6 pr-6 pl-6 min-w-0 relative">
          
          {/* Top Header Overlayed */}
          <header className="absolute top-0 right-0 left-0 h-16 flex justify-end items-center px-10 pointer-events-none z-30">
            <div className="flex items-center gap-6 pointer-events-auto">
              {/* Interactive Search toggle */}
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`px-3 py-1 bg-white/80 backdrop-blur border border-zinc-200 rounded-lg text-xs transition-all duration-300 focus:outline-none focus:border-primary text-on-surface ${
                    searchVisible || searchQuery ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                  }`}
                />
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="p-1 hover:bg-zinc-200/50 rounded-full transition-colors flex items-center justify-center focus:outline-none text-on-surface-variant hover:text-on-surface"
                  title="Search workflows"
                >
                  <span className="material-symbols-outlined text-[22px] cursor-pointer">search</span>
                </button>
              </div>

              <div className="flex items-center gap-5">
                {/* Notifications Popover */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-1 hover:bg-zinc-200/50 rounded-full transition-colors flex items-center justify-center focus:outline-none text-on-surface-variant hover:text-on-surface"
                  >
                    {activeNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center border-2 border-[#f0edec] font-bold">
                        {activeNotificationsCount}
                      </span>
                    )}
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant/40 rounded-xl shadow-lg z-50 p-4 animate-in fade-in duration-200 text-left">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-on-surface">Notifications</h4>
                        {activeNotificationsCount > 0 && (
                          <button
                            onClick={() => {
                              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                              showToast('Cleared notifications');
                            }}
                            className="text-[11px] text-primary font-bold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-[12px] text-on-surface-variant text-center py-4">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setNotifications((prev) =>
                                  prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                                );
                              }}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors text-[12px] ${
                                n.read
                                  ? 'bg-zinc-50 border-zinc-100 text-zinc-600'
                                  : 'bg-indigo-50/50 border-indigo-100 text-on-surface font-medium'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span>{n.text}</span>
                                <span className="text-[9px] text-zinc-400 shrink-0 font-normal">{n.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu Popover */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="p-1 hover:bg-zinc-200/50 rounded-full transition-colors flex items-center justify-center focus:outline-none text-on-surface-variant hover:text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">person</span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/40 rounded-xl shadow-lg z-50 py-2 text-left">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <p className="text-[13px] font-bold text-on-surface">Thilak</p>
                        <p className="text-[11px] text-on-surface-variant truncate">thilak@whisperflow.ai</p>
                      </div>
                      <Link
                        href="/"
                        className="block w-full text-left px-4 py-2 text-[12px] hover:bg-zinc-50 text-on-surface font-medium"
                      >
                        Return to Dashboard
                      </Link>
                      <div className="border-t border-zinc-100 my-1"></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          showToast('Logged out');
                        }}
                        className="w-full text-left px-4 py-2 text-[12px] hover:bg-zinc-50 text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* INNER CARD SLIDER BLOCK */}
          <main className="flex-1 flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm relative min-h-0">
            <ImageCompare
              beforeImage="/comparison-before.jpg"
              afterImage="/comparison-after.jpg"
              alt="Mountain River Valley"
              className="flex-1 min-h-0"
            />

            {/* Metadata Info Overlays */}
            <div className="absolute top-16 left-10 z-20 max-w-lg pointer-events-none">
              <h2 className="font-headline-xl text-[40px] text-white tracking-tight drop-shadow-lg mb-2 font-semibold">
                Landscape Diffusion
              </h2>
              <p className="text-white/80 font-body-md drop-shadow-md max-w-md leading-relaxed">
                Render the exact same valley scene under completely different celestial lighting configurations.
              </p>
            </div>

            {/* Bottom Left Badge */}
            <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-full font-label-md inline-block text-[13px] font-semibold shadow-sm">
                Golden Sunrise
              </div>
              <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white font-label-md uppercase tracking-widest text-[10px] w-fit font-bold">
                #001-ALPHA
              </div>
            </div>

            {/* Bottom Right Badge & Actions */}
            <div className="absolute bottom-10 right-10 z-20 flex flex-col items-end gap-3">
              <div className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-full font-label-md inline-block text-[13px] font-semibold shadow-sm pointer-events-none">
                Starry Midnight
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Share link copied to clipboard!')}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 active:scale-90 transition-all shadow-lg text-zinc-900 focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined">share</span>
                </button>
                <button
                  onClick={() => showToast('Downloading high-res generation assets...')}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 active:scale-90 transition-all shadow-lg text-zinc-900 focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          </main>

          {/* INTEGRATED CONTROL BAR */}
          <div className="w-full mt-8 mb-4 shrink-0 relative">
            <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-6 items-center">
              
              {/* Add Reference Image Button */}
              <div className="col-span-2">
                <button
                  onClick={() => showToast('Select a local sketch reference to upload')}
                  className="w-full h-20 bg-white/50 border-2 border-dashed border-primary/20 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/45 hover:bg-white/80 active:scale-98 transition-all text-center focus:outline-none shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary text-[24px] mb-1">cloud_upload</span>
                  <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">
                    Add Reference
                  </span>
                </button>
              </div>

              {/* Prompt Input & Generate Box */}
              <div className="col-span-7 flex items-center bg-white rounded-[24px] p-2 pl-6 shadow-sm border border-black/5 relative">
                <div className="flex-1">
                  <input
                    className="w-full bg-transparent border-none text-[16px] text-zinc-800 focus:ring-0 focus:outline-none p-0 placeholder:text-zinc-400 font-medium"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 pr-2">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`p-2.5 rounded-xl hover:bg-zinc-100 transition-colors focus:outline-none ${
                      settingsOpen ? 'bg-zinc-100 text-primary' : 'text-zinc-500'
                    }`}
                    title="Workflow Settings"
                  >
                    <span className="material-symbols-outlined text-[22px]">tune</span>
                  </button>
                  
                  <button
                    onClick={handleGenerate}
                    className="shimmer-btn bg-black text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:shadow-lg transition-all active:scale-95 text-[14px]"
                  >
                    {isGenerating ? 'GENERATING...' : 'GENERATE'}
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </button>
                </div>

                {/* Settings Panel Overlay */}
                {settingsOpen && (
                  <div className="absolute bottom-24 right-2 w-72 bg-white border border-[#c7c4d7]/40 rounded-2xl shadow-xl p-5 text-left z-50 animate-in fade-in duration-200">
                    <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">settings_input_component</span>
                      Parameters
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Guidance Scale</span>
                          <span className="text-primary">{guidanceScale}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={guidanceScale}
                          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                          className="w-full accent-primary h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Inference Steps</span>
                          <span className="text-primary">{steps}</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          step="5"
                          value={steps}
                          onChange={(e) => setSteps(parseInt(e.target.value))}
                          className="w-full accent-primary h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="block text-xs font-semibold mb-1">Sampler</span>
                        <select
                          value={sampler}
                          onChange={(e) => setSampler(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:border-primary text-zinc-700"
                        >
                          <option>DPM++ 2M Karras</option>
                          <option>Euler a</option>
                          <option>Heun</option>
                          <option>DDIM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Metrics columns */}
              <div className="col-span-3 flex justify-between gap-4">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[20px] leading-tight">0.8s</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Processing
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[20px] leading-tight">4K</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Resolution
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[20px] leading-tight">120</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Tokens
                  </span>
                </div>
              </div>
              
            </div>
          </div>

      </div>
      </div>

      {/* TOAST ALERTS */}
      <div
        className={`fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-800 transition-all duration-300 transform ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
        <span className="text-xs font-medium">{toast.message}</span>
      </div>

    </div>
  );
}
