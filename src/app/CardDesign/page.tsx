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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Settings configs
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [sampler, setSampler] = useState('DPM++ 2M Karras');
  const [aspectRatio, setAspectRatio] = useState('16:9');

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

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* SIDEBAR */}
        <aside className={`fixed md:relative z-50 h-full flex flex-col bg-[#f5f4f0] shrink-0 pt-4 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-x-hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'w-[200px] md:w-[72px]' : 'w-[200px]'}`}>
          {/* Toggle Sidebar Button */}
          <div className={`px-4 mb-2 hidden md:flex ${isSidebarCollapsed ? 'justify-start md:justify-center' : 'justify-start pl-4'}`}>
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
          <div className={`mb-4 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'flex justify-center py-2' : 'pl-4 pr-4 py-4'}`}>
            <div className="flex items-center min-w-0">
              <img
                src="/SRY Labs.png"
                alt="SRY Studio"
                className="object-contain shrink-0"
                style={{ width: '24px', height: '24px' }}
              />
              <h1 className={`font-headline-md text-[17px] font-bold tracking-tight transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[120px] ml-2'}`}>
                SRY Studio
              </h1>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className={`flex-1 space-y-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'px-2' : 'pl-3'}`}>
            <Link
              href="/"
              className={`flex items-center py-2 rounded-lg text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface transition-all duration-300 ease-in-out font-semibold ${
                isSidebarCollapsed 
                  ? 'justify-center w-10 h-10 p-0 mx-auto' 
                  : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] shrink-0">grid_view</span>
              <span className={`text-[12px] transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                isSidebarCollapsed 
                  ? 'opacity-0 max-w-0 ml-0 pointer-events-none' 
                  : 'opacity-100 max-w-[120px] ml-2'
              }`}>
                Home
              </span>
            </Link>

            {[
              { label: 'Workflows', icon: 'account_tree' },
              { label: 'Assets', icon: 'folder_open' },
              { label: 'Models', icon: 'memory' },
              { label: 'History', icon: 'history' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center py-2 rounded-lg text-on-surface-variant cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all duration-300 ease-in-out font-semibold ${
                  isSidebarCollapsed 
                    ? 'justify-center w-10 h-10 p-0 mx-auto' 
                    : 'w-[calc(100%+16px)] pl-2 pr-4 text-left'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">{item.icon}</span>
                <span className={`text-[12px] transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSidebarCollapsed 
                    ? 'opacity-0 max-w-0 ml-0 pointer-events-none' 
                    : 'opacity-100 max-w-[120px] ml-2'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Bottom Area */}
          <div className={`py-4 mt-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'px-2' : 'pl-4 pr-1'}`}>
            {/* Bottom Settings Navigation */}
            <div className="space-y-1">
              {[
                { label: 'Invite your team', icon: 'group' },
                { label: 'Settings', icon: 'settings' },
                { label: 'Help', icon: 'help_outline' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center py-2 text-on-surface-variant rounded-lg font-semibold cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed 
                      ? 'justify-center w-10 h-10 p-0 mx-auto' 
                      : 'w-[calc(100%+16px)] pl-2 pr-4 text-[13px] text-left whitespace-nowrap'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    isSidebarCollapsed 
                      ? 'opacity-0 max-w-0 ml-0 pointer-events-none' 
                      : 'opacity-100 max-w-[120px] ml-3 text-[13px]'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className={`flex-1 h-full flex flex-col pt-20 md:pt-12 pb-2 px-2 md:pr-2 min-w-0 relative transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-0' : 'md:pl-6'}`}>

          {/* Top Header Overlayed */}
          <header className="absolute top-0 right-0 left-0 h-14 md:h-12 flex justify-between md:justify-end items-center px-4 md:pl-10 md:pr-5 pointer-events-none z-30">
            <div className="flex items-center gap-2 pointer-events-auto md:hidden pt-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/80 rounded-xl shadow-sm text-zinc-700 hover:text-black">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
            <div className="flex items-center gap-4 md:gap-5 pointer-events-auto pt-4 md:pt-0">
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

          {/* INNER WORKSPACE CONTAINER CARD */}
          <div className="flex-1 flex overflow-hidden bg-[#ffffff] rounded-[24px] border border-outline-variant/30 shadow-sm relative min-h-0">

            {/* CENTER CANVAS AREA */}
            <main className="flex-1 flex flex-col relative min-w-0 h-full bg-[#faf9f6]">
              {/* Canvas Container */}
              <div className="flex-1 p-6 flex flex-col relative overflow-hidden min-h-0">

                {/* Image Comparison Area */}
                <div className="flex-1 bg-zinc-100 rounded-3xl overflow-hidden relative shadow-md group min-h-0 flex flex-col">
                  <ImageCompare
                    beforeImage="/studio-before.jpg"
                    afterImage="/studio-after.jpg"
                    alt="Landscape Diffusion"
                    className="flex-1 min-h-0"
                  />

                  {/* Floating Toolbar Top */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur-md border border-white/50 rounded-full px-2 py-1.5 flex items-center gap-1 z-[60] shadow-lg">
                    <button
                      onClick={() => showToast('Toggle full screen mode')}
                      className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-700 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                    </button>
                    <button
                      onClick={() => showToast('Zoom reset')}
                      className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-700 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                    </button>
                    <div className="h-4 w-px bg-zinc-200 mx-1"></div>
                    <button
                      onClick={() => showToast('Open zoom scale settings')}
                      className="px-2 py-1 hover:bg-zinc-100 rounded-full text-xs font-semibold text-zinc-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      100%
                      <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Carousel (Recent Generations) */}
              <div className="h-24 px-6 pb-4 shrink-0 flex items-center gap-4 relative z-10 border-t border-zinc-100 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">schedule</span>
                  Recent
                </div>
                <div className="flex-1 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {/* Active Thumbnail */}
                  <div className="w-[84px] h-[48px] rounded-lg shrink-0 border-2 border-zinc-950 p-0.5 bg-white relative cursor-pointer shadow-sm">
                    <img alt="Recent Generation 1" className="w-full h-full object-cover rounded-md" src="/recent-1.jpg" />
                  </div>
                  {/* Other Thumbnails */}
                  {[2, 3, 4, 5, 6].map((num) => (
                    <div
                      key={num}
                      onClick={() => showToast(`Loading recent generation #${num}`)}
                      className="w-[80px] h-[44px] rounded-lg shrink-0 cursor-pointer hover:opacity-100 opacity-70 transition-opacity border border-zinc-250/20"
                    >
                      <img alt={`Recent Generation ${num}`} className="w-full h-full object-cover rounded-md" src={`/recent-${num}.jpg`} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => showToast('Opening generations archive')}
                  className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 flex items-center gap-1 hover:bg-zinc-50 transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  View All
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </main>

            {/* RIGHT SETTINGS SIDEBAR */}
            <aside className="w-80 bg-white border-l border-zinc-200 shrink-0 flex flex-col relative z-30 h-full">
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="font-bold text-sm text-zinc-950 tracking-tight">Generation Settings</h2>
                <button
                  onClick={() => showToast('Reset settings to default')}
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">

                {/* Model selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Model</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 py-2 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent">
                      <option>Stable Diffusion XL 1.0</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                      <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Square', value: '1:1', width: 'w-4', height: 'h-4' },
                      { label: 'Landscape', value: '16:9', width: 'w-6', height: 'h-3.5' },
                      { label: 'Portrait', value: '9:16', width: 'w-3.5', height: 'h-6' },
                      { label: 'Standard', value: '4:3', width: 'w-5', height: 'h-4' },
                      { label: 'Cinematic', value: '3:2', width: 'w-5.5', height: 'h-3.5' },
                      { label: 'Tall', value: '2:3', width: 'w-3.5', height: 'h-5.5' },
                    ].map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => {
                          setAspectRatio(ratio.value);
                          showToast(`Aspect ratio set to ${ratio.value}`);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          aspectRatio === ratio.value
                            ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 bg-zinc-500/10 rounded-lg shrink-0">
                          <div className={`border-2 ${aspectRatio === ratio.value ? 'border-white' : 'border-zinc-500'} rounded-sm ${ratio.width} ${ratio.height}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold truncate leading-none mb-0.5">{ratio.value}</span>
                          <span className={`text-[9px] truncate leading-none ${aspectRatio === ratio.value ? 'text-zinc-300' : 'text-zinc-400'}`}>{ratio.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Resolution</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 py-2 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent">
                      <option>Resolution 2160x1440</option>
                      <option>Resolution 1024x1024</option>
                      <option>Resolution 1920x1080</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                      <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>

                {/* Prompt block */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Prompt</label>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-3">
                    <textarea
                      rows={3}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none resize-none font-medium leading-relaxed"
                      placeholder="Describe what you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
                      {/* Reference Image Thumbnail */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                          <img
                            alt="Reference Image Thumbnail"
                            className="w-full h-full rounded-lg object-cover shadow-sm border border-zinc-100"
                            src="/studio-ref.jpg"
                          />
                          <button
                            onClick={() => showToast('Reference image removed')}
                            className="absolute -top-1 -right-1 bg-white border border-zinc-200 rounded-full p-0.5 shadow-md text-zinc-500 hover:text-zinc-800 cursor-pointer flex items-center justify-center"
                            style={{ width: '12px', height: '12px' }}
                          >
                            <span className="material-symbols-outlined text-[8px]">close</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Ref Image</span>
                      </div>

                      {/* Actions (Upload, Tune) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast('Uploading image reference')}
                          className="p-1.5 border border-zinc-200 bg-white rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 cursor-pointer flex items-center justify-center transition-colors"
                          title="Upload Image Reference"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload</span>
                        </button>
                        <button
                          onClick={() => showToast('Opening prompt settings')}
                          className="p-1.5 border border-zinc-200 bg-white rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 cursor-pointer flex items-center justify-center transition-colors"
                          title="Tune settings"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl py-3 font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {isGenerating ? 'GENERATING...' : 'GENERATE IMAGE'}
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  </button>
                </div>

              </div>

              {/* Estimated Usage Card */}
              <div className="p-5 bg-zinc-50 border-t border-zinc-200 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Estimated Usage</h3>
                  <span className="material-symbols-outlined text-zinc-400 text-[16px]">info</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-lg font-bold text-zinc-900">120</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Tokens</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-zinc-900">~0.8s</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Est. Time</div>
                  </div>
                </div>
              </div>
            </aside>
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

