import React from 'react';
import { CheckCircle2, MessageCircle, Phone, Printer, Package, X, ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';

interface OrderSuccessModalProps {
  orderId: string | null;
  onClose: () => void;
  onTrackOrder: (id: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderId,
  onClose,
  onTrackOrder,
}) => {
  const { language, t } = useLanguage();
  const { getOrderById } = useOrders();

  if (!orderId) return null;

  const order = getOrderById(orderId);

  const whatsappMessage = encodeURIComponent(
    `Namaste Madhav Medical Hall, I have placed order ${orderId} for ₹${order?.totalAmount || ''} in ${
      order?.shippingAddress?.locality || 'Chanmana/Baheri'
    }. Please confirm and dispatch.`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 relative text-center animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          {t('orderSuccessTitle')}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{t('orderConfirmationNote')}</p>

        {/* Order ID Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 my-4">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            {t('orderIdText')}
          </p>
          <p className="text-xl font-mono font-extrabold text-emerald-950 mt-0.5 tracking-wider">
            {orderId}
          </p>
          {order && (
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Amount: ₹{order.totalAmount} • {order.paymentMethod}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(orderId);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>{t('trackOrder')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <a
            href={`https://wa.me/919122260360?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'व्हाट्सएप पर ऑर्डर भेजें' : 'Send Order to Store WhatsApp'}
            </span>
          </a>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Receipt</span>
            </button>

            <a
              href="tel:9122260360"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Store</span>
            </a>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-4">
          CHANMANA, BAHERI, DARBHANGA, BIHAR • MADHAV MEDICAL HALL
        </p>
      </div>
    </div>
  );
};
