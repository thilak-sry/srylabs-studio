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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="bg-[#f5f4f0] text-on-surface font-body-md h-screen w-full overflow-hidden select-none relative flex justify-center">
      <div className="flex h-full w-full relative">

        {/* SIDEBAR */}
        <aside className={`h-full flex flex-col bg-[#f5f4f0] shrink-0 pt-4 transition-all duration-300 ${isSidebarCollapsed ? 'w-[72px]' : 'w-[200px]'}`}>
          {/* Toggle Sidebar Button */}
          <div className={`px-4 mb-2 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-start pl-4'}`}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-zinc-200/50 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                dock_to_left
              </span>
            </button>
          </div>

          {/* Brand / Logo */}
          <div className={`pr-4 mb-4 ${isSidebarCollapsed ? 'pl-0 flex justify-center py-2' : 'pl-4 py-4'}`}>
            <div className="flex items-center gap-1.5">
              <img
                src="/SRY Labs.png"
                alt="SRY Studio"
                className="object-contain"
                style={{ width: '24px', height: '24px' }}
              />
              {!isSidebarCollapsed && (
                <h1 className="font-headline-md text-[17px] font-bold tracking-tight">SRY Studio</h1>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className={`flex-1 space-y-1 ${isSidebarCollapsed ? 'px-2' : 'pl-3'}`}>
            <Link
              href="/"
              className={`flex items-center gap-2 py-2 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-all font-semibold ${
                isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              {!isSidebarCollapsed && <span className="text-[12px]">Home</span>}
            </Link>

            <div
              className={`flex items-center gap-2 py-2 rounded-lg text-on-surface-variant cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all font-semibold ${
                isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              {!isSidebarCollapsed && <span className="text-[12px]">Workflows</span>}
            </div>

            <div
              className={`flex items-center gap-2 py-2 rounded-lg text-on-surface-variant cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all font-semibold ${
                isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              {!isSidebarCollapsed && <span className="text-[12px]">Assets</span>}
            </div>

            <div
              className={`flex items-center gap-2 py-2 rounded-lg text-on-surface-variant cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all font-semibold ${
                isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">memory</span>
              {!isSidebarCollapsed && <span className="text-[12px]">Models</span>}
            </div>

            <div
              className={`flex items-center gap-2 py-2 rounded-lg text-on-surface-variant cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all font-semibold ${
                isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              {!isSidebarCollapsed && <span className="text-[12px]">History</span>}
            </div>
          </nav>

          {/* Bottom Area */}
          <div className={`py-4 mt-auto ${isSidebarCollapsed ? 'px-2' : 'pl-4 pr-1'}`}>
            {/* Bottom Settings Navigation */}
            <div className="space-y-1">
              {[
                { label: 'Invite your team', icon: 'group' },
                { label: 'Settings', icon: 'settings' },
                { label: 'Help', icon: 'help_outline' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 py-2 text-on-surface-variant rounded-lg font-semibold cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all ${
                    isSidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'w-[calc(100%+16px)] pl-2 pr-4 text-[13px] text-left whitespace-nowrap'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className={`flex-1 h-full flex flex-col pt-12 pb-2 pr-2 min-w-0 relative transition-all duration-300 ${isSidebarCollapsed ? 'pl-0' : 'pl-6'}`}>

          {/* Top Header Overlayed */}
          <header className="absolute top-0 right-0 left-0 h-12 flex justify-end items-center pl-10 pr-5 pointer-events-none z-30">
            <div className="flex items-center gap-5 pointer-events-auto">
              {/* Static Notifications */}
              <div className="relative text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              </div>

              {/* Static Profile */}
              <div className="relative text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
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
          <div className="w-full mt-8 mb-4 shrink-0 relative px-4 lg:px-6">
            <div className="max-w-[1200px] mx-auto w-full grid grid-cols-12 gap-3 xl:gap-6 items-center">

              {/* Add Reference Image Button */}
              <div className="col-span-3 lg:col-span-2">
                <button
                  onClick={() => showToast('Select a local sketch reference to upload')}
                  className="w-full h-20 bg-white/50 border-2 border-dashed border-primary/20 rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/45 hover:bg-white/80 active:scale-98 transition-all text-center focus:outline-none shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary text-[24px] mb-1">cloud_upload</span>
                  <span className="text-[9px] xl:text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">
                    Add Reference
                  </span>
                </button>
              </div>

              {/* Prompt Input & Generate Box */}
              <div className="col-span-6 lg:col-span-7 flex items-center bg-white rounded-[24px] p-2 pl-4 xl:pl-6 shadow-sm border border-black/5 relative">
                <div className="flex-1">
                  <input
                    className="w-full bg-transparent border-none text-[14px] xl:text-[16px] text-zinc-800 focus:ring-0 focus:outline-none p-0 placeholder:text-zinc-400 font-medium"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-1 xl:gap-2 pr-1 xl:pr-2">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`p-2.5 rounded-xl hover:bg-zinc-100 transition-colors focus:outline-none ${settingsOpen ? 'bg-zinc-100 text-primary' : 'text-zinc-500'
                      }`}
                    title="Workflow Settings"
                  >
                    <span className="material-symbols-outlined text-[22px]">tune</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="shimmer-btn bg-black text-white px-4 xl:px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 xl:gap-3 hover:shadow-lg transition-all active:scale-95 text-[12px] xl:text-[14px]"
                  >
                    <span className="hidden sm:inline">{isGenerating ? 'GENERATING...' : 'GENERATE'}</span>
                    <span className="sm:hidden">{isGenerating ? 'GEN...' : 'GEN'}</span>
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
              <div className="col-span-3 flex justify-between gap-2 xl:gap-4">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[16px] xl:text-[20px] leading-tight">0.8s</span>
                  <span className="text-[9px] xl:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Processing
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[16px] xl:text-[20px] leading-tight">4K</span>
                  <span className="text-[9px] xl:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Resolution
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-primary font-bold text-[16px] xl:text-[20px] leading-tight">120</span>
                  <span className="text-[9px] xl:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
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
        className={`fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-800 transition-all duration-300 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
          }`}
      >
        <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
        <span className="text-xs font-medium">{toast.message}</span>
      </div>

    </div>
  );
}
