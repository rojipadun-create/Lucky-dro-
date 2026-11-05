import React, { useState } from 'react';
import { Smartphone, Download, ExternalLink, Copy, Check, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface InstallAPKModalProps {
  onClose: () => void;
}

export const InstallAPKModal: React.FC<InstallAPKModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  const appUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://ais-pre-bpaf6g7j37p3rve4jbrwnd-743800894251.asia-northeast1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#220d16] via-[#14080e] to-[#0a0407] border-2 border-red-800/80 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(225,29,72,0.5)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-white">
              INSTALL ON ANDROID / APK
            </h3>
            <p className="text-xs text-rose-300 font-medium">
              अपने Android Phone में App या APK कैसे इंस्टॉल करें
            </p>
          </div>
        </div>

        {/* Tabs for Methods */}
        <div className="flex items-center gap-2 p-1 bg-black/50 rounded-2xl border border-red-950 mb-5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            तरीका 1: डायरेक्ट इंस्टॉल (PWA)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            तरीका 2: .APK फ़ाइल बनाएं
          </button>
        </div>

        {/* METHOD 1: Instant PWA Direct Install */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>सबसे आसान तरीका — बिना किसी टूल या कोडिंग के!</span>
              </div>
              <p className="text-xs text-gray-300">
                यह ऐप सीधे आपके फोन में एक असली Android App की तरह होम स्क्रीन पर इंस्टॉल हो जाता है (बिना किसी URL बार के, फुलस्क्रीन और फास्ट)।
              </p>
            </div>

            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="font-bold text-emerald-300 text-sm">
                  ऐप आपके फोन पर पहले से इंस्टॉल है! 🎉
                </span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white font-heading font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                अभी फोन में इंस्टॉल करें (TAP TO INSTALL)
              </button>
            ) : null}

            {/* Manual Chrome steps for Android */}
            <div className="bg-black/40 border border-red-950 rounded-2xl p-4 text-left space-y-2.5 text-xs text-gray-300">
              <span className="font-bold text-white text-sm block border-b border-red-950 pb-1.5">
                Android फोन में 3 स्टेप्स:
              </span>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-bold flex items-center justify-center shrink-0">1</span>
                <span>अपने फोन के <strong>Google Chrome</strong> ब्राउज़र में इस गेम की लिंक खोलें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-bold flex items-center justify-center shrink-0">2</span>
                <span>ऊपर दाएँ कोने में <strong>3 डॉट्स (⋮)</strong> मेनू पर क्लिक करें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-bold flex items-center justify-center shrink-0">3</span>
                <span><strong>"Install App"</strong> या <strong>"Add to Home screen"</strong> पर टैप करें। ऐप आपके फोन की होम स्क्रीन पर आ जाएगा!</span>
              </div>
            </div>
          </div>
        )}

        {/* METHOD 2: PWABuilder to generate real .APK */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/40 text-xs text-gray-300">
              <span className="font-bold text-amber-300 text-sm block mb-1">
                मुफ़्त में असली .APK फ़ाइल बनाएं (Microsoft PWABuilder)
              </span>
              यदि आपको दोस्तों को शेयर करने के लिए एक असली <strong>.apk</strong> फाइल चाहिए, तो Microsoft का PWABuilder टूल 2 मिनट में आपकी लिंक से APK जनरेट कर देता है:
            </div>

            {/* Step 1: Copy App URL */}
            <div className="bg-black/50 border border-red-950 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">STEP 1: आपका APP URL</span>
                <span className="text-xs font-mono text-amber-300 truncate block">
                  {appUrl}
                </span>
              </div>
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-rose-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedUrl ? 'कॉपी हो गया' : 'URL कॉपी करें'}
              </button>
            </div>

            {/* Step 2: Open PWABuilder */}
            <div className="bg-black/50 border border-red-950 rounded-2xl p-4 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black flex items-center justify-center">2</span>
                <span>PWABuilder वेबसाइट पर जाएं:</span>
              </div>
              <p>PWABuilder.com पर जाकर यह कॉपी किया हुआ URL पेस्ट करें और <strong>Start</strong> दबाएं।</p>
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold underline"
              >
                PWABuilder.com खोलें <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Step 3: Download APK */}
            <div className="bg-black/50 border border-red-950 rounded-2xl p-4 space-y-1.5 text-xs text-gray-300">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black flex items-center justify-center">3</span>
                <span>Package for Android & Download APK:</span>
              </div>
              <p>
                <strong>"Package for Android"</strong> बटन पर क्लिक करें। इसके बाद <strong>"Download APK"</strong> चुनें। आपकी <code>.apk</code> फाइल डाउनलोड हो जाएगी और आप उसे अपने फोन में सीधे इंस्टॉल कर सकते हैं!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-red-950/60 flex items-center justify-between text-xs text-gray-400">
          <span>Google AI Studio App to Android</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-bold uppercase cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
