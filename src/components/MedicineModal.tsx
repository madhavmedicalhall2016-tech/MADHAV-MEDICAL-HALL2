import React from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Medicine } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface MedicineModalProps {
  medicine: Medicine | null;
  onClose: () => void;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({ medicine, onClose }) => {
  const { language, t } = useLanguage();
  const { addToCart, items } = useCart();

  if (!medicine) return null;

  const cartItem = items.find((i) => i.medicine.id === medicine.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Image */}
        <div className="bg-gradient-to-b from-emerald-50 to-white p-6 pb-2 text-center relative border-b border-slate-100">
          <div className="flex items-center justify-center h-48 max-w-xs mx-auto">
            <img
              src={medicine.image}
              alt={medicine.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {medicine.requiresPrescription ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                <FileText className="w-3.5 h-3.5" />
                <span>Prescription Required (शेड्यूल एच/एच1)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Over The Counter (OTC)</span>
              </span>
            )}

            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {language === 'hi' ? medicine.dosageFormHi : medicine.dosageForm}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {medicine.brand}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {language === 'hi' ? medicine.nameHi : medicine.name}
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {language === 'hi' ? 'दवा का साल्ट / रासायनिक संघटन:' : 'Salt Composition:'}{' '}
              <span className="text-emerald-800">{medicine.salt}</span>
            </p>
          </div>

          {/* Price Block */}
          <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'दुकान का रियायती मूल्य' : 'Store Discounted Price'}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">₹{medicine.price}</span>
                {medicine.mrp > medicine.price && (
                  <span className="text-sm text-slate-400 line-through">MRP ₹{medicine.mrp}</span>
                )}
                {medicine.discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {medicine.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">
                {language === 'hi' ? medicine.packSizeHi : medicine.packSize}
              </span>
              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                {medicine.inStock ? t('inStock') : t('outOfStock')}
              </p>
            </div>
          </div>

          {/* Uses & Indication */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800">
              {language === 'hi' ? 'उपयोग एवं लाभ (Uses):' : 'Therapeutic Uses:'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              {language === 'hi' ? medicine.usesHi : medicine.uses}
            </p>
          </div>

          {/* Precautions / Side effects if any */}
          {medicine.sideEffectsWarning && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {language === 'hi' ? 'महत्वपूर्ण चेतावनी व निर्देश:' : 'Important Warning:'}
                </p>
                <p className="mt-0.5 text-amber-800">
                  {language === 'hi' ? medicine.sideEffectsWarningHi : medicine.sideEffectsWarning}
                </p>
              </div>
            </div>
          )}

          {/* Pharmacy Verification Promise */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'hi'
                ? '100% असली व प्रमाणित दवाइयां। माधव मेडिकल हॉल, चनमना (दरभंगा)'
                : '100% Genuine batch verified medicines from Madhav Medical Hall, Chanmana.'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500">
              {inCartQty > 0
                ? `${inCartQty} ${language === 'hi' ? 'कार्ट में जोड़ा गया' : 'in cart'}`
                : language === 'hi'
                ? 'मात्रा: 1 पैक'
                : 'Quantity: 1 unit'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToCart(medicine, 1);
              }}
              disabled={!medicine.inStock || medicine.stockCount <= 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-sm font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {inCartQty > 0
                  ? language === 'hi'
                    ? 'और जोड़ें (+1)'
                    : 'Add More (+1)'
                  : language === 'hi'
                  ? 'कार्ट में जोड़ें'
                  : 'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
