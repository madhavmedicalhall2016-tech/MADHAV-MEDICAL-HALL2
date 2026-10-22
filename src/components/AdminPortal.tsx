import React, { useState } from 'react';
import {
  X,
  Store,
  Package,
  FileText,
  Boxes,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  ExternalLink,
  Edit2,
  Plus,
  ShieldAlert,
  Search,
  Check,
  Ban,
  Clock,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus, Medicine } from '../types';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_AGENTS = [
  { name: 'Ramesh Kumar (Baheri Zone)', phone: '9876543210' },
  { name: 'Mohan Lal (Chanmana Zone)', phone: '9122260360' },
  { name: 'Vijay Singh (Darbhanga Route)', phone: '9431234567' },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const { orders, medicines, updateOrderStatus, assignDeliveryAgent, updatePrescriptionStatus, updateMedicineStock, updateMedicinePrice, addNewMedicine } = useOrders();
  const { currentUser, switchRole } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'prescriptions' | 'inventory' | 'delivery'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inventory editing
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Add new medicine state
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedNameHi, setNewMedNameHi] = useState('');
  const [newMedBrand, setNewMedBrand] = useState('');
  const [newMedSalt, setNewMedSalt] = useState('');
  const [newMedPrice, setNewMedPrice] = useState(100);
  const [newMedMrp, setNewMedMrp] = useState(120);
  const [newMedPack, setNewMedPack] = useState('10 Tablets / Strip');
  const [newMedCategory, setNewMedCategory] = useState('fever_pain');
  const [newMedRx, setNewMedRx] = useState(false);

  // Prescription review state
  const [pharmacistComment, setPharmacistComment] = useState('');

  if (!isOpen) return null;

  // Role Gate check
  const isDeliveryRole = currentUser?.role === 'delivery';

  const filteredOrders = orders.filter((o) => {
    if (isDeliveryRole || activeTab === 'delivery') {
      // delivery agent sees only orders assigned or out for delivery
      return o.assignedDeliveryAgent?.phone === currentUser?.phone || o.status === 'Out for Delivery';
    }
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  const ordersWithPrescription = orders.filter((o) => o.prescription);

  const filteredMedicines = medicines.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.salt.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q)
    );
  });

  const handleSaveMedEdit = (medId: string) => {
    updateMedicinePrice(medId, editPrice);
    updateMedicineStock(medId, editStock > 0, editStock);
    setEditingMedId(null);
  };

  const handleAddNewMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedSalt.trim()) return;

    const newMed: Medicine = {
      id: 'med-' + Date.now(),
      name: newMedName.trim(),
      nameHi: newMedNameHi.trim() || newMedName.trim(),
      brand: newMedBrand.trim() || 'Madhav Healthcare',
      salt: newMedSalt.trim(),
      category: newMedCategory,
      categoryHi: 'दवा',
      price: newMedPrice,
      mrp: newMedMrp,
      discountPercent: Math.max(0, Math.round(((newMedMrp - newMedPrice) / newMedMrp) * 100)),
      packSize: newMedPack,
      packSizeHi: newMedPack,
      inStock: true,
      stockCount: 50,
      requiresPrescription: newMedRx,
      dosageForm: 'Tablet',
      dosageFormHi: 'टैबलेट',
      uses: 'Used as prescribed by registered medical practitioner.',
      usesHi: 'चिकित्सक की सलाह के अनुसार सेवन करें।',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    };

    addNewMedicine(newMed);
    setShowAddMed(false);
    setNewMedName('');
    setNewMedSalt('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  MADHAV MEDICAL PHARMACIST PORTAL
                </h3>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  {currentUser?.role === 'delivery' ? 'Delivery Agent View' : 'Pharmacist Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chanmana, Baheri, Darbhanga • Helpline: 9122260360
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role quick toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => switchRole('admin')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                  currentUser?.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('delivery')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                  currentUser?.role === 'delivery' ? 'bg-blue-500 text-white' : 'text-slate-400'
                }`}
              >
                Delivery Rider
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Prescriptions Review ({ordersWithPrescription.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Inventory & Prices ({medicines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'delivery'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Rider Delivery View</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* TAB 1: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1 text-xs">
                  {['all', 'Order Placed', 'Under Review', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'all' ? 'All Orders' : st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search order ID or phone..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Orders Table / Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs border border-slate-200">
                    No matching orders found.
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/40 transition space-y-3"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {ord.id}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {ord.customerName} • {ord.customerPhone}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {ord.shippingAddress.street}, {ord.shippingAddress.locality} (PIN {ord.shippingAddress.pinCode})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-base font-black text-slate-900">₹{ord.totalAmount}</span>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">{ord.paymentMethod} ({ord.paymentStatus})</p>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items details & GPS link */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <p className="font-bold text-slate-700">Prescription & Medicines Ordered:</p>
                          {ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-slate-600">
                                <span>{it.name} {it.requiresPrescription && <strong className="text-rose-600">(Rx)</strong>}</span>
                                <span>{it.quantity} x ₹{it.price}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-amber-800 font-semibold">Direct Doctor Prescription Slip Order</p>
                          )}
                          {ord.prescription && (
                            <div className="pt-1 mt-1 border-t border-slate-200 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-rose-700">Prescription Attached:</span>
                              <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                                {ord.prescription.status}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Delivery Actions:</span>
                            {ord.shippingAddress.gpsCoords?.mapsUrl && (
                              <a
                                href={ord.shippingAddress.gpsCoords.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <span>Customer GPS Map</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-emerald-100"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Customer</span>
                            </a>
                            <a
                              href={`https://wa.me/91${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Namaste ${ord.customerName}, this is regarding your order ${ord.id} from Madhav Medical Hall, Chanmana.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:bg-[#20ba59]"
                            >
                              WhatsApp
                            </a>
                          </div>

                          {/* Assign Delivery Agent Dropdown */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-500 font-semibold">Rider:</span>
                            <select
                              value={ord.assignedDeliveryAgent?.phone || ''}
                              onChange={(e) => {
                                const selected = DELIVERY_AGENTS.find((a) => a.phone === e.target.value);
                                if (selected) assignDeliveryAgent(ord.id, selected);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-emerald-600"
                            >
                              <option value="">Select Rider...</option>
                              {DELIVERY_AGENTS.map((ag) => (
                                <option key={ag.phone} value={ag.phone}>
                                  {ag.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Status Pipeline Advancement Controls */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-500">Update Order State:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ord.status === 'Order Placed' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Under Review', 'Pharmacist initiated prescription review')}
                              className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer"
                            >
                              Review Rx
                            </button>
                          )}

                          {(ord.status === 'Order Placed' || ord.status === 'Under Review') && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Confirmed', 'Medicines verified and bill generated')}
                              className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                            >
                              Confirm Order
                            </button>
                          )}

                          {ord.status === 'Confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Preparing', 'Medicines packed with cold chain/seal')}
                              className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Mark Preparing
                            </button>
                          )}

                          {ord.status === 'Preparing' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Out for Delivery', 'Dispatched for doorstep delivery')}
                              className="px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
                            >
                              Dispatch (Out for Delivery)
                            </button>
                          )}

                          {ord.status === 'Out for Delivery' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Delivered', 'Medicine delivered and payment received')}
                              className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'Cancelled', 'Cancelled by Pharmacist/Store')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRESCRIPTIONS REVIEW */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Doctor Prescriptions Pending Verification
              </h4>

              {ordersWithPrescription.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs border border-slate-200">
                  No prescription orders yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ordersWithPrescription.map((ord) => {
                    const rx = ord.prescription!;
                    return (
                      <div
                        key={ord.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-mono text-xs font-extrabold text-emerald-800">
                            {ord.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rx.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rx.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {rx.status}
                          </span>
                        </div>

                        <div className="aspect-16/9 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative group">
                          <img
                            src={rx.imageUrl}
                            alt="Prescription slip"
                            className="max-h-full max-w-full object-contain"
                          />
                          <a
                            href={rx.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] rounded font-bold"
                          >
                            Full View
                          </a>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="font-bold text-slate-900">Patient: {rx.patientName} {rx.patientAge ? `(${rx.patientAge})` : ''}</p>
                          <p className="text-slate-600">Contact: {ord.customerPhone}</p>
                          {rx.doctorName && <p className="text-slate-600">Doctor: {rx.doctorName}</p>}
                          {rx.notes && <p className="text-slate-500 italic">Notes: "{rx.notes}"</p>}
                        </div>

                        {/* Verification Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-xs font-bold text-emerald-700 flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call to Confirm</span>
                          </a>

                          <div className="flex gap-2">
                            <button
                              onClick={() => updatePrescriptionStatus(ord.id, 'Rejected', 'Invalid or unreadable slip')}
                              className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                updatePrescriptionStatus(ord.id, 'Verified', 'Verified by Madhav pharmacist');
                                updateOrderStatus(ord.id, 'Confirmed', 'Prescription verified');
                              }}
                              className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                            >
                              Approve & Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine by name or salt..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-emerald-600"
                  />
                </div>

                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Medicine</span>
                </button>
              </div>

              {/* Add New Medicine Form */}
              {showAddMed && (
                <form
                  onSubmit={handleAddNewMedicine}
                  className="bg-white border-2 border-emerald-500 p-5 rounded-2xl shadow-lg space-y-3"
                >
                  <h5 className="text-xs font-bold text-emerald-900 uppercase">
                    Add New Medicine to Madhav Medical Inventory
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Hindi Name (उदा. पैरासिटामोल)"
                      value={newMedNameHi}
                      onChange={(e) => setNewMedNameHi(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Manufacturer / Brand (e.g. Cipla)"
                      value={newMedBrand}
                      onChange={(e) => setNewMedBrand(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Active Salt Composition"
                      value={newMedSalt}
                      onChange={(e) => setNewMedSalt(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Store Price ₹"
                      value={newMedPrice}
                      onChange={(e) => setNewMedPrice(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="number"
                      placeholder="MRP ₹"
                      value={newMedMrp}
                      onChange={(e) => setNewMedMrp(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={newMedRx}
                        onChange={(e) => setNewMedRx(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Requires Doctor Prescription (Rx)</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMed(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Save Medicine
                    </button>
                  </div>
                </form>
              )}

              {/* Medicine Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Medicine</th>
                        <th className="p-3">Brand & Salt</th>
                        <th className="p-3">Price / MRP</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3">Availability</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMedicines.map((med) => {
                        const isEditing = editingMedId === med.id;
                        return (
                          <tr key={med.id} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{med.name}</p>
                              <p className="text-[11px] text-slate-400">{med.nameHi}</p>
                            </td>
                            <td className="p-3 text-slate-600">
                              <p className="font-semibold">{med.brand}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{med.salt}</p>
                            </td>
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold"
                                />
                              ) : (
                                <div>
                                  <span className="font-black text-slate-900">₹{med.price}</span>
                                  <span className="text-[10px] text-slate-400 line-through ml-1.5">
                                    ₹{med.mrp}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editStock}
                                  onChange={(e) => setEditStock(Number(e.target.value))}
                                  className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold"
                                />
                              ) : (
                                <span className={med.stockCount <= 5 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                                  {med.stockCount} units
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => updateMedicineStock(med.id, !med.inStock, med.inStock ? 0 : 25)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                                  med.inStock && med.stockCount > 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {med.inStock && med.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              {isEditing ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveMedEdit(med.id)}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingMedId(null)}
                                    className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingMedId(med.id);
                                    setEditPrice(med.price);
                                    setEditStock(med.stockCount);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Edit Price & Stock"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY AGENT PORTAL */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase">
                    Assigned Deliveries for Baheri / Chanmana
                  </h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Delivery Boy: Ramesh Kumar (Phone: 9876543210)
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-xl">
                  {filteredOrders.length} Active Route(s)
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-black text-slate-900">{ord.id}</span>
                      <span className="text-xs font-bold text-emerald-800">Collect: ₹{ord.totalAmount} ({ord.paymentMethod})</span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900 text-sm">
                        Customer: {ord.customerName}
                      </p>
                      <p className="text-slate-600">
                        Address: {ord.shippingAddress.street}, {ord.shippingAddress.locality}
                      </p>
                      {ord.shippingAddress.landmark && (
                        <p className="text-slate-500 text-[11px]">Landmark: {ord.shippingAddress.landmark}</p>
                      )}
                    </div>

                    {/* Navigation and Call */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call: {ord.customerPhone}</span>
                        </a>

                        {ord.shippingAddress.gpsCoords?.mapsUrl ? (
                          <a
                            href={ord.shippingAddress.gpsCoords.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Navigate Google Maps</span>
                          </a>
                        ) : (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${ord.shippingAddress.locality}, Baheri, Bihar`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Maps (Locality)</span>
                          </a>
                        )}
                      </div>

                      {/* Delivery Status buttons */}
                      <div className="flex items-center gap-2">
                        {ord.status !== 'Delivered' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'Delivered', 'Delivered to customer doorstep')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Mark Delivered ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
