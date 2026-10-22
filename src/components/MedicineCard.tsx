import React from 'react';
import { Plus, Minus, ShoppingCart, AlertCircle, FileText, Check } from 'lucide-react';
import { Medicine } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface MedicineCardProps {
  medicine: Medicine;
  onSelect: (med: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onSelect }) => {
  const { language, t } = useLanguage();
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.medicine.id === medicine.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(medicine, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(medicine.id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(medicine.id, quantityInCart - 1);
  };

  return (
    <div
      onClick={() => onSelect(medicine)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 p-3.5 sm:p-4 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {medicine.requiresPrescription ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200"
              title="Doctor prescription needed before dispensing"
            >
              <FileText className="w-2.5 h-2.5" />
              <span>Rx</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              OTC
            </span>
          )}

          {medicine.discountPercent > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
              {medicine.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div>
          {!medicine.inStock || medicine.stockCount <= 0 ? (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {t('outOfStock')}
            </span>
          ) : medicine.stockCount <= 5 ? (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 animate-pulse">
              {t('onlyLeft', { count: medicine.stockCount })}
            </span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t('inStock')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Image & Dosage info */}
      <div className="relative mb-3 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-3 aspect-4/3 group-hover:bg-emerald-50/30 transition-colors">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-slate-500 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-xs">
          {language === 'hi' ? medicine.packSizeHi : medicine.packSize}
        </span>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 truncate">
            {medicine.brand}
          </p>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {language === 'hi' ? medicine.nameHi : medicine.name}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium" title={medicine.salt}>
            {medicine.salt}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ₹{medicine.price}
              </span>
              {medicine.mrp > medicine.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{medicine.mrp}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {language === 'hi' ? 'दुकान मूल्य' : 'Store Price'}
            </p>
          </div>

          {/* Add to Cart or Quantity Controls */}
          <div>
            {quantityInCart > 0 ? (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="p-1.5 sm:p-2 hover:bg-emerald-800 transition active:scale-90 cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold min-w-[20px] text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantityInCart >= medicine.stockCount}
                  className="p-1.5 sm:p-2 hover:bg-emerald-800 disabled:opacity-40 transition active:scale-90 cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!medicine.inStock || medicine.stockCount <= 0}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
