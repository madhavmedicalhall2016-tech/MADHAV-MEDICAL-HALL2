import React, { useState } from 'react';
import {
  X,
  Truck,
  Lock,
  KeyRound,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Banknote,
  ShieldCheck,
  LogOut,
  ChevronRight,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';

interface RiderPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RiderAccount {
  name: string;
  phone: string;
  zone: string;
  pin: string;
}

const REGISTERED_RIDERS: RiderAccount[] = [
  { name: 'Ramesh Kumar', phone: '9876543210', zone: 'Baheri Zone', pin: '1234' },
  { name: 'Mohan Lal', phone: '9122260360', zone: 'Chanmana Zone', pin: '5678' },
  { name: 'Vijay Singh', phone: '9431234567', zone: 'Darbhanga Route', pin: '9999' },
];

export const RiderPortal: React.FC<RiderPortalProps> = ({ isOpen, onClose }) => {
  const { orders, updateOrderStatus } = useOrders();
  const { language } = useLanguage();

  const [activeRider, setActiveRider] = useState<RiderAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [selectedRiderPhone, setSelectedRiderPhone] = useState(REGISTERED_RIDERS[0].phone);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'active' | 'delivered'>('active');

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rider = REGISTERED_RIDERS.find((r) => r.phone === selectedRiderPhone);
    if (!rider) {
      setErrorMessage('Rider not found.');
      return;
    }

    if (pinInput.trim() === rider.pin) {
      setActiveRider(rider);
      setPinInput('');
    } else {
      setErrorMessage('Incorrect 4-digit PIN. Hint: Use 1234 for Ramesh Kumar.');
    }
  };

  const handleLogout = () => {
    setActiveRider(null);
    setPinInput('');
    setErrorMessage(null);
  };

  // Filter orders assigned to this rider
  const riderOrders = activeRider
    ? orders.filter(
        (o) =>
          o.assignedDeliveryAgent?.phone === activeRider.phone ||
          (o.status === 'Out for Delivery' && (!o.assignedDeliveryAgent || o.assignedDeliveryAgent.phone === activeRider.phone))
      )
    : [];

  const activeOrders = riderOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const deliveredOrders = riderOrders.filter((o) => o.status === 'Delivered');

  const displayedOrders = filterTab === 'active' ? activeOrders : deliveredOrders;

  const totalCashToCollect = activeOrders.reduce((sum, o) => sum + (o.paymentMethod === 'COD' ? o.totalAmount : 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                MADHAV MEDICAL — RIDER PORTAL
              </h3>
              <p className="text-xs text-blue-200">
                Chanmana & Baheri Doorstep Medicine Delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {!activeRider ? (
            /* PIN Gate View */
            <div className="max-w-sm mx-auto my-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Rider Verification</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Select your profile and enter your 4-digit security PIN to access assigned routes.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Delivery Agent
                  </label>
                  <select
                    value={selectedRiderPhone}
                    onChange={(e) => setSelectedRiderPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-blue-600"
                  >
                    {REGISTERED_RIDERS.map((r) => (
                      <option key={r.phone} value={r.phone}>
                        {r.name} ({r.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter 4-Digit Rider PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest text-slate-900 focus:outline-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  Unlock Delivery Console
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-600">Testing Demo PINs:</p>
                <p>Ramesh Kumar: <span className="font-mono font-bold text-blue-700">1234</span></p>
                <p>Mohan Lal: <span className="font-mono font-bold text-blue-700">5678</span></p>
              </div>
            </div>
          ) : (
            /* Unlocked Rider Console View */
            <div className="space-y-4">
              {/* Rider Info Card */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
                    {activeRider.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base">{activeRider.name}</h4>
                    <p className="text-xs text-blue-200">{activeRider.zone} • {activeRider.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-blue-300 uppercase font-bold">To Collect</p>
                    <p className="text-base font-black text-amber-300">₹{totalCashToCollect}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Lock Console"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 text-xs font-bold">
                <button
                  onClick={() => setFilterTab('active')}
                  className={`flex-1 py-2 px-3 rounded-xl transition ${
                    filterTab === 'active'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Pending Deliveries ({activeOrders.length})
                </button>
                <button
                  onClick={() => setFilterTab('delivered')}
                  className={`flex-1 py-2 px-3 rounded-xl transition ${
                    filterTab === 'delivered'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Delivered Completed ({deliveredOrders.length})
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {displayedOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs border border-slate-200">
                    No orders in this tab. All active deliveries are clear!
                  </div>
                ) : (
                  displayedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition"
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                          {ord.id}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            ₹{ord.totalAmount}
                          </span>
                          <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {ord.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-900 text-sm">
                          {ord.customerName}
                        </p>
                        <p className="text-slate-600 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            {ord.shippingAddress.street}, {ord.shippingAddress.locality} - {ord.shippingAddress.pinCode}
                          </span>
                        </p>
                        {ord.shippingAddress.landmark && (
                          <p className="text-[11px] text-slate-500 pl-4.5">
                            Landmark: {ord.shippingAddress.landmark}
                          </p>
                        )}
                      </div>

                      {/* Items Brief */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Package Contents: </span>
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Prescription Items'}
                      </div>

                      {/* Action Row */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {ord.customerPhone}</span>
                          </a>

                          {ord.shippingAddress.gpsCoords?.mapsUrl ? (
                            <a
                              href={ord.shippingAddress.gpsCoords.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>GPS Map</span>
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${ord.shippingAddress.locality}, Baheri, Bihar`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Village Map</span>
                            </a>
                          )}
                        </div>

                        {/* Status Advancement */}
                        <div className="flex items-center gap-1.5">
                          {ord.status !== 'Out for Delivery' && ord.status !== 'Delivered' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(
                                  ord.id,
                                  'Out for Delivery',
                                  `Picked up by rider ${activeRider.name}`
                                )
                              }
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Start Delivery
                            </button>
                          )}

                          {ord.status !== 'Delivered' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(
                                  ord.id,
                                  'Delivered',
                                  `Delivered by ${activeRider.name}. Cash ₹${ord.totalAmount} collected.`
                                )
                              }
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                            >
                              Mark Delivered ✓
                            </button>
                          )}

                          {ord.status === 'Delivered' && (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
