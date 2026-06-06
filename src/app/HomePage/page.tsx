'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Workflow {
  id: string;
  title: string;
  tag: string;
  image: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  isFlagged?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const firstLaunch = localStorage.getItem("firstLaunchDone");
    if (!firstLaunch) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'insights' | 'dictionary' | 'snippets' | 'style' | 'scratchpad'>('home');
  const [activeBottomTab, setActiveBottomTab] = useState<string | null>(null);

  // Interaction State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [credits, setCredits] = useState(750);
  const [gpuHours, setGpuHours] = useState(14.2);
  const [imagesGenerated, setImagesGenerated] = useState(128);

  // Active runs tracker
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [runningProgress, setRunningProgress] = useState(0);

  // Notification items
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'AI Image Generator finished successfully', read: false, time: '2m ago' },
    { id: '2', text: 'You are using 75% of your free credits', read: true, time: '1h ago' },
    { id: '3', text: 'Welcome to Flow Pro trial!', read: true, time: '1d ago' },
  ]);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Initial Workflow list matching screen_refresh.html
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf1',
      title: 'AI Image Generator',
      tag: '#001-ALPHA',
      image: '/wf-image-gen.jpg',
      description: 'Generate high-quality images from text descriptions with advanced style controls.',
      status: 'idle',
      isFlagged: false,
    },
    {
      id: 'wf2',
      title: 'Product Studio',
      tag: '#042-ALPHA',
      image: '/wf-prod-studio.jpg',
      description: 'Place products in professional AI-generated studio environments for marketing.',
      status: 'idle',
      isFlagged: false,
    },
    {
      id: 'wf3',
      title: 'Background Remover',
      tag: '#018-BETA',
      image: '/wf-bg-remover.jpg',
      description: 'Instantly remove and replace backgrounds with pixel-perfect precision.',
      status: 'idle',
      isFlagged: false,
    },
    {
      id: 'wf4',
      title: 'Ethereal Landscape',
      tag: '#999-LIMITED',
      image: '/wf-landscape.jpg',
      description: 'Create artistic, dream-like landscapes with cinematic lighting and hyper-realistic depth.',
      status: 'idle',
      isFlagged: false,
    },
  ]);

  // New workflow creation state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Toast Helper
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Filtered workflows list
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(
      (wf) =>
        wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workflows, searchQuery]);

  // Copy workflow action
  const handleCopy = (e: React.MouseEvent, wf: Workflow) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${wf.title} - ${wf.description}`);
    showToast(`Copied details for "${wf.title}" to clipboard!`);
  };

  // Flag workflow action
  const handleFlag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          const nextFlag = !wf.isFlagged;
          showToast(nextFlag ? `Flagged workflow` : `Unflagged workflow`);
          return { ...wf, isFlagged: nextFlag };
        }
        return wf;
      })
    );
  };

  // Delete workflow action
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
    showToast('Workflow removed from list');
  };

  // Simulated run action
  const handleRunWorkflow = (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;

    if (runningWorkflowId) {
      showToast('A workflow is already executing!');
      return;
    }

    if (credits < 15) {
      showToast('Insufficient credits! Upgrade or refill.');
      return;
    }

    setRunningWorkflowId(id);
    setRunningProgress(0);
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'running' } : w)));

    const interval = setInterval(() => {
      setRunningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunningWorkflowId(null);
          setWorkflows((prevWfs) =>
            prevWfs.map((w) => (w.id === id ? { ...w, status: 'completed' } : w))
          );
          setCredits((c) => Math.max(0, c - 15));
          setGpuHours((g) => parseFloat((g + 0.1).toFixed(2)));
          setImagesGenerated((img) => img + 1);
          showToast(`Completed running: ${wf.title}! Used 15 credits.`);

          const newNotif = {
            id: Date.now().toString(),
            text: `Successfully executed "${wf.title}"`,
            read: false,
            time: 'Just now',
          };
          setNotifications((prevN) => [newNotif, ...prevN]);
          return 0;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Create new workflow
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Use a random image from available ones for mock aesthetic
    const imagesList = ['/wf-image-gen.jpg', '/wf-prod-studio.jpg', '/wf-bg-remover.jpg', '/wf-landscape.jpg'];
    const randomImage = imagesList[Math.floor(Math.random() * imagesList.length)];
    const alphaNum = Math.floor(Math.random() * 900) + 100;

    const newWf: Workflow = {
      id: `wf_${Date.now()}`,
      title: newTitle,
      tag: `#${alphaNum}-DEV`,
      image: randomImage,
      description: newDesc || 'Custom workspace configuration workflow.',
      status: 'idle',
      isFlagged: false,
    };

    setWorkflows([newWf, ...workflows]);
    setNewTitle('');
    setNewDesc('');
    setCreateModalOpen(false);
    showToast(`Created workflow "${newWf.title}"`);
  };

  if (showOnboarding === null) {
    return <div className="bg-[#f5f4f0] h-screen w-full" />;
  }

  if (showOnboarding) {
    return (
      <div className="flex h-screen w-screen bg-[#F6F3F2] font-sans select-none relative overflow-hidden">
        {/* Main Glass Card styled exactly like the installer but fully fits the window */}
        <div className="bg-white/70 backdrop-blur-md w-full h-full flex flex-row overflow-hidden relative">
          {/* Left Sidebar Panel - Branding */}
          <aside className="w-[230px] bg-[#f0edec]/40 border-r border-[#c7c4d7]/30 flex flex-col justify-between p-6 pt-14 relative z-10 shrink-0">
            <div>
              {/* Branding */}
              <div className="flex items-center gap-2.5 mb-10">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1c1b1b] flex items-center justify-center shadow-sm shrink-0">
                  <img src="/SRY Labs.png" alt="Logo" className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#1c1b1b] tracking-tight leading-none">SRY Studio</h1>
                  <p className="text-[10px] font-medium text-[#464554] leading-none mt-1">First Launch</p>
                </div>
              </div>

              {/* Step Indicators */}
              <nav className="flex flex-col gap-5 mt-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4648d4] text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    radio_button_checked
                  </span>
                  <span className="text-xs font-semibold text-[#1c1b1b]">Welcome</span>
                </div>
              </nav>
            </div>
          </aside>

          {/* Right Content Panel */}
          <section className="flex-1 flex flex-col p-8 pt-14 relative z-10 overflow-hidden text-left justify-center">
            {/* Subtle design system background glows */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#f0dbff]/15 via-transparent to-transparent pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#e1e0ff]/8 via-transparent to-transparent pointer-events-none z-0" />

            <div className="flex-1 flex flex-col z-10 relative justify-center animate-in fade-in duration-500">
              {/* Branding Icon */}
              <div className="mb-6 flex justify-start">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1c1b1b] flex items-center justify-center shadow-md">
                  <img src="/SRY Labs.png" alt="SRY Studio Logo" className="w-10 h-10 object-contain" />
                </div>
              </div>

              {/* Text Block */}
              <h2 className="text-2xl font-bold text-[#1c1b1b] mb-3 tracking-tight">Welcome to SRY Studio</h2>
              <p className="text-xs text-[#464554] leading-relaxed max-w-[420px] mb-8">
                Your AI workspace for building, creating and shipping faster. Get ready to experience a new standard of productivity.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-auto">
                <button
                  onClick={() => {
                    localStorage.setItem("firstLaunchDone", "true");
                    setShowOnboarding(false);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#1c1b1b] text-white text-xs font-semibold hover:bg-[#313030] transition-all duration-200 shadow-sm flex items-center gap-1.5 group cursor-pointer"
                >
                  Get Started
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg bg-transparent border border-[#c7c4d7] text-[#1c1b1b] text-xs font-semibold hover:bg-[#ebe7e7] transition-colors duration-200 cursor-pointer"
                >
                  View Release Notes
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f4f0] text-on-background font-body-md antialiased h-screen w-full flex justify-center overflow-hidden select-none">
      {/* RESPONSIVE LAYOUT */}
      <div className="flex w-full h-full relative">

        {/* ABSOLUTE HEADER */}
        <header className="absolute top-0 right-0 left-0 h-14 md:h-12 flex justify-between md:justify-end items-center px-4 md:pl-10 md:pr-5 pointer-events-none z-30">
          <div className="flex items-center gap-2 pointer-events-auto md:hidden pt-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/80 rounded-xl shadow-sm text-zinc-700 hover:text-black">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-1.5 ml-2">
              <img
                src="/SRY Labs.png"
                alt="SRY Studio"
                className="object-contain w-5 h-5"
              />
              <span className="font-bold text-sm tracking-tight text-zinc-900">SRY Studio</span>
            </div>
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

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* LEFT SIDEBAR (blends with container) */}
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
            {[
              { label: 'Home', icon: 'grid_view', tab: 'home' as const },
              { label: 'Workflows', icon: 'account_tree', tab: null },
              { label: 'Assets', icon: 'folder_open', tab: null },
              { label: 'Models', icon: 'memory', tab: null },
              { label: 'History', icon: 'history', tab: null },
            ].map((item) => {
              const isSelected = item.tab && activeTab === item.tab;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.tab) {
                      setActiveTab(item.tab);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center py-2 rounded-lg transition-all duration-300 ease-in-out text-left font-semibold cursor-pointer ${isSidebarCollapsed
                      ? 'justify-center w-10 h-10 p-0 mx-auto'
                      : 'w-[calc(100%+16px)] pl-2 pr-4'
                    } ${isSelected
                      ? 'sidebar-active text-on-surface'
                      : 'text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface'
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0">{item.icon}</span>
                  <span className={`text-[12px] transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isSidebarCollapsed
                      ? 'opacity-0 max-w-0 ml-0 pointer-events-none'
                      : 'opacity-100 max-w-[120px] ml-2'
                    }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
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
                  className={`flex items-center py-2 text-on-surface-variant rounded-lg font-semibold cursor-pointer hover:bg-zinc-200/50 hover:text-on-surface transition-all duration-300 ease-in-out ${isSidebarCollapsed
                      ? 'justify-center w-10 h-10 p-0 mx-auto'
                      : 'w-[calc(100%+16px)] pl-2 pr-4 text-[13px] text-left whitespace-nowrap'
                    }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isSidebarCollapsed
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

        {/* MAIN CONTAINER CARD */}
        <div className={`flex-1 h-full flex flex-col pt-20 md:pt-12 pb-2 px-2 md:pr-2 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-0' : 'md:pl-6'}`}>
          <main className="flex-1 overflow-hidden bg-white rounded-[24px] border border-outline-variant/30 flex flex-col pt-6 md:pt-12 shadow-sm">

            {/* SCREEN VIEWS CONDITIONAL RENDER */}
            {activeTab === 'home' && (
              <div className="px-4 md:px-10 pb-6 md:pb-12 flex-1 overflow-y-auto md:overflow-hidden flex flex-col min-h-0">
                <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col min-h-0">

                  {/* GREETING */}
                  <h2 className="text-[20px] font-semibold text-on-surface mb-5 flex items-center gap-2">
                    Hey Thilak, get back into the flow with{' '}
                    <span className="bg-[#ffa834] px-2.5 py-0.5 rounded-[8px] border-[2px] border-black text-black font-bold text-sm inline-flex items-center justify-center font-sans select-none">
                      fn
                    </span>
                  </h2>

                  {/* TWO COLUMN CONTENT AREA */}
                  <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 min-h-0 w-full overflow-y-auto lg:overflow-hidden">

                    {/* LEFT COLUMN */}
                    <div className="flex-1 space-y-8 md:space-y-12 min-w-0 w-full lg:h-full lg:overflow-y-auto no-scrollbar md:pr-2 pb-6">

                      {/* HERO BANNER WITH REFRESHED ARTWORK BACKGROUND */}
                      <section className="h-[140px] md:h-[165px] rounded-[24px] relative overflow-hidden flex flex-col justify-center px-6 md:px-12 text-white shadow-md">
                        <img
                          alt="AI Artwork Collection"
                          className="absolute inset-0 w-full h-full object-cover"
                          src="/hero-bg-refresh.jpg"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>

                        <div className="relative z-10">
                          <h3 className="text-[24px] md:text-[32px] font-serif font-light mb-1 md:mb-2 leading-tight">Create Stunning Images with AI</h3>
                          <p className="text-white/90 text-[14px] md:text-[16px] mb-2 md:mb-6">Flow works anywhere you type.</p>
                        </div>
                      </section>

                      {/* AVAILABLE WORKFLOWS GRID */}
                      <section>
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
                            Available Workflows
                          </p>
                          {searchQuery && (
                            <span className="text-[11px] text-on-surface-variant font-medium">
                              Showing {filteredWorkflows.length} of {workflows.length} workflows
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {filteredWorkflows.length === 0 ? (
                            <div className="p-12 text-center text-on-surface-variant col-span-2 border border-dashed border-zinc-200 rounded-2xl">
                              <span className="material-symbols-outlined text-4xl mb-2 text-zinc-300">search_off</span>
                              <p className="text-sm font-semibold">No workflows found matching "{searchQuery}"</p>
                              <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-xs text-primary font-bold hover:underline"
                              >
                                Clear Search
                              </button>
                            </div>
                          ) : (
                            filteredWorkflows.map((wf) => {
                              const isExecuting = runningWorkflowId === wf.id;
                              return (
                                <div
                                  key={wf.id}
                                  onClick={() => router.push('/CardDesign')}
                                  className="group relative bg-white/60 backdrop-blur-md rounded-[24px] border border-[#c7c4d7]/30 shadow-soft hover:shadow-[0_8px_30px_rgba(70,72,212,0.15)] hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer ring-1 ring-inset ring-white/10 flex flex-col h-full"
                                >
                                  {/* Workflow Card Image */}
                                  <div className="h-40 overflow-hidden relative shrink-0">
                                    <img
                                      alt={wf.title}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      src={wf.image}
                                    />

                                    {/* Progress bar overlay during execution */}
                                    {isExecuting && (
                                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-4 z-10">
                                        <span className="text-white text-xs font-bold mb-2 animate-pulse flex items-center gap-1">
                                          Running... {runningProgress}%
                                        </span>
                                        <div className="w-full max-w-[150px] bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className="bg-primary h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${runningProgress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Hover Floating Actions */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                      <button
                                        onClick={(e) => handleCopy(e, wf)}
                                        title="Copy details"
                                        className="p-1.5 bg-white/80 hover:bg-white text-zinc-700 rounded-full shadow-sm hover:text-primary transition-colors flex items-center justify-center"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                      </button>

                                      <button
                                        onClick={(e) => handleFlag(e, wf.id)}
                                        title={wf.isFlagged ? 'Unflag' : 'Flag'}
                                        className={`p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors flex items-center justify-center ${wf.isFlagged ? 'text-red-500' : 'text-zinc-700 hover:text-red-500'
                                          }`}
                                      >
                                        <span
                                          className="material-symbols-outlined text-[16px]"
                                          style={wf.isFlagged ? { fontVariationSettings: "'FILL' 1" } : {}}
                                        >
                                          flag
                                        </span>
                                      </button>

                                      <button
                                        onClick={(e) => handleDelete(e, wf.id)}
                                        title="Remove"
                                        className="p-1.5 bg-white/80 hover:bg-red-50 text-zinc-700 hover:text-red-600 rounded-full shadow-sm transition-colors flex items-center justify-center"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Card Content */}
                                  <div className="p-6 relative bg-white/40 flex-1 flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className="font-semibold text-[16px] text-on-surface group-hover:text-primary transition-colors">
                                          {wf.title}
                                        </h4>
                                        <span className="text-[10px] font-mono text-outline/50 tracking-wider shrink-0 mt-0.5">
                                          {wf.tag}
                                        </span>
                                      </div>
                                      <p className="text-on-surface-variant text-[13px] leading-relaxed mb-4">
                                        {wf.description}
                                      </p>
                                    </div>

                                    <div className="flex items-center text-primary font-bold text-[13px] mt-auto">
                                      <span>{isExecuting ? 'Processing' : wf.status === 'completed' ? 'Finished (Run again)' : 'Open'}</span>
                                      <span className="material-symbols-outlined text-[18px] ml-1 transition-transform group-hover:translate-x-1">
                                        chevron_right
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full lg:w-[260px] xl:w-[280px] space-y-6 shrink-0 text-left pb-10 lg:pb-0">

                      {/* WORKFLOW STATS WIDGET */}
                      <div className="bg-[#f5f4f0] rounded-[24px] p-6 border border-outline-variant/20 shadow-sm">
                        <div className="space-y-2 mb-6">
                          <div className="flex items-baseline gap-3">
                            <span className="text-[24px] font-serif">{imagesGenerated}</span>
                            <span className="text-on-surface-variant text-[12px]">images generated</span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-[24px] font-serif">{gpuHours}</span>
                            <span className="text-on-surface-variant text-[12px]">GPU hours</span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-[24px] font-serif">{runningWorkflowId ? 1 : 0}</span>
                            <span className="text-on-surface-variant text-[12px]">active tasks</span>
                          </div>
                        </div>

                        {/* CREDIT BAR */}
                        <div className="pt-8 border-t border-outline-variant/30">
                          <h5 className="font-bold text-[15px] mb-2">Usage Credit</h5>
                          <p className="text-[13px] text-on-surface-variant mb-6 leading-relaxed">
                            Track your remaining compute power for the current billing cycle.
                          </p>
                          <div className="relative h-1.5 w-full bg-outline-variant/30 rounded-full mb-2 overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${(credits / 1000) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-on-surface-variant font-semibold">
                              {credits} / 1000 credits
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TIP WIDGET */}
                      <div className="bg-[#fcf9f8] rounded-[24px] p-6 border border-outline-variant/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                          <h5 className="font-bold text-[14px] text-on-surface">Quick Tip</h5>
                        </div>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          Use the "Character Consistency" workflow to keep faces identical across multiple image generations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INSIGHTS VIEW */}
            {activeTab === 'insights' && (
              <div className="p-4 md:p-10 flex-1 overflow-y-auto text-left">
                <div className="max-w-[1200px] mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-4">Performance Insights</h2>
                  <p className="text-on-surface-variant mb-6 text-sm">
                    Detailed tracking of your workflows execution latency and resource utilization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/50">
                      <h3 className="font-bold text-sm mb-4">Successful Runs Over Time</h3>
                      <div className="h-40 bg-zinc-100 rounded-lg flex items-end justify-between p-4">
                        {[25, 40, 35, 50, 75, 90, 110, 128].map((val, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="bg-primary w-6 rounded-t transition-all" style={{ height: `${(val / 128) * 100}px` }}></div>
                            <span className="text-[9px] text-zinc-400 font-bold">M{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/50 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm mb-2">Resource Analytics</h3>
                        <p className="text-[12px] text-zinc-500 mb-4">
                          Stable Diffusion XL queries account for 85% of total GPU minutes used.
                        </p>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>SDXL Image Generation</span>
                          <span className="font-bold">12.1 hrs</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[85%]"></div>
                        </div>
                        <div className="flex justify-between">
                          <span>Background Removal & Edits</span>
                          <span className="font-bold">2.1 hrs</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full w-[15%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DICTIONARY VIEW */}
            {activeTab === 'dictionary' && (
              <div className="p-4 md:p-10 flex-1 overflow-y-auto text-left">
                <div className="max-w-[1200px] mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-4">Flow Dictionary</h2>
                  <p className="text-on-surface-variant mb-6 text-sm">
                    Saved vocabulary words, prompt keywords, and positive/negative style descriptors.
                  </p>
                  <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500">
                          <th className="p-4">Term</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Defined Prompt Sub-string</th>
                          <th className="p-4">Usage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {[
                          { term: 'Cinematic Flare', type: 'Style modifier', desc: 'anamorphic flare, realistic lens reflections, 8k', usage: 'High' },
                          { term: 'Studio Softbox', type: 'Lighting', desc: 'diffused lighting, hyper-realistic, soft product reflection', usage: 'Medium' },
                          { term: 'Cyberpunk Neon', type: 'Color palette', desc: 'neon accents, vibrant purple and cyan highlights', usage: 'High' },
                          { term: 'Minimalist Studio', type: 'Background', desc: 'solid beige background, clean shadow, depth of field', usage: 'Low' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="p-4 font-bold text-on-surface">{row.term}</td>
                            <td className="p-4 text-zinc-500">{row.type}</td>
                            <td className="p-4 font-mono text-zinc-600 bg-zinc-50/30">{row.desc}</td>
                            <td className="p-4"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${row.usage === 'High' ? 'bg-indigo-100 text-indigo-700' : row.usage === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'}`}>{row.usage}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SNIPPETS VIEW */}
            {activeTab === 'snippets' && (
              <div className="p-4 md:p-10 flex-1 overflow-y-auto text-left">
                <div className="max-w-[1200px] mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-4">Snippet Presets</h2>
                  <p className="text-on-surface-variant mb-6 text-sm">
                    Save prompts, settings blocks, and negative guidelines for rapid execution.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: 'Standard Negative Prompt', code: 'deformed, blurry, low contrast, unrealistic hands, extra limbs, signatures' },
                      { title: 'High-Key Portrait Setup', code: 'portrait of a model, high-key light, neutral background, 85mm lens, f/1.8' },
                      { title: 'E-commerce Backdrop', code: 'isolated product, cinematic shadows, high resolution studio photograph' },
                    ].map((snip, idx) => (
                      <div key={idx} className="border border-zinc-200 rounded-xl p-4 flex flex-col justify-between bg-zinc-50/40 hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-bold text-sm mb-2 text-on-surface">{snip.title}</h4>
                          <p className="text-xs font-mono bg-white p-3 rounded-lg border border-zinc-150 text-zinc-500 line-clamp-4 leading-relaxed">
                            {snip.code}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(snip.code);
                            showToast(`Copied snippet: "${snip.title}"`);
                          }}
                          className="mt-4 w-full border border-zinc-200 hover:bg-zinc-50 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          Copy Snippet
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* PRO UPGRADE MODAL */}
      {proModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center relative border border-zinc-100 shadow-2xl z-50">
            <button
              onClick={() => setProModalOpen(false)}
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <span className="material-symbols-outlined text-purple-600 text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Flow Pro</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Unlock unlimited high-speed generations, priority queue access, and collaborate with your entire team.
            </p>

            <div className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-100 flex justify-between items-center text-left">
              <div>
                <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Yearly billing</p>
                <p className="text-xl font-bold text-purple-950">$24<span className="text-sm font-normal text-purple-700">/mo</span></p>
              </div>
              <span className="bg-purple-200 text-purple-800 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                Save 20%
              </span>
            </div>

            <button
              onClick={() => {
                setIsPro(true);
                setProModalOpen(false);
                setCredits(1000);
                showToast('Welcome to Flow Pro! Trial upgrade successful.');
              }}
              className="w-full bg-black text-white hover:bg-zinc-800 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-150 active:scale-95"
            >
              Start Free Trial
            </button>
            <p className="text-[11px] text-zinc-400 mt-3">Cancel anytime. No lock-in contracts.</p>
          </div>
        </div>
      )}

      {/* CREATE WORKFLOW MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative border border-zinc-100 shadow-2xl z-50">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              New Workflow
            </h3>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Workflow Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anime Style Generator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="What does this workflow automate?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white hover:bg-zinc-800 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-150 active:scale-95"
              >
                Create Workflow
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOAST */}
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
