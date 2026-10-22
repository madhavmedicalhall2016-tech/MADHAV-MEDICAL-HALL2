import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { AVAILABLE_COUPONS } from '../data/medicines';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onUploadPrescription: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onUploadPrescription,
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotalMRP,
    subtotalStorePrice,
    storeDiscountAmount,
    deliveryCharge,
    appliedCoupon,
    couponDiscount,
    finalTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { language, t } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  if (!isCartOpen) return null;

  const hasRxItem = items.some((i) => i.medicine.requiresPrescription);

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => setCouponFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{t('cart')}</h3>
                <p className="text-xs text-slate-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 transition p-1"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">{t('cartEmpty')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('cartEmptySubtitle')}</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {t('startShopping')}
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Goal Progress */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-xs">
                  <div className="flex items-center justify-between text-emerald-900 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>
                        {subtotalStorePrice >= 399
                          ? language === 'hi'
                            ? 'मुफ्त डिलीवरी के पात्र हैं! (Free Delivery)'
                            : 'You qualify for Free Delivery!'
                          : language === 'hi'
                          ? `₹${399 - subtotalStorePrice} और जोड़ें और मुफ्त डिलीवरी पाएं`
                          : `Add ₹${399 - subtotalStorePrice} more for Free Delivery`}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800">₹399 Min</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotalStorePrice / 399) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Prescription Warning if needed */}
                {hasRxItem && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {language === 'hi' ? 'डॉक्टर का पर्चा आवश्यक:' : 'Prescription Required:'}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {language === 'hi'
                          ? 'आपके कार्ट में डॉक्टर पर्ची वाली दवाइयां हैं। चेकआउट के समय पर्चा अपलोड करें।'
                          : 'Some items require a doctor prescription. You can attach it during checkout.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-2.5">
                  {items.map(({ medicine, quantity }) => (
                    <div
                      key={medicine.id}
                      className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-xs truncate">
                            {language === 'hi' ? medicine.nameHi : medicine.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {medicine.brand} • {language === 'hi' ? medicine.packSizeHi : medicine.packSize}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-slate-900">₹{medicine.price}</span>
                            {medicine.mrp > medicine.price && (
                              <span className="text-[10px] text-slate-400 line-through">₹{medicine.mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden shrink-0">
                        <button
                          onClick={() => updateQuantity(medicine.id, quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 min-w-[18px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(medicine.id, quantity + 1)}
                          disabled={quantity >= medicine.stockCount}
                          className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">{t('couponCode')}</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                        <p className="text-[10px] text-emerald-600">
                          {language === 'hi' ? appliedCoupon.descriptionHi : appliedCoupon.description}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="WELCOME50 / HEALTH10"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs uppercase font-mono tracking-wider focus:outline-emerald-600"
                        />
                        <button
                          onClick={() => handleApplyCoupon(couponInput)}
                          disabled={!couponInput.trim()}
                          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition cursor-pointer"
                        >
                          {t('apply')}
                        </button>
                      </div>

                      {/* Coupon Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {AVAILABLE_COUPONS.map((cpn) => (
                          <button
                            key={cpn.code}
                            onClick={() => handleApplyCoupon(cpn.code)}
                            className="text-[10px] font-mono font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-2 py-1 rounded-lg transition cursor-pointer"
                          >
                            + {cpn.code}
                          </button>
                        ))}
                      </div>

                      {couponFeedback && (
                        <p
                          className={`text-[11px] font-semibold ${
                            couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {couponFeedback.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Summary Breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('subtotal')}</span>
                    <span>₹{subtotalMRP}</span>
                  </div>

                  {storeDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>{t('storeDiscount')}</span>
                      <span>- ₹{storeDiscountAmount}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>{t('deliveryFee')}</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold">{t('freeDelivery')}</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-extrabold text-sm sm:text-base pt-2 border-t border-slate-200">
                    <span>{t('grandTotal')}</span>
                    <span className="text-emerald-800">₹{finalTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg hover:shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
              >
                <span>{t('checkout')}</span>
                <span>• ₹{finalTotal}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
