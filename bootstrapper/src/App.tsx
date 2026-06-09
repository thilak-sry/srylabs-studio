import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import logoUrl from './assets/logo.png';

function App() {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Preferences, 2: Installing, 3: Success
  const [error, setError] = useState("");
  const [installPath, setInstallPath] = useState("");
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState("");

  useEffect(() => {
    invoke<string>("get_default_path")
      .then((path) => setInstallPath(path))
      .catch((err) => {
        console.error("Failed to get default path:", err);
        setInstallPath("C:\\Users\\Default\\AppData\\Local\\Programs\\SRY Studio");
      });
  }, []);

  const handleInstall = async () => {
    setStep(2); // Transition to Installing Progress Screen
    setError("");
    setInstallProgress(5);
    setInstallStatus("Initializing installation...");

    // Simulate progress increments for a smooth install experience
    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress >= 95) progress = 95; // Cap at 95% until backend invocation resolves
      setInstallProgress(progress);

      if (progress < 30) {
        setInstallStatus("Extracting core application binaries...");
      } else if (progress < 60) {
        setInstallStatus("Configuring system directory structures...");
      } else if (progress < 85) {
        setInstallStatus("Setting up shortcuts and configurations...");
      } else {
        setInstallStatus("Finalizing SRY Studio installation...");
      }
    }, 450);

    try {
      if ((window as any).__TAURI_INTERNALS__) {
        await invoke("install_app", { installPath });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      clearInterval(interval);
      setInstallProgress(100);
      setInstallStatus("Installation completed successfully!");
      setTimeout(() => {
        setStep(3); // Success Screen
      }, 600);
    } catch (e) {
      clearInterval(interval);
      setError(String(e));
      setStep(1); // Go back to preferences to show the error
    }
  };

  const handleLaunch = async () => {
    try {
      await invoke("launch_app", { installPath });
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

  const handleBrowse = async () => {
    try {
      const selected = await invoke<string | null>("select_directory");
      if (selected) {
        setInstallPath(selected);
      }
    } catch (e) {
      console.error("Failed to select directory:", e);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F6F3F2] p-0 overflow-hidden font-sans select-none relative">
      {/* Main Glass Installer Card */}
      <main className="glass-card rounded-2xl w-full h-full flex flex-row overflow-hidden relative border border-outline-variant/30">

        {/* Custom Window Control Dots (macOS style) absolute in top-left */}
        <div className="absolute top-4 left-4 flex gap-1.5 z-30">
          <button
            onClick={closeWindow}
            title="Close"
            className="w-3 h-3 rounded-full bg-[#ba1a1a] hover:opacity-85 transition-opacity cursor-pointer border-none outline-none"
            aria-label="Close window"
          />
          <button
            title="Minimize"
            className="w-3 h-3 rounded-full bg-[#767586]/40 border-none outline-none cursor-default"
            aria-label="Minimize window"
          />
          <button
            title="Maximize"
            className="w-3 h-3 rounded-full bg-[#767586]/20 border-none outline-none cursor-default"
            aria-label="Maximize window"
          />
        </div>

        {/* Left Sidebar Panel - Branding & Steps */}
        <section
          data-tauri-drag-region
          className="w-[230px] bg-surface-container-lowest/40 border-r border-outline-variant/30 flex flex-col justify-between p-6 pt-14 relative z-10 shrink-0"
        >
          <div>
            {/* Branding */}
            <div data-tauri-drag-region className="flex items-center gap-2.5 mb-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-on-surface flex items-center justify-center shadow-sm shrink-0">
                <img src={logoUrl} alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-on-surface tracking-tight leading-none">SRY Studio</h1>
                <p className="text-[10px] font-medium text-on-surface-variant leading-none mt-1">Premium Installer</p>
              </div>
            </div>

            {/* Step Indicators */}
            <nav className="flex flex-col gap-5 mt-6">
              {/* Step: Welcome */}
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${step === 0 ? "opacity-100" : "opacity-60"}`}>
                {step > 0 ? (
                  <span className="material-symbols-outlined text-primary text-[20px] font-semibold" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>radio_button_checked</span>
                )}
                <span className={`text-xs ${step === 0 ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}>Welcome</span>
              </div>

              {/* Step: Preferences */}
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${step === 1 ? "opacity-100" : step < 1 ? "opacity-40" : "opacity-60"}`}>
                {step > 1 ? (
                  <span className="material-symbols-outlined text-primary text-[20px] font-semibold" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                ) : step === 1 ? (
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>radio_button_checked</span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">radio_button_unchecked</span>
                )}
                <span className={`text-xs ${step === 1 ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}>Preferences</span>
              </div>

              {/* Step: Install */}
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
                {step > 2 ? (
                  <span className="material-symbols-outlined text-primary text-[20px] font-semibold" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                ) : step === 2 ? (
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>radio_button_checked</span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">radio_button_unchecked</span>
                )}
                <span className={`text-xs ${step >= 2 ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}>Install</span>
              </div>
            </nav>
          </div>


        </section>

        {/* Right Content Panel */}
        <section
          data-tauri-drag-region
          className="flex-1 flex flex-col p-8 pt-14 relative z-10 overflow-hidden"
        >
          {/* Subtle design system background glows */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-secondary-fixed/15 via-transparent to-transparent pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-primary-fixed/8 via-transparent to-transparent pointer-events-none z-0" />

          <div className="flex-1 flex flex-col z-10 relative h-full">
            {step === 0 && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                {/* Branding Icon */}
                <div className="mb-6 flex justify-start">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-on-surface flex items-center justify-center shadow-md">
                    <img src={logoUrl} alt="SRY Studio Logo" className="w-10 h-10 object-contain" />
                  </div>
                </div>

                {/* Text Block */}
                <h2 className="text-2xl font-bold text-on-surface mb-3 tracking-tight">Welcome to SRY Studio</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-[420px] mb-8">
                  Your AI workspace for building, creating and shipping faster. Get ready to experience a new standard of productivity.
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-lg bg-on-surface text-surface text-xs font-semibold hover:bg-inverse-surface transition-all duration-200 shadow-sm flex items-center gap-2.5 group cursor-pointer"
                  >
                    Get Started
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-lg bg-transparent border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors duration-200 cursor-pointer"
                  >
                    View Release Notes
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">Preferences</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-[420px] mb-5">
                  Customize where and how you would like SRY Studio to be installed.
                </p>

                {/* Errors display */}
                {error && (
                  <div className="mb-4 bg-[#ffdad6] text-[#ba1a1a] p-3 rounded-lg text-xs border border-[#ba1a1a]/20 flex items-start gap-2 max-w-[440px]">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                    <div className="flex-1 font-medium">{error}</div>
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-4 max-w-[440px]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Installation Folder</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={installPath}
                        onChange={(e) => setInstallPath(e.target.value)}
                        className="flex-1 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-mono text-on-surface outline-none focus:border-primary/50 transition-colors"
                      />
                      <button
                        onClick={handleBrowse}
                        className="px-3.5 py-2 bg-transparent border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container-high text-xs font-medium transition-colors cursor-pointer"
                      >
                        Browse...
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1.5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-on-surface select-none">
                      <input
                        type="checkbox"
                        checked={createDesktopShortcut}
                        onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50 cursor-pointer accent-primary"
                      />
                      Create a desktop shortcut
                    </label>

                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 mt-auto justify-end">
                  <button
                    onClick={() => { setError(""); setStep(0); }}
                    className="px-5 py-2.5 rounded-lg bg-transparent border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleInstall}
                    className="px-5 py-2.5 rounded-lg bg-on-surface text-surface text-xs font-semibold hover:bg-inverse-surface transition-all duration-200 shadow-sm flex items-center gap-2.5 cursor-pointer"
                  >
                    Install Now
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">Installing SRY Studio</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-[420px] mb-8">
                  We are setting up your new workspace environment. This will only take a moment.
                </p>

                {/* Progress bar structure */}
                <div className="space-y-3.5 max-w-[420px] w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">{installStatus}</span>
                    <span className="text-primary font-bold">{installProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/20">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-on-surface-variant/50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                    Do not close the installer window during installation.
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                {/* Installed DIV success illustration */}
                <div className="mb-6 flex justify-start">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 bg-primary/20 rounded-full blur-xl opacity-60 animate-pulse z-0" />
                    <span
                      className="material-symbols-outlined text-primary text-[56px] relative z-10"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      check_circle
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-on-surface mb-3 tracking-tight">Ready to Go</h2>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-[420px] mb-8">
                  SRY Studio has been successfully installed. You can now launch your new workspace and start building.
                </p>

                {/* Error launch fallback */}
                {error && (
                  <div className="mb-4 bg-[#ffdad6] text-[#ba1a1a] p-3 rounded-lg text-xs border border-[#ba1a1a]/20 flex items-start gap-2 max-w-[420px]">
                    <span className="material-symbols-outlined text-base shrink-0">warning</span>
                    <div className="flex-1 font-medium">{error}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto">
                  <button
                    onClick={handleLaunch}
                    className="px-6 py-3 rounded-lg bg-on-surface text-surface text-xs font-semibold hover:bg-inverse-surface transition-all duration-200 shadow-md flex items-center gap-2.5 group cursor-pointer"
                  >
                    Launch Studio
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
