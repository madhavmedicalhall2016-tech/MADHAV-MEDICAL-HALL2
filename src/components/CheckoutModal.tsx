import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Store,
  AlertCircle,
  Camera,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAddress, PrescriptionData } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenAuth,
}) => {
  const { items, finalTotal, subtotalStorePrice, deliveryCharge, couponDiscount, appliedCoupon, clearCart } = useCart();
  const { currentUser, addAddress } = useAuth();
  const { createOrder } = useOrders();
  const { language, t } = useLanguage();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');

  // Address fields
  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [locality, setLocality] = useState(defaultAddr?.locality || 'Chanmana, Baheri');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');
  const [pinCode, setPinCode] = useState(defaultAddr?.pinCode || '847105');

  // GPS Location state
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [gpsData, setGpsData] = useState<{ latitude: number; longitude: number; mapsUrl: string } | null>(
    defaultAddr?.gpsCoords?.latitude && defaultAddr?.gpsCoords?.longitude
      ? {
          latitude: defaultAddr.gpsCoords.latitude,
          longitude: defaultAddr.gpsCoords.longitude,
          mapsUrl: defaultAddr.gpsCoords.mapsUrl || `https://www.google.com/maps?q=${defaultAddr.gpsCoords.latitude},${defaultAddr.gpsCoords.longitude}`
        }
      : null
  );

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_UPI' | 'STORE_PICKUP'>('COD');

  // Prescription attachment
  const hasRxItem = items.some((i) => i.medicine.requiresPrescription);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setGpsData({ latitude, longitude, mapsUrl });
        setIsGettingGPS(false);
      },
      (error) => {
        setIsGettingGPS(false);
        console.warn('GPS location error:', error.message);
        // Fallback or user denied
        alert('Could not retrieve GPS location. Please ensure location permission is allowed.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter recipient full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (paymentMethod !== 'STORE_PICKUP') {
      if (!street.trim() || !locality.trim() || !pinCode.trim()) {
        setErrorMessage('Please complete the delivery address.');
        return;
      }
    }

    if (hasRxItem && !prescriptionImage) {
      setErrorMessage('Your cart contains prescription medicines. Please upload a doctor slip or select OTC medicines.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress: UserAddress = {
        id: 'addr-' + Date.now(),
        name: customerName.trim(),
        phone: cleanPhone,
        street: street.trim(),
        locality: locality.trim(),
        landmark: landmark.trim(),
        pinCode: pinCode.trim(),
        gpsCoords: gpsData || undefined,
        isDefault: true,
      };

      // Save address to user profile if logged in
      if (currentUser) {
        addAddress(shippingAddress).catch(console.error);
      }

      let prescriptionData: PrescriptionData | undefined = undefined;
      if (prescriptionImage) {
        prescriptionData = {
          id: 'rx-' + Date.now(),
          imageUrl: prescriptionImage,
          uploadedAt: new Date().toISOString(),
          patientName: patientName.trim() || customerName.trim(),
          doctorName: doctorName.trim(),
          notes: prescriptionNotes.trim(),
          status: 'Pending Verification',
        };
      }

      const orderItems = items.map((i) => ({
        medicineId: i.medicine.id,
        name: i.medicine.name,
        brand: i.medicine.brand,
        price: i.medicine.price,
        quantity: i.quantity,
        packSize: i.medicine.packSize,
        requiresPrescription: i.medicine.requiresPrescription,
      }));

      const res = await createOrder({
        customerId: currentUser?.uid || 'guest-' + cleanPhone,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || `${cleanPhone}@customer.madhav.com`,
        items: orderItems,
        subtotal: subtotalStorePrice,
        discount: couponDiscount,
        couponCode: appliedCoupon?.code,
        deliveryCharge: paymentMethod === 'STORE_PICKUP' ? 0 : deliveryCharge,
        totalAmount: paymentMethod === 'STORE_PICKUP' ? Math.max(0, finalTotal - deliveryCharge) : finalTotal,
        shippingAddress,
        paymentMethod,
        prescription: prescriptionData,
      });

      if (!res.success || !res.orderId) {
        setErrorMessage(res.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderSuccess(res.orderId);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Unexpected error during checkout. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {language === 'hi' ? 'दवा ऑर्डर चेकआउट' : 'Secure Medicine Checkout'}
              </h3>
              <p className="text-xs text-emerald-800 font-semibold">MADHAV MEDICAL HALL • CHANMANA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Customer Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>1. {language === 'hi' ? 'ग्राहक का विवरण' : 'Customer Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sunil Paswan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('mobileNumber')} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9122260360"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. {language === 'hi' ? 'डिलीवरी का पता' : 'Delivery Address'}</span>
              </h4>

              {/* Share GPS Location Button */}
              <button
                type="button"
                onClick={handleCaptureGPS}
                disabled={isGettingGPS}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
              >
                {isGettingGPS ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>
                  {gpsData
                    ? t('gpsLocationCaptured')
                    : isGettingGPS
                    ? 'Detecting...'
                    : t('shareGPSLocation')}
                </span>
              </button>
            </div>

            {gpsData && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    GPS Lat: {gpsData.latitude.toFixed(4)}, Lng: {gpsData.longitude.toFixed(4)}
                  </span>
                </span>
                <a
                  href={gpsData.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>View Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('locality')} *
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Chanmana, Baheri, Darbhanga"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('streetAddress')} *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ward No., Street or House name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('landmark')}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near High School / Shiv Mandir"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('pincode')} *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="847105"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 3. Prescription Upload (Required if Rx medicine in cart) */}
          {hasRxItem && (
            <div className="space-y-3 pt-3 border-t border-slate-100 bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>3. {language === 'hi' ? 'डॉक्टर का पर्चा (Rx आवश्यक)' : 'Prescription Required (Rx)'}</span>
                </h4>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Mandatory
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                {t('rxDisclaimer')}
              </p>

              {prescriptionImage ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-rose-200">
                  <img
                    src={prescriptionImage}
                    alt="Prescription preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {patientName || customerName} - Prescription
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Ready for pharmacist verification</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrescriptionImage(null)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-rose-300 rounded-xl bg-white hover:bg-rose-50 transition cursor-pointer text-center">
                    <Camera className="w-5 h-5 text-rose-600 mb-1" />
                    <span className="text-xs font-bold text-rose-900">
                      {language === 'hi' ? 'कैमरा से फोटो लें' : 'Take Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePrescriptionFileChange}
                      className="hidden"
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-rose-300 rounded-xl bg-white hover:bg-rose-50 transition cursor-pointer text-center">
                    <Upload className="w-5 h-5 text-rose-600 mb-1" />
                    <span className="text-xs font-bold text-rose-900">
                      {language === 'hi' ? 'गैलरी से अपलोड करें' : 'Upload File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* 4. Payment Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              4. {t('paymentMethod')}
            </h4>

            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">{t('cashOnDelivery')}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Cash / Doorstep UPI QR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('cashOnDeliveryDesc')}</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('STORE_PICKUP')}
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'STORE_PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'STORE_PICKUP'}
                  onChange={() => setPaymentMethod('STORE_PICKUP')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">{t('storePickup')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('storePickupDesc')}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Security Disclaimer */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'hi'
                ? 'माधव मेडिकल कभी भी आपका कार्ड पिन या UPI पिन नहीं मांगता या स्टोर करता है।'
                : 'Madhav Medical Hall never asks for or stores UPI PINs, Card PINs or CVVs.'}
            </span>
          </div>

          {/* 5. Total & Place Order Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('grandTotal')}</p>
              <span className="text-2xl font-black text-emerald-900">
                ₹{paymentMethod === 'STORE_PICKUP' ? Math.max(0, finalTotal - deliveryCharge) : finalTotal}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('placeOrder')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
