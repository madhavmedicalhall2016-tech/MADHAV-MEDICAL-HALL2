import React, { useState, useMemo } from 'react';
import {
  Search,
  FileUp,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  HelpCircle,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Pill,
  Heart,
  ExternalLink,
  Smartphone,
  Monitor,
  Maximize,
  Minimize,
  Wifi,
  Battery,
} from 'lucide-react';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider, useOrders } from './context/OrderContext';

import { Header } from './components/Header';
import { NavbarMobile } from './components/NavbarMobile';
import { MedicineCard } from './components/MedicineCard';
import { MedicineModal } from './components/MedicineModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { RiderPortal } from './components/RiderPortal';
import { DeploymentModal } from './components/DeploymentModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

import { CATEGORIES } from './data/medicines';
import { Medicine } from './types';

function PharmacyApp() {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { medicines } = useOrders();
  const { setIsCartOpen } = useCart();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'otc' | 'rx'>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  // Mobile Navigation active tab
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'catalog' | 'orders' | 'profile'>('home');

  // Modal Dialog States
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRiderOpen, setIsRiderOpen] = useState(false);
  const [isDeploymentOpen, setIsDeploymentOpen] = useState(false);

  // Full Screen & Mobile Frame Simulator States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtered & Sorted Medicines
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Category filter
        if (selectedCategory !== 'all' && med.category !== selectedCategory) {
          return false;
        }
        // Prescription type filter
        if (filterType === 'otc' && med.requiresPrescription) return false;
        if (filterType === 'rx' && !med.requiresPrescription) return false;
        // Stock filter
        if (onlyInStock && (!med.inStock || med.stockCount <= 0)) return false;
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = med.name.toLowerCase().includes(q);
          const matchNameHi = med.nameHi.toLowerCase().includes(q);
          const matchSalt = med.salt.toLowerCase().includes(q);
          const matchBrand = med.brand.toLowerCase().includes(q);
          const matchUses = med.uses.toLowerCase().includes(q) || med.usesHi.toLowerCase().includes(q);
          return matchName || matchNameHi || matchSalt || matchBrand || matchUses;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        // Default popular: featured first, then inStock
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [medicines, selectedCategory, filterType, onlyInStock, searchQuery, sortBy]);

  const whatsappMessage = encodeURIComponent(
    'Namaste Madhav Medical Hall, I would like to order medicines from Chanmana/Baheri.'
  );

  const appContent = (
    <>
      {/* Main Top Header */}
      <Header
        onOpenAuth={(tab = 'login') => {
          setAuthInitialTab(tab);
          setIsAuthOpen(true);
        }}
        onOpenProfile={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setIsProfileOpen(true);
          }
        }}
        onOpenOrders={() => {
          setTrackingOrderId(null);
          setIsTrackingOpen(true);
        }}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDeployment={() => setIsDeploymentOpen(true)}
        onOpenRiderPortal={() => setIsRiderOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Hero Section Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl border border-emerald-700/50">
          {/* Subtle background graphics */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Medicines • Certified Pharmacist</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {language === 'hi' ? (
                  <>
                    माधव मेडिकल हॉल, चनमना
                    <span className="block text-emerald-300 text-xl sm:text-3xl mt-1">
                      आपके स्वास्थ्य का भरोसेमंद साथी
                    </span>
                  </>
                ) : (
                  <>
                    Madhav Medical Hall
                    <span className="block text-emerald-300 text-xl sm:text-3xl mt-1">
                      Fast Medicine Delivery in Baheri & Chanmana
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-lg">
                {language === 'hi'
                  ? 'घर बैठे मंगवाएं असली दवाइयां, बच्चों का आहार, दर्द निवारक, बीपी व शुगर की दवाएं। डॉक्टर का पर्चा भेजें या नाम से खोजें।'
                  : 'Order genuine medicines online or upload your doctor prescription. Rapid local delivery in Chanmana, Baheri, and surrounding Darbhanga villages.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => setIsPrescriptionOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <FileUp className="w-4 h-4 text-emerald-700" />
                  <span>{t('uploadPrescription')}</span>
                </button>

                <a
                  href={`https://wa.me/919122260360?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('quickOrderWhatsApp')}</span>
                </a>

                <a
                  href="tel:9122260360"
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition"
                >
                  <Phone className="w-4 h-4 text-emerald-300" />
                  <span>9122260360</span>
                </a>

                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer border border-emerald-400/40 active:scale-95 shadow-md"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 text-emerald-200" /> : <Maximize className="w-4 h-4 text-emerald-200" />}
                  <span>{isFullscreen ? (language === 'hi' ? 'छोटा करें' : 'Exit Full') : (language === 'hi' ? '⛶ पूरा स्क्रीन' : '⛶ Full Screen')}</span>
                </button>

                <button
                  onClick={() => setIsMobileFrame(!isMobileFrame)}
                  className="hidden md:flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-blue-600/80 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer border border-blue-400/40 active:scale-95 shadow-md"
                  title="Toggle Mobile Simulator"
                >
                  {isMobileFrame ? <Monitor className="w-4 h-4 text-blue-200" /> : <Smartphone className="w-4 h-4 text-blue-200" />}
                  <span>{isMobileFrame ? (language === 'hi' ? 'डेस्कटॉप दृश्य' : 'Desktop View') : (language === 'hi' ? '📱 मोबाइल फोन दृश्य' : '📱 Mobile View')}</span>
                </button>
              </div>

              {/* Delivery Guarantee Highlights */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-emerald-200/90">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free delivery above ₹399</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>45-90 min delivery time</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash & UPI on Delivery</span>
                </span>
              </div>
            </div>

            {/* Right Emblem Image with Clean Glow */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-full p-2 bg-white/10 backdrop-blur-md border-2 border-emerald-400/30 shadow-2xl flex items-center justify-center">
                <img
                  src="/madhav-logo.jpg"
                  alt="Madhav Medical Hall"
                  className="w-full h-full rounded-full object-cover shadow-md"
                />
              </div>
              <div className="mt-3 text-center bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[11px] font-semibold text-emerald-200">
                CHANMANA • BAHERI • DARBHANGA
              </div>
            </div>
          </div>
        </section>

        {/* PWA In-App Banner on Mobile */}
        <div className="block sm:hidden">
          <PWAInstallButton variant="banner" />
        </div>

        {/* Search, Filter & Categories Section */}
        <section id="medicine-catalog-section" className="space-y-4">
          {/* Search Box */}
          <div className="relative w-full max-w-3xl mx-auto shadow-sm">
            <Search className="w-5 h-5 text-emerald-700 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white border border-slate-300/80 rounded-2xl pl-12 pr-10 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-emerald-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Carousel / Horizontal Tabs */}
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{language === 'hi' ? cat.nameHi : cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filter & Sort Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              {/* Prescription Type Pills */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('otc')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterType === 'otc' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  OTC (No Rx)
                </button>
                <button
                  onClick={() => setFilterType('rx')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterType === 'rx' ? 'bg-white text-rose-800 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Rx Only
                </button>
              </div>

              {/* In-Stock Only Toggle */}
              <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer pl-1">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Sort Dropdown & Count */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-800">{filteredMedicines.length} medicines</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-emerald-600"
                >
                  <option value="popular">Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Medicines Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-700" />
              <span>
                {selectedCategory === 'all'
                  ? language === 'hi'
                    ? 'दवाइयां एवं स्वास्थ्य उत्पाद'
                    : 'Medicines & Healthcare Products'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.[language === 'hi' ? 'nameHi' : 'name']}
              </span>
            </h3>

            {searchQuery && (
              <span className="text-xs text-emerald-800 font-semibold">
                Results for "{searchQuery}"
              </span>
            )}
          </div>

          {filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Pill className="w-8 h-8 text-emerald-700" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No medicines found</h4>
              <p className="text-xs text-slate-500 mt-1">
                We might have this medicine in our Chanmana physical store. Upload doctor slip or call 9122260360 directly!
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setIsPrescriptionOpen(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Upload Prescription
                </button>
                <a
                  href="tel:9122260360"
                  className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Call Pharmacist
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredMedicines.map((med) => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  onSelect={(m) => setSelectedMedicine(m)}
                />
              ))}
            </div>
          )}
        </section>

        {/* WhatsApp Prescription Order Banner */}
        <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {language === 'hi' ? 'त्वरित डॉक्टर पर्चा सेवा' : 'Direct Pharmacist Help'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {language === 'hi'
                  ? 'दवा नहीं मिल रही? फोटो खींचकर व्हाट्सएप पर भेजें!'
                  : "Can't find your specific medicine? WhatsApp your prescription!"}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {language === 'hi'
                  ? 'हमारे पंजीकृत फार्मासिस्ट आपके पर्चे की जांच करेंगे और चनमना व बहेड़ी में 45 से 90 मिनट में दवा घर पहुंचाएंगे।'
                  : 'Send a photo of your doctor prescription to our pharmacist. We will verify availability and deliver to your doorstep.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/919122260360?text=${encodeURIComponent(
                  'Namaste Madhav Medical Hall, I am sending my doctor prescription photo for home delivery.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-xl transition active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp: 9122260360</span>
              </a>

              <button
                onClick={() => setIsPrescriptionOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-slate-100 transition cursor-pointer"
              >
                Upload on Website
              </button>
            </div>
          </div>
        </section>

        {/* Store Information, Location & Google Maps Navigation */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/madhav-logo.jpg"
                alt="Madhav Medical Hall"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
              />
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  MADHAV MEDICAL HALL (माधव मेडिकल हॉल)
                </h4>
                <p className="text-xs text-emerald-700 font-semibold">
                  आपके स्वास्थ्य का भरोसेमंद साथी • Regd. Pharmacy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Chanmana,+Baheri,+Darbhanga,+Bihar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{t('directionsToStore')}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            {/* Address */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Store Location</span>
              </div>
              <p className="font-semibold text-slate-800">
                CHANMANA, BAHERI, DARBHANGA, BIHAR, INDIA
              </p>
              <p className="text-slate-500">
                PIN: 847105 • Serving Chanmana, Baheri Bazaar, Hathinda, and surrounding gram panchayats.
              </p>
            </div>

            {/* Operating Hours */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Opening Hours</span>
              </div>
              <p className="font-semibold text-slate-800">7:30 AM – 10:30 PM (Daily / 7 Days)</p>
              <p className="text-slate-500">
                Emergency 24x7 telephone and WhatsApp order support available on 9122260360.
              </p>
            </div>

            {/* Helpline & WhatsApp */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Helpline & Support</span>
              </div>
              <p className="font-semibold text-slate-800">Call: 9122260360</p>
              <p className="text-slate-500">
                WhatsApp: +919122260360 • Email: madhavmedicalhall2016@gmail.com
              </p>
            </div>
          </div>

          {/* Legal Prescription Notice */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Notice under Drugs and Cosmetics Rules: </span>
            Prescription medicines (Schedule H, H1 & X) require valid doctor prescriptions issued by licensed medical practitioners and verified by our on-duty registered pharmacist prior to fulfillment.
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src="/madhav-logo.jpg"
              alt="Madhav Medical Hall"
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            <div>
              <p className="font-extrabold text-white text-sm">MADHAV MEDICAL HALL</p>
              <p className="text-[11px] text-slate-400">
                CHANMANA, BAHERI, DARBHANGA, BIHAR • 9122260360
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthInitialTab('login');
                  setIsAuthOpen(true);
                } else {
                  setIsProfileOpen(true);
                }
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Customer Profile
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-400 transition font-bold cursor-pointer"
            >
              Pharmacist Portal
            </button>
            <span>•</span>
            <button
              onClick={() => setIsRiderOpen(true)}
              className="hover:text-blue-400 transition font-bold cursor-pointer"
            >
              Rider Portal (PIN)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDeploymentOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              APK & Deployment Guide
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} MADHAV MEDICAL HALL. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile-first Bottom Navigation Bar */}
      <NavbarMobile
        activeTab={activeMobileTab}
        setActiveTab={setActiveMobileTab}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenProfile={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setIsAuthOpen(true);
          } else {
            setIsProfileOpen(true);
          }
        }}
        onOpenOrders={() => {
          setTrackingOrderId(null);
          setIsTrackingOpen(true);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isMobileFrame={isMobileFrame}
      />
    </>
  );

  const modals = (
    <>
      {/* Modals & Slide-out Drawers */}
      <MedicineModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onUploadPrescription={() => setIsPrescriptionOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderId) => {
          setSuccessOrderId(orderId);
        }}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setIsAuthOpen(true);
        }}
      />

      <OrderSuccessModal
        orderId={successOrderId}
        onClose={() => setSuccessOrderId(null)}
        onTrackOrder={(id) => {
          setSuccessOrderId(null);
          setTrackingOrderId(id);
          setIsTrackingOpen(true);
        }}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        onSuccess={(orderId) => {
          setSuccessOrderId(orderId);
        }}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setIsAuthOpen(true);
        }}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrderId(null);
        }}
        selectedOrderId={trackingOrderId}
      />

      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => {
          setIsProfileOpen(false);
          setTrackingOrderId(null);
          setIsTrackingOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authInitialTab}
      />

      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <RiderPortal
        isOpen={isRiderOpen}
        onClose={() => setIsRiderOpen(false)}
      />

      <DeploymentModal
        isOpen={isDeploymentOpen}
        onClose={() => setIsDeploymentOpen(false)}
      />
    </>
  );

  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-4 sm:py-6 px-2 sm:px-4 selection:bg-emerald-500 selection:text-white">
        <OfflineIndicator />

        {/* Top Floating Control Dock */}
        <div className="w-full max-w-md mb-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {language === 'hi' ? 'मोबाइल फोन दृश्य' : 'Mobile Phone View'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Madhav Medical Hall • Chanmana, Baheri</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              title="पूरा स्क्रीन"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? (language === 'hi' ? 'छोटा करें' : 'Exit') : (language === 'hi' ? 'पूरा स्क्रीन' : 'Full')}</span>
            </button>

            <button
              onClick={() => setIsMobileFrame(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
              title="डेस्कटॉप दृश्य पर जाएं"
            >
              <Monitor className="w-3.5 h-3.5 text-slate-300" />
              <span>{language === 'hi' ? 'डेस्कटॉप' : 'Desktop'}</span>
            </button>
          </div>
        </div>

        {/* Realistic Android Phone Device Shell */}
        <div className="w-full max-w-[430px] h-[870px] max-h-[88vh] bg-slate-900 rounded-[50px] p-2.5 shadow-[0_25px_80px_rgba(0,0,0,0.85)] border-[7px] border-slate-700 flex flex-col relative ring-1 ring-white/10 overflow-hidden">
          {/* Top Notch & Punch-hole Camera */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 z-50 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-6 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Android Status Bar */}
          <div className="w-full pt-1 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-700 select-none z-40 bg-slate-100 rounded-t-[38px] border-b border-slate-200">
            <span className="font-bold text-slate-800">10:30 AM</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-700 font-extrabold tracking-wider">Jio 5G</span>
              <Wifi className="w-3 h-3 text-slate-700" />
              <Battery className="w-3.5 h-3.5 text-slate-800" />
            </div>
          </div>

          {/* Inner Phone Screen Content */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden rounded-b-[38px] relative pb-16 flex flex-col justify-between">
            {appContent}
          </div>

          {/* Android Home Navigation Gesture Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-500 rounded-full z-50 pointer-events-none" />
        </div>

        {/* Global Modals */}
        {modals}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-16 md:pb-0 font-sans">
      <OfflineIndicator />
      {appContent}

      {/* Floating Desktop Quick Mode Dock */}
      <div className="hidden md:flex fixed bottom-5 right-5 z-40 items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl text-white">
        <button
          onClick={() => setIsMobileFrame(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 bg-slate-800 hover:bg-slate-700 text-slate-200"
          title="मोबाइल फोन की तरह देखें (Mobile Phone View)"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'hi' ? '📱 मोबाइल दृश्य' : '📱 Mobile View'}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
            isFullscreen
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100'
          }`}
          title="पूरा स्क्रीन देखें (Full Screen)"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span>{isFullscreen ? (language === 'hi' ? 'छोटा करें' : 'Exit Full') : (language === 'hi' ? '⛶ पूरा स्क्रीन' : '⛶ Full Screen')}</span>
        </button>
      </div>

      {modals}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <PharmacyApp />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
