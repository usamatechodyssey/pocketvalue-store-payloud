"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Share, PlusSquare, Download } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
    
    if (isInStandaloneMode) {
      setIsStandalone(true);
      return; 
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkDismissal(); // Check Time Logic
    };

    if (isIosDevice) {
      checkDismissal(); // Check Time Logic
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // === 🔥 SMART TIME LOGIC ===
  const checkDismissal = () => {
      const dismissedTime = localStorage.getItem("pwa_popup_dismissed_time");
      
      if (dismissedTime) {
          const now = new Date().getTime();
          const timePassed = now - parseInt(dismissedTime);
          const oneDay = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

          // Agar 24 ghantay se kam waqt hua hai, to mat dikhao
          if (timePassed < oneDay) {
              return; 
          }
      }
      // Agar koi record nahi hai, ya 24 ghantay guzar gaye hain, to dikhao
      setIsVisible(true);
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsVisible(false);
      // Agar install kar liya, to permanent band (no timestamp needed)
      // Lekin browser khud hi standalone mode detect kar lega next time
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 🔥 STEP: Current Time save kar lo
    localStorage.setItem("pwa_popup_dismissed_time", new Date().getTime().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-9999 md:hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
      
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 relative">
        
        <button 
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 items-center">
          <div className="shrink-0 w-14 h-14 relative rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <Image src="/Logo1.png" alt="App Icon" fill className="object-cover" unoptimized/>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              Install PocketValue App
            </h3>
            
            {isIOS ? (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">
                <p className="mb-2">For best experience:</p>
                <div className="flex items-center flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span>Tap</span> 
                  <Share size={14} className="text-blue-500" />
                  <span>then</span>
                  <span className="font-bold flex items-center gap-1">
                     Add to Home Screen <PlusSquare size={14} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Add to Home Screen for quick access.
                </p>
                <button
                  onClick={handleAndroidInstall}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Install Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}