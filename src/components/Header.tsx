import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  ShoppingCart,
  User,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Sliders,
  HelpCircle,
  Store,
  Layers,
  Truck,
  Maximize,
  Minimize,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenAuth: (initialTab?: 'login' | 'register' | 'forgot') => void;
  onOpenProfile: () => void;
  onOpenOrders: () => void;
  onOpenPrescription: () => void;
  onOpenAdmin: () => void;
  onOpenDeployment: () => void;
  onOpenRiderPortal: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenOrders,
  onOpenPrescription,
  onOpenAdmin,
  onOpenDeployment,
  onOpenRiderPortal,
  isFullscreen = false,
  onToggleFullscreen,
  isMobileFrame = false,
  onToggleMobileFrame,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout, switchRole } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(
    'Namaste Madhav Medical Hall, I want to enquire about medicine availability and delivery in Chanmana/Baheri.'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Notice Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] md:text-xs py-1.5 px-3 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>CHANMANA, BAHERI, DARBHANGA, BIHAR</span>
            </span>
            <span className="hidden sm:inline-block text-emerald-400/40">•</span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-200">
              <Clock className="w-3.5 h-3.5" />
              <span>7:30 AM - 10:30 PM (Daily)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:9122260360"
              className="flex items-center gap-1 font-semibold text-white hover:text-emerald-300 transition"
            >
              <Phone className="w-3 h-3" />
              <span>9122260360</span>
            </a>
            <span className="text-emerald-400/40">•</span>
            <a
              href={`https://wa.me/919122260360?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-emerald-300 hover:text-white transition"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Rider Delivery Portal Button */}
            <button
              onClick={onOpenRiderPortal}
              className="flex items-center gap-1 text-[11px] bg-blue-800/80 hover:bg-blue-700 text-white px-2 py-0.5 rounded transition cursor-pointer"
              title="Dedicated delivery rider portal with PIN access"
            >
              <Truck className="w-3 h-3 text-blue-300" />
              <span>Rider Portal (PIN)</span>
            </button>

            {/* APK & Firebase Docs Button */}
            <button
              onClick={onOpenDeployment}
              className="hidden lg:flex items-center gap-1 text-[11px] bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded transition cursor-pointer"
              title="Firebase setup and APK deployment guide"
            >
              <HelpCircle className="w-3 h-3 text-emerald-300" />
              <span>Setup & APK Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/madhav-logo.jpg"
              alt="Madhav Medical Hall Logo"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-600 shadow-md transition-transform group-hover:scale-105"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-0.5 rounded-full border border-white">
              <ShieldCheck className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight leading-tight flex items-center gap-1">
                <span className="text-emerald-800">MADHAV</span>
                <span className="text-blue-900">MEDICAL HALL</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>{language === 'hi' ? 'माधव मेडिकल हॉल' : 'आपके स्वास्थ्य का भरोसेमंद साथी'}</span>
              <span className="hidden md:inline-block text-slate-400 text-[10px] font-normal">
                | Regd. Pharmacy
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Rx Upload Pill Button */}
          <button
            onClick={onOpenPrescription}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{t('uploadPrescription')}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                language === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                language === 'hi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Mobile Frame Simulator Toggle (on desktop) */}
          {onToggleMobileFrame && (
            <button
              onClick={onToggleMobileFrame}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isMobileFrame
                  ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isMobileFrame ? 'Exit Mobile Frame (डेस्कटॉप दृश्य)' : 'Mobile Phone View (मोबाइल फोन दृश्य)'}
            >
              {isMobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-blue-600" />}
              <span>
                {isMobileFrame
                  ? language === 'hi'
                    ? 'डेस्कटॉप दृश्य'
                    : 'Desktop'
                  : language === 'hi'
                  ? 'मोबाइल दृश्य'
                  : 'Mobile View'}
              </span>
            </button>
          )}

          {/* Full Screen Toggle Button (पूरा स्क्रीन) */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer active:scale-95 ${
                isFullscreen
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title={language === 'hi' ? 'पूरा स्क्रीन देखें (Full Screen)' : 'Toggle Full Screen Mode'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5 text-emerald-700" />}
              <span className="text-[11px] sm:text-xs">
                {language === 'hi'
                  ? isFullscreen
                    ? 'छोटा करें'
                    : 'पूरा स्क्रीन'
                  : isFullscreen
                  ? 'Exit Full'
                  : 'Full Screen'}
              </span>
            </button>
          )}

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="header" />
          </div>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition active:scale-95 cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5 text-emerald-700" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold max-w-[90px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && currentUser && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="p-3 border-b border-slate-100 bg-emerald-50/50 rounded-xl mb-1">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : currentUser.role === 'delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{currentUser.phone}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs text-slate-700">
                  <button
                    onClick={onOpenOrders}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>{t('orders')}</span>
                  </button>

                  <button
                    onClick={onOpenProfile}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{t('profile')}</span>
                  </button>

                  <button
                    onClick={onOpenAdmin}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-amber-50 text-amber-900 font-semibold transition text-left cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Pharmacist / Admin Portal</span>
                  </button>

                  <button
                    onClick={onOpenRiderPortal}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-900 font-semibold transition text-left cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Rider PIN Delivery Portal</span>
                  </button>

                  {/* Quick role test switcher */}
                  <div className="px-3 py-2 border-t border-slate-100 mt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      <span>Switch Active Role (Testing)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          switchRole('customer');
                        }}
                        className={`text-[10px] py-1 rounded font-bold ${
                          currentUser.role === 'customer'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Customer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          switchRole('admin');
                        }}
                        className={`text-[10px] py-1 rounded font-bold ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          switchRole('delivery');
                        }}
                        className={`text-[10px] py-1 rounded font-bold ${
                          currentUser.role === 'delivery'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={onOpenDeployment}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Setup & APK Checklist</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold transition text-left border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
