'use client';

import React, { useState, useMemo } from 'react';
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
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'insights' | 'dictionary' | 'snippets'>('home');
  const [activeBottomTab, setActiveBottomTab] = useState<string | null>(null);

  // Interaction State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
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

  const activeNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-[#f0edec] text-on-background font-body-md antialiased h-screen w-full flex justify-center overflow-hidden select-none">
      <div className="w-full h-full max-w-[1840px] flex relative">
      
      {/* ABSOLUTE HEADER */}
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
                <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant/40 rounded-xl shadow-lg z-50 p-4 animate-in fade-in duration-200">
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
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setProModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-[12px] hover:bg-zinc-50 text-primary font-medium"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setCredits(1000);
                      showToast('Simulated: Credits replenished!');
                    }}
                    className="w-full text-left px-4 py-2 text-[12px] hover:bg-zinc-50 text-on-surface"
                  >
                    Refill Credits (Dev)
                  </button>
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

      {/* LEFT SIDEBAR (blends with container) */}
      <aside className="w-[240px] h-full flex flex-col bg-[#f0edec] shrink-0">
        {/* Brand / Logo */}
        <div className="p-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <h1 className="font-headline-md text-xl font-bold tracking-tight">SRY Labs</h1>
            <span className="bg-[#f0dbff] text-[#6900b3] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">
              {isPro ? 'Pro' : 'Trial'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
              activeTab === 'home'
                ? 'sidebar-active text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="text-[14px]">Home</span>
          </button>
          
          <button
            onClick={() => router.push('/CardDesign')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
            <span className="text-[14px]">Workflows</span>
          </button>

          <button
            onClick={() => showToast('Assets folder accessed')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            <span className="text-[14px]">Assets</span>
          </button>

          <button
            onClick={() => showToast('Models manager loaded')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">memory</span>
            <span className="text-[14px]">Models</span>
          </button>

          <button
            onClick={() => showToast('Generation history loaded')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="text-[14px]">History</span>
          </button>
        </nav>

        {/* Trial Card / Bottom Upgrade Widget */}
        <div className="p-4 mt-auto">
          {!isPro ? (
            <div className="bg-[#f8f0ff] p-4 rounded-xl mb-4 border border-[#e1e0ff] shadow-sm">
              <p className="text-[13px] font-bold text-primary mb-1">
                Trial ends in <span className="font-black">14 days</span>
              </p>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
                Upgrade to Flow Pro to keep unlimited words and Pro features.
              </p>
              <button
                onClick={() => setProModalOpen(true)}
                className="w-full bg-black text-white py-2 rounded-lg text-[13px] font-bold hover:bg-zinc-800 transition-colors active:scale-95 duration-100"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 p-4 rounded-xl mb-4 border border-emerald-200 shadow-sm text-emerald-950">
              <p className="text-[13px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
                Flow Pro Activated
              </p>
              <p className="text-[11px] text-emerald-600 mb-1 leading-relaxed">
                Unlimited generations & priority GPU compute.
              </p>
            </div>
          )}

          {/* Bottom Settings Navigation */}
          <div className="space-y-1">
            {[
              { label: 'Invite your team', icon: 'group' },
              { label: 'Settings', icon: 'settings' },
              { label: 'Help', icon: 'help_outline' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveBottomTab(item.label);
                  showToast(`Opened ${item.label}`);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-zinc-200/50 hover:text-on-surface rounded-lg text-[13px] text-left transition-colors`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CARD */}
      <div className="flex-1 h-full flex flex-col pt-16 pb-2 pr-2 pl-6 min-w-0">
        <main className="flex-1 overflow-y-auto bg-white rounded-[24px] border border-outline-variant/30 flex flex-col pt-12 shadow-sm">
        
        {/* SCREEN VIEWS CONDITIONAL RENDER */}
        {activeTab === 'home' && (
          <div className="px-10 pb-12 flex-1 overflow-y-auto">
            
            {/* GREETING */}
            <h2 className="text-[28px] font-semibold text-on-surface mb-8 flex items-center gap-2">
              Hey Thilak, get back into the flow with{' '}
              <span className="bg-[#ffa834] px-2.5 py-0.5 rounded-[8px] border-[2px] border-black text-black font-bold text-lg inline-flex items-center justify-center font-sans select-none">
                fn
              </span>
            </h2>

            {/* TWO COLUMN CONTENT AREA */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* LEFT COLUMN (70%) */}
              <div className="w-full md:w-[70%] space-y-12 min-w-0">
                
                {/* HERO BANNER WITH REFRESHED ARTWORK BACKGROUND */}
                <section className="h-[220px] rounded-[24px] relative overflow-hidden flex flex-col justify-center px-12 text-white shadow-md">
                  <img
                    alt="AI Artwork Collection"
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/hero-bg-refresh.jpg"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-[32px] font-serif font-light mb-2">Create Stunning Images with AI</h3>
                    <p className="text-white/90 text-[16px] mb-6">Flow works anywhere you type.</p>
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-[14px] hover:bg-zinc-100 transition-colors shadow-sm active:scale-95 duration-150 cursor-pointer"
                    >
                      Get started
                    </button>
                  </div>
                </section>

                {/* AVAILABLE WORKFLOWS GRID */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Available Workflows
                    </p>
                    {searchQuery && (
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Showing {filteredWorkflows.length} of {workflows.length} workflows
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  className={`p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors flex items-center justify-center ${
                                    wf.isFlagged ? 'text-red-500' : 'text-zinc-700 hover:text-red-500'
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

              {/* RIGHT COLUMN (30%) */}
              <div className="w-full md:w-[30%] space-y-6 shrink-0 text-left">
                
                {/* WORKFLOW STATS WIDGET */}
                <div className="bg-[#f6f6f4] rounded-[24px] p-8 border border-outline-variant/20 shadow-sm">
                  <div className="space-y-4 mb-10">
                    <div className="flex items-baseline gap-3 group cursor-pointer" onClick={() => setImagesGenerated((i) => i + 5)}>
                      <span className="text-[32px] font-serif transition-colors group-hover:text-primary">{imagesGenerated}</span>
                      <span className="text-on-surface-variant text-[14px]">images generated</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-serif">{gpuHours}</span>
                      <span className="text-on-surface-variant text-[14px]">GPU hours</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[32px] font-serif">{runningWorkflowId ? 1 : 0}</span>
                      <span className="text-on-surface-variant text-[14px]">active tasks</span>
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
                      <button
                        onClick={() => {
                          setCredits(1000);
                          showToast('Replenished credits to 1000!');
                        }}
                        className="bg-white rounded-full w-4 h-4 border border-purple-400 flex items-center justify-center hover:bg-purple-55 transition-colors focus:outline-none"
                        title="Reset credits"
                      >
                        <span className="text-[9px] text-purple-600 font-bold">↻</span>
                      </button>
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
        )}

        {/* INSIGHTS VIEW */}
        {activeTab === 'insights' && (
          <div className="p-10 flex-1 overflow-y-auto text-left">
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
        )}

        {/* DICTIONARY VIEW */}
        {activeTab === 'dictionary' && (
          <div className="p-10 flex-1 overflow-y-auto text-left">
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
        )}

        {/* SNIPPETS VIEW */}
        {activeTab === 'snippets' && (
          <div className="p-10 flex-1 overflow-y-auto text-left">
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
        )}
      </main>
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
        className={`fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-800 transition-all duration-300 transform ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
        <span className="text-xs font-medium">{toast.message}</span>
      </div>
      
      </div>
    </div>
  );
}
