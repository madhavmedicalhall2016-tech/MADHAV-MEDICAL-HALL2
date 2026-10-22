import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'menu' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else if (isInstallable) {
      await install();
    } else {
      // In desktop browser or when prompt is not yet ready, show guidance
      setShowIOSGuide(true);
    }
  };

  const buttonText = language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App';

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Install Madhav Medical Hall App on your mobile"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md my-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'hi' ? 'माधव मेडिकल ऐप इंस्टॉल करें' : 'Install Madhav Medical App'}
              </h4>
              <p className="text-xs text-emerald-200">
                {language === 'hi'
                  ? 'मोबाइल होम स्क्रीन से सीधे 1-टैप में दवा ऑर्डर करें'
                  : 'Fast 1-tap ordering, instant prescription upload & tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
          >
            {buttonText}
          </button>
        </div>
      )}

      {variant === 'menu' && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{buttonText} (PWA)</span>
        </button>
      )}

      {/* Guide Modal for iOS or manual install */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/madhav-logo.jpg"
                alt="Madhav Medical Logo"
                className="w-12 h-12 rounded-xl object-contain shadow-sm border border-slate-100"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {language === 'hi' ? 'ऐप इंस्टॉल निर्देश' : 'Install on Your Device'}
                </h3>
                <p className="text-xs text-slate-500">MADHAV MEDICAL HALL</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  {language === 'hi'
                    ? 'ब्राउज़र के मेनू (Chrome में 3 डॉट ⋮ या Safari में शेयर ⎋ बटन) पर टैप करें।'
                    : 'Tap the browser menu (3-dots ⋮ in Chrome or Share ⎋ button in Safari).'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  {language === 'hi'
                    ? '"होम स्क्रीन में जोड़ें" (Add to Home screen) या "ऐप इंस्टॉल करें" चुनें।'
                    : 'Select "Add to Home screen" or "Install App".'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  {language === 'hi'
                    ? 'माधव मेडिकल हॉल ऐप आपके फोन में बिना किसी झंझट इंस्टॉल हो जाएगा।'
                    : 'The app will be installed on your phone just like a native Android app.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition shadow cursor-pointer"
            >
              {language === 'hi' ? 'समझ गया' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
