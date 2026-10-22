import React, { useState } from 'react';
import {
  X,
  User,
  KeyRound,
  MapPin,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Navigation,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAddress } from '../types';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
}) => {
  const { currentUser, updateProfile, changePassword, addAddress, deleteAddress, setDefaultAddress, deleteAccount, logout } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'addresses' | 'terms'>('profile');

  // Profile fields
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ success: boolean; text: string } | null>(null);

  // New Address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLocality, setAddrLocality] = useState('Chanmana, Baheri');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrPin, setAddrPin] = useState('847105');
  const [addrPhone, setAddrPhone] = useState(currentUser?.phone || '');

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = await updateProfile({ name: name.trim(), phone: phone.trim() });
    if (res.success) {
      setProfileMsg({ success: true, text: 'Profile details updated successfully.' });
    } else {
      setProfileMsg({ success: false, text: res.error || 'Failed to update.' });
    }
    setTimeout(() => setProfileMsg(null), 3500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass !== confirmPass) {
      setPassMsg({ success: false, text: 'New passwords do not match.' });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ success: false, text: 'Password must be at least 6 characters.' });
      return;
    }

    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      setPassMsg({ success: true, text: 'Password changed successfully.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMsg({ success: false, text: res.error || 'Failed to change password.' });
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrLocality.trim() || !addrPin.trim()) return;

    await addAddress({
      name: currentUser.name,
      phone: addrPhone.trim() || currentUser.phone,
      street: addrStreet.trim(),
      locality: addrLocality.trim(),
      landmark: addrLandmark.trim(),
      pinCode: addrPin.trim(),
    });

    setShowAddAddress(false);
    setAddrStreet('');
    setAddrLandmark('');
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Password & Security
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy & Terms
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileMsg.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Change Password */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Change Password</span>
                </h4>

                {passMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passMsg.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Danger Zone: Account Deletion */}
              <div className="pt-5 border-t border-slate-200">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                  Account Management
                </h4>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                  >
                    Request Account Deletion
                  </button>
                ) : (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-rose-900">
                      Are you sure you want to delete your account?
                    </p>
                    <p className="text-[11px] text-rose-800">
                      All your saved addresses and profile data will be permanently erased.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Yes, Permanently Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Saved Delivery Locations
                </h4>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add address form */}
              {showAddAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl space-y-3"
                >
                  <h5 className="text-xs font-bold text-emerald-900">New Address Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Village / Locality (e.g. Chanmana)"
                      value={addrLocality}
                      onChange={(e) => setAddrLocality(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="House / Ward / Street"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code (847105)"
                      value={addrPin}
                      onChange={(e) => setAddrPin(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards */}
              <div className="space-y-2.5">
                {currentUser.addresses.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No saved addresses yet.
                  </p>
                ) : (
                  currentUser.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{addr.locality}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">{addr.street}</p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                        )}
                        <p className="text-slate-500 font-mono">
                          PIN: {addr.pinCode} • Ph: {addr.phone}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Privacy Policy & Terms of Service */}
          {activeTab === 'terms' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Privacy Policy (गोपनीयता नीति)</span>
                </h4>
                <p>
                  Madhav Medical Hall adheres to strict data privacy and HIPAA/Indian Digital Health standards. Customer medical records, prescriptions, and phone numbers are solely utilized for dispensing medications and delivery operations in Chanmana, Baheri, Darbhanga. We never sell or share private medical data with third parties.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Pharmacy Terms of Service & Drug Dispensing</span>
                </h4>
                <p>
                  1. <strong>Schedule H / H1 / X Drugs</strong>: Will strictly not be dispensed without a valid registered doctor prescription reviewed and authenticated by our licensed pharmacist.<br />
                  2. <strong>Cancellation Policy</strong>: Orders may be cancelled by the customer at zero charge prior to dispatch from our Chanmana store.<br />
                  3. <strong>Returns & Expiry</strong>: Unopened medicines with intact manufacturer foil seals can be returned within 48 hours with original bill.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            View Order History
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
