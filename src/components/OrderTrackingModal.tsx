import React, { useState } from 'react';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Ban,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrderId?: string | null;
}

const STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Under Review',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  selectedOrderId,
}) => {
  const { language, t } = useLanguage();
  const { orders, cancelOrder } = useOrders();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Filter orders for the user
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.uid ||
          o.customerPhone === currentUser.phone ||
          o.customerEmail === currentUser.email
      )
    : orders; // If guest, show recent orders

  // When selectedOrderId is passed, set selectedOrder
  React.useEffect(() => {
    if (selectedOrderId) {
      const found = orders.find((o) => o.id === selectedOrderId);
      if (found) setSelectedOrder(found);
    } else if (userOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(userOrders[0]);
    }
  }, [selectedOrderId, orders]);

  if (!isOpen) return null;

  const filteredOrders = userOrders.filter((o) => {
    if (activeTab === 'active') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (activeTab === 'delivered') return o.status === 'Delivered';
    return true;
  });

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);
    await cancelOrder(selectedOrder.id, cancelReason);
    setIsCancelling(false);
    setShowCancelPrompt(false);
    // Refresh selectedOrder
    const updated = orders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  };

  const getStepStatus = (step: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'Cancelled') return 'cancelled';
    const stepIdx = STATUS_STEPS.indexOf(step);
    const currIdx = STATUS_STEPS.indexOf(currentStatus);
    if (currIdx === -1) return 'pending';
    if (stepIdx < currIdx) return 'completed';
    if (stepIdx === currIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Orders List */}
        <div className="w-full md:w-5/12 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              <span>{t('orders')}</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl mt-3 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded-lg transition ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({userOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-1 rounded-lg transition ${
                  activeTab === 'active' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('delivered')}
                className={`flex-1 py-1 rounded-lg transition ${
                  activeTab === 'delivered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>

          {/* Orders Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No orders in this category.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-white border-emerald-600 ring-1 ring-emerald-500 shadow-sm'
                        : 'bg-white/80 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                      <span className="font-mono text-emerald-800">{ord.id}</span>
                      <span>₹{ord.totalAmount}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-1.5 truncate">
                      {ord.items.length > 0
                        ? ord.items.map((i) => i.name).join(', ')
                        : 'Doctor Prescription Order'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Order Live Timeline & Details */}
        <div className="w-full md:w-7/12 flex-1 flex flex-col justify-between overflow-y-auto p-5 sm:p-6 bg-white">
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Top Order Details */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('orderIdText')}
                    </span>
                    <h4 className="text-lg font-mono font-extrabold text-slate-900">
                      {selectedOrder.id}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        selectedOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrder.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {selectedOrder.assignedDeliveryAgent && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-bold">Delivery Agent: {selectedOrder.assignedDeliveryAgent.name}</p>
                        <p className="text-[10px] text-emerald-700">Phone: {selectedOrder.assignedDeliveryAgent.phone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedOrder.assignedDeliveryAgent.phone}`}
                      className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                    >
                      Call Rider
                    </a>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {t('orderTimeline')}
                </h5>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {STATUS_STEPS.map((step) => {
                    const stepState = getStepStatus(step, selectedOrder.status);
                    const historyRecord = selectedOrder.statusHistory.find((h) => h.status === step);

                    return (
                      <div key={step} className="flex items-start gap-3 relative pl-8">
                        <span
                          className={`absolute left-1.5 top-0.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 flex items-center justify-center transition ${
                            stepState === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : stepState === 'current'
                              ? 'bg-amber-500 ring-4 ring-amber-100 text-white animate-pulse'
                              : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-xs font-bold ${
                              stepState === 'completed' || stepState === 'current'
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step}
                          </p>
                          {historyRecord && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(historyRecord.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {historyRecord.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {selectedOrder.status === 'Cancelled' && (
                    <div className="flex items-start gap-3 relative pl-8">
                      <span className="absolute left-1.5 top-0.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 bg-rose-600 text-white" />
                      <div>
                        <p className="text-xs font-bold text-rose-700">Order Cancelled</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {selectedOrder.statusHistory.find((h) => h.status === 'Cancelled')?.note ||
                            'Cancelled as per store policy.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescription preview if attached */}
              {selectedOrder.prescription && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Doctor Prescription Slip (Parcha)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {selectedOrder.prescription.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedOrder.prescription.imageUrl}
                      alt="Prescription"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">
                        Patient: {selectedOrder.prescription.patientName}
                      </p>
                      {selectedOrder.prescription.doctorName && (
                        <p className="text-[11px]">Doctor: {selectedOrder.prescription.doctorName}</p>
                      )}
                      {selectedOrder.prescription.pharmacistNotes && (
                        <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                          Note: {selectedOrder.prescription.pharmacistNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="border-t border-slate-100 pt-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Items ({selectedOrder.items.length})
                </h5>
                <div className="space-y-1.5 text-xs">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <div>
                        <span className="font-semibold text-slate-800">{it.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">x {it.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-emerald-800">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & GPS Link */}
              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 border border-slate-200">
                <p className="font-bold text-slate-800">Delivery Address:</p>
                <p className="text-slate-600">
                  {selectedOrder.shippingAddress.name} ({selectedOrder.shippingAddress.phone})
                </p>
                <p className="text-slate-600">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.locality} - {selectedOrder.shippingAddress.pinCode}
                </p>
                {selectedOrder.shippingAddress.gpsCoords?.mapsUrl && (
                  <a
                    href={selectedOrder.shippingAddress.gpsCoords.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Footer Actions: Help & Cancel */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href="tel:9122260360"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline px-2.5 py-1.5 bg-emerald-50 rounded-xl"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Store (9122260360)</span>
                  </a>
                  <a
                    href={`https://wa.me/919122260360?text=${encodeURIComponent(
                      `Namaste, I want to inquire about my order ${selectedOrder.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-white px-2.5 py-1.5 bg-[#25D366] rounded-xl hover:bg-[#20ba59]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Cancel Order Button */}
                {(selectedOrder.status === 'Order Placed' || selectedOrder.status === 'Under Review') && (
                  <div>
                    {!showCancelPrompt ? (
                      <button
                        onClick={() => setShowCancelPrompt(true)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                      >
                        {t('cancelOrder')}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-rose-700 font-semibold">Confirm cancel?</span>
                        <button
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </button>
                        <button
                          onClick={() => setShowCancelPrompt(false)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-slate-400">
              <p className="text-xs">Select an order on the left to see live status & delivery details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
