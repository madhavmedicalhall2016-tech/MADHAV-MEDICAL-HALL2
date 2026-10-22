import React from 'react';
import { Home, Pill, FileUp, Package, User, Maximize, Minimize } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

interface NavbarMobileProps {
  activeTab: 'home' | 'catalog' | 'orders' | 'profile';
  setActiveTab: (tab: 'home' | 'catalog' | 'orders' | 'profile') => void;
  onOpenPrescription: () => void;
  onOpenProfile: () => void;
  onOpenOrders: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isMobileFrame?: boolean;
}

export const NavbarMobile: React.FC<NavbarMobileProps> = ({
  activeTab,
  setActiveTab,
  onOpenPrescription,
  onOpenProfile,
  onOpenOrders,
  isFullscreen = false,
  onToggleFullscreen,
  isMobileFrame = false,
}) => {
  const { language, t } = useLanguage();
  const { orders } = useOrders();
  const { currentUser } = useAuth();

  const userOrdersCount = currentUser
    ? orders.filter(
        (o) =>
          (o.customerId === currentUser.uid || o.customerPhone === currentUser.phone) &&
          o.status !== 'Delivered' &&
          o.status !== 'Cancelled'
      ).length
    : 0;

  return (
    <div
      className={`${
        isMobileFrame ? 'sticky bottom-0 w-full' : 'md:hidden fixed bottom-0 left-0 right-0'
      } z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]`}
    >
      {/* Floating Full Screen Button for Mobile */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute -top-9 right-3 px-2.5 py-1 rounded-full bg-emerald-900/90 backdrop-blur-md text-emerald-100 text-[11px] font-bold shadow-lg border border-emerald-700/50 flex items-center gap-1 active:scale-95 transition cursor-pointer"
          title={language === 'hi' ? 'पूरा स्क्रीन देखें' : 'Toggle Full Screen'}
        >
          {isFullscreen ? <Minimize className="w-3 h-3 text-emerald-400" /> : <Maximize className="w-3 h-3 text-emerald-400" />}
          <span>{isFullscreen ? (language === 'hi' ? 'छोटा करें' : 'Exit Full') : (language === 'hi' ? '⛶ पूरा स्क्रीन' : '⛶ Full Screen')}</span>
        </button>
      )}

      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('home')}</span>
        </button>

        {/* Medicines Catalog */}
        <button
          onClick={() => {
            setActiveTab('catalog');
            const el = document.getElementById('medicine-catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'catalog' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('catalog')}</span>
        </button>

        {/* Elevated Upload Rx Button */}
        <button
          onClick={onOpenPrescription}
          className="flex flex-col items-center -mt-5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-3 border-white group-active:scale-95 transition-transform bg-gradient-to-tr from-emerald-700 to-teal-500">
            <FileUp className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800 mt-1">Rx पर्चा</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => {
            setActiveTab('orders');
            onOpenOrders();
          }}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'orders' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          {userOrdersCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {userOrdersCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">{t('orders')}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            setActiveTab('profile');
            onOpenProfile();
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('account')}</span>
        </button>
      </div>
    </div>
  );
};
