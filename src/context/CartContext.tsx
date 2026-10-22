import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Medicine, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/medicines';

interface CartContextType {
  items: CartItem[];
  addToCart: (medicine: Medicine, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  totalItemsCount: number;
  subtotalMRP: number;
  subtotalStorePrice: number;
  storeDiscountAmount: number;
  deliveryCharge: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  finalTotal: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mmh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('mmh_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mmh_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('mmh_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('mmh_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (medicine: Medicine, quantity = 1): { success: boolean; message?: string } => {
    if (!medicine.inStock || medicine.stockCount <= 0) {
      return { success: false, message: `${medicine.name} is currently out of stock.` };
    }

    let result = { success: true, message: 'Added to cart' };

    setItems((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > medicine.stockCount) {
          result = {
            success: false,
            message: `Only ${medicine.stockCount} units available in stock.`
          };
          return prev;
        }
        return prev.map((item) =>
          item.medicine.id === medicine.id ? { ...item, quantity: nextQty } : item
        );
      } else {
        if (quantity > medicine.stockCount) {
          result = {
            success: false,
            message: `Only ${medicine.stockCount} units available in stock.`
          };
          return prev;
        }
        return [...prev, { medicine, quantity }];
      }
    });

    return result;
  };

  const removeFromCart = (medicineId: string) => {
    setItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return { success: true };
    }

    let result: { success: boolean; message?: string } = { success: true };
    setItems((prev) =>
      prev.map((item) => {
        if (item.medicine.id === medicineId) {
          if (quantity > item.medicine.stockCount) {
            result = {
              success: false,
              message: `Maximum available stock is ${item.medicine.stockCount} units.`
            };
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
    return result;
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotalMRP = items.reduce(
    (acc, item) => acc + item.medicine.mrp * item.quantity,
    0
  );

  const subtotalStorePrice = items.reduce(
    (acc, item) => acc + item.medicine.price * item.quantity,
    0
  );

  const storeDiscountAmount = Math.max(0, subtotalMRP - subtotalStorePrice);

  // Delivery charge: FREE if store price is >= ₹399, or if cart is empty = 0, otherwise ₹30
  const deliveryCharge = items.length === 0 ? 0 : subtotalStorePrice >= 399 ? 0 : 30;

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotalStorePrice >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountFlat) {
      couponDiscount = appliedCoupon.discountFlat;
    } else if (appliedCoupon.discountPercent) {
      couponDiscount = Math.round((subtotalStorePrice * appliedCoupon.discountPercent) / 100);
    }
  }

  const finalTotal = Math.max(0, subtotalStorePrice - couponDiscount + deliveryCharge);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try WELCOME50 or HEALTH10' };
    }

    if (subtotalStorePrice < found.minOrder) {
      return {
        success: false,
        message: `This coupon requires a minimum cart value of ₹${found.minOrder}.`
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon ${found.code} applied successfully! You saved extra.`
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotalMRP,
        subtotalStorePrice,
        storeDiscountAmount,
        deliveryCharge,
        appliedCoupon,
        couponDiscount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
