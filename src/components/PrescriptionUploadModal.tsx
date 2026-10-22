import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  onOpenAuth: () => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
}) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { uploadDirectPrescription } = useOrders();

  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientAge, setPatientAge] = useState('');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionImage(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!prescriptionImage) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया डॉक्टर का पर्चा (फोटो या फाइल) अपलोड करें।'
          : 'Please capture or upload your doctor prescription slip.'
      );
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage('Please enter patient name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for pharmacist callback.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await uploadDirectPrescription(
        {
          imageUrl: prescriptionImage,
          patientName: patientName.trim(),
          patientAge: patientAge.trim(),
          doctorName: doctorName.trim(),
          notes: notes.trim(),
        },
        {
          id: currentUser?.uid || 'guest-' + cleanPhone,
          name: patientName.trim(),
          phone: cleanPhone,
          email: currentUser?.email || `${cleanPhone}@guest.madhav.com`,
          address: currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0],
        }
      );

      setIsSubmitting(false);
      if (res.success && res.orderId) {
        onClose();
        onSuccess(res.orderId);
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Failed to send prescription. Please try again or WhatsApp to 9122260360.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {language === 'hi' ? 'डॉक्टर का पर्चा भेजें' : 'Upload Doctor Prescription (Rx)'}
              </h3>
              <p className="text-xs text-emerald-200">MADHAV MEDICAL HALL • CHANMANA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Legal Compliance Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'hi' ? 'फार्मेसी नियम एवं वैधानिक सूचना:' : 'Legal Pharmacy Policy:'}
              </p>
              <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'भारतीय औषधि एवं प्रसाधन अधिनियम के अनुसार डॉक्टर के वैध पर्चे के बिना कोई भी शेड्यूल एच/एच1 दवा नहीं दी जाएगी। पर्चा जांचने के बाद हमारे फार्मासिस्ट आपको 9122260360 से कॉल करेंगे।'
                  : 'Under Indian Drugs and Cosmetics Rules, Schedule H/H1 medicines are dispensed only after physical/digital review by our licensed pharmacist. No medicines are automatically dispensed.'}
              </p>
            </div>
          </div>

          {/* Prescription Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {language === 'hi' ? 'पर्चे की फोटो (Prescription Image) *' : 'Prescription Image *'}
            </label>

            {prescriptionImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group">
                <img
                  src={prescriptionImage}
                  alt="Uploaded prescription"
                  className="w-full max-h-60 object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={() => setPrescriptionImage(null)}
                  className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-xl shadow-lg hover:bg-rose-700 transition cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer text-center group">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    {language === 'hi' ? 'कैमरा से फोटो लें' : 'Take Camera Photo'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Mobile Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition cursor-pointer text-center group">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {language === 'hi' ? 'गैलरी से चुनें' : 'Upload from Gallery'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'मरीज का नाम' : 'Patient Name'} *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Paswan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'मरीज की उम्र (Age)' : 'Patient Age'}
              </label>
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g. 45 Years"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर (कॉल हेतु)' : 'Mobile Phone (for callback)'} *
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'hi' ? 'डॉक्टर या अस्पताल का नाम' : 'Doctor / Hospital Name'}
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. A. K. Jha"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'hi'
                ? 'कोई विशेष निर्देश या दवा की खुराक (वैकल्पिक)'
                : 'Special instructions or specific days needed'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 15 days dose needed, morning and night only..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-emerald-600"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <a
              href="tel:9122260360"
              className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Pharmacist</span>
            </a>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Prescription...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'hi' ? 'पर्चा भेजें (रिव्यू हेतु)' : 'Submit for Review'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
