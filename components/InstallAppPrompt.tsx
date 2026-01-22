"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedAt = dismissed ? new Date(dismissed) : null;

    // Show again after 7 days if dismissed
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show the prompt after a short delay (no native prompt available)
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
          <Smartphone className="h-5 w-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Add GroomRoute to your home screen
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Quick access every day - just like a native app
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Installation instructions based on device */}
          <div className="mt-3">
            {isIOS ? (
              <div className="flex items-center gap-3 text-xs text-gray-700 bg-white/60 rounded-lg p-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium">1.</span>
                  <span>Tap</span>
                  <Share className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">2.</span>
                  <span>Add to Home Screen</span>
                  <PlusSquare className="h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
            ) : isAndroid && deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
              >
                Install App
              </button>
            ) : (
              <p className="text-xs text-gray-600">
                Use your browser menu to &quot;Add to Home Screen&quot;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
