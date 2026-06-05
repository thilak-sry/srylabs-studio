import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CheckCircle2, ChevronRight, Loader2, X } from "lucide-react";
import logoUrl from './assets/logo.png';

function App() {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Installing, 2: Success
  const [error, setError] = useState("");

  const handleInstall = async () => {
    setStep(1);
    try {
      await invoke("install_app");
      setStep(2);
    } catch (e) {
      setError(String(e));
      setStep(0);
    }
  };

  const handleLaunch = async () => {
    try {
      await invoke("launch_app");
    } catch (e) {
      setError(String(e));
    }
  };

  const closeWindow = async () => {
    try {
      await invoke("close_app");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f4f0] text-[#1c1b1b] rounded-xl border border-[#c7c4d7]/50 shadow-2xl overflow-hidden font-sans">
      {/* Title Bar (Draggable) */}
      <div 
        data-tauri-drag-region 
        className="h-10 w-full flex items-center justify-between px-4 bg-[#fcf9f8]/80 backdrop-blur-md border-b border-[#c7c4d7]/50 select-none"
      >
        <div data-tauri-drag-region className="flex items-center gap-2 text-sm font-medium text-[#464554]">
          <img src={logoUrl} alt="Logo" className="w-4 h-4 object-contain pointer-events-none" />
          SRY Studio Setup
        </div>
        <button 
          onClick={closeWindow}
          className="p-1.5 hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-md transition-colors text-[#767586]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 relative">
        {/* Background Subtle Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4648d4]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8127cf]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-32 h-32 mx-auto rounded-3xl bg-white p-2 shadow-lg shadow-[#4648d4]/10 border border-[#e1e0ff]">
                <div className="w-full h-full bg-[#fcf9f8] rounded-[18px] flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="SRY Studio Logo" className="w-24 h-24 object-contain" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-[#1c1b1b]">SRY Studio</h1>
                <p className="text-[#464554] text-lg">The future of AI Workspaces.</p>
              </div>
              {error && (
                <div className="bg-[#ffdad6] text-[#ba1a1a] p-3 rounded-lg text-sm border border-[#ba1a1a]/20">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#4648d4] rounded-full blur-xl opacity-20 animate-pulse" />
                  <Loader2 className="w-16 h-16 text-[#4648d4] animate-spin relative z-10" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-[#1c1b1b]">Installing SRY Studio...</h2>
                <p className="text-[#464554] text-sm">Please wait while we set things up for you.</p>
                <div className="h-2 w-full bg-[#e1e0ff] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4648d4] to-[#8127cf] w-full animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20" />
                  <CheckCircle2 className="w-20 h-20 text-green-600 relative z-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-[#1c1b1b]">Ready to Go</h2>
                <p className="text-[#464554]">SRY Studio has been successfully installed.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex justify-end z-10 pt-6">
          {step === 0 && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-6 py-3 bg-[#ffffff] text-[#4648d4] rounded-lg font-semibold hover:bg-[#e1e0ff] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#4648d4]/10 border border-[#e1e0ff]"
            >
              Install Now
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#4648d4] to-[#8127cf] text-white rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#4648d4]/20"
            >
              Launch Studio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
