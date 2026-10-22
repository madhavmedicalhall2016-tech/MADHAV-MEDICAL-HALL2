import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Flame,
  Globe,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Code2,
} from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'apk' | 'hosting' | 'checklist'>('firebase');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Publishing, Firebase & Android APK Guide
              </h3>
              <p className="text-xs text-emerald-200">MADHAV MEDICAL HALL • Production Deployment Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'firebase'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Firebase Backend</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Android APK Packaging</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hosting'
                ? 'border-blue-600 text-blue-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Free Hosting (Vercel/Netlify)</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pre-Launch Checklist</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50/50">
          {/* TAB 1: FIREBASE */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Firebase Architecture Configuration</span>
                </h4>
                <p className="text-amber-900">
                  The application is architected with a decoupled persistent store. Currently, local and persistent browser storage (IndexedDB / LocalStorage) handles customer sessions, cart, live orders, and prescriptions seamlessly. To connect directly to your live Google Firebase project, follow these steps:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Step 1: Create Firebase Project</h5>
                  <p>1. Open <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></p>
                  <p>2. Click <strong>Add Project</strong> & name it <code>madhav-medical-hall</code></p>
                  <p>3. Enable <strong>Google Analytics</strong> (optional) and create project.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Step 2: Enable Firebase Authentication</h5>
                  <p>1. Go to <strong>Build &gt; Authentication &gt; Sign-in method</strong></p>
                  <p>2. Enable <strong>Email/Password</strong> provider</p>
                  <p>3. Enable <strong>Google Sign-in</strong> (with support email <code>madhavmedicalhall2016@gmail.com</code>)</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Step 3: Create Cloud Firestore & Security Rules</h5>
                  <p>1. Go to <strong>Build &gt; Firestore Database</strong> &gt; Create Database</p>
                  <p>2. Select Location: <code>asia-south1 (Mumbai)</code> for lowest latency in Bihar</p>
                  <p>3. Copy the production-hardened rules from <code>firestore.rules</code> file in this codebase into the Firebase Rules tab.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Step 4: Firebase Storage for Doctor Prescriptions</h5>
                  <p>1. Go to <strong>Build &gt; Storage</strong> &gt; Get Started</p>
                  <p>2. Security Rule: Allow read/write for verified prescription slips under <code>prescriptions/&#123;userId&#125;/&#123;allPaths=**&#125;</code></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Packaging Madhav Medical Hall into an Android APK / AAB</span>
                </h4>
                <p className="text-emerald-900">
                  Because Madhav Medical Hall has a complete PWA Manifest (<code>/manifest.json</code>), service worker (<code>/sw.js</code>), and 192px/512px responsive icons, you can generate a native installable Android APK within 2 minutes:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Method 1: Instant PWABuilder (No coding required)</h5>
                  <p>1. Deploy the web app URL (e.g. on Vercel or Firebase Hosting).</p>
                  <p>2. Open <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-3 h-3" /></a></p>
                  <p>3. Enter your deployed URL and click <strong>Start</strong></p>
                  <p>4. Click <strong>Package For Stores &gt; Android</strong> &gt; Download APK or Google Play Store AAB bundle.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900">Method 2: Google Bubblewrap CLI (Official Trusted Web Activity)</h5>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'npm install -g @bubblewrap/cli\nbubblewrap init --manifest=https://your-domain.com/manifest.json\nbubblewrap build',
                          'bubblewrap'
                        )
                      }
                      className="text-xs text-emerald-700 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                    >
                      {copiedSection === 'bubblewrap' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Commands</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://your-domain.com/manifest.json
bubblewrap build`}
                  </pre>
                  <p className="text-slate-500 text-[11px]">This creates a signed release APK and Android App Bundle (.aab) ready for the Google Play Console.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Method 3: Direct In-Browser Installation (Instant for Customers)</h5>
                  <p>Android users opening Chrome can simply tap the <strong>"Install App"</strong> button in the header or choose <em>"Add to Home screen"</em> in Chrome menu. The app installs directly onto the Android home screen with the Madhav Medical logo and full offline launch capability.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FREE HOSTING */}
          {activeTab === 'hosting' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Free-Tier Production Hosting</span>
                </h4>
                <p className="text-blue-900">
                  The application is built with standard Vite and React 19, making it fully compatible with top 100% free-tier static & serverless providers:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">1. Vercel (Recommended)</h5>
                  <p className="text-slate-600">Free custom domain, automatic SSL certificate, global CDN edge caching in Mumbai.</p>
                  <pre className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[10px]">
npm run build
npx vercel deploy --prod
                  </pre>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900">2. Firebase Hosting</h5>
                  <p className="text-slate-600">Integrates with Firebase Auth and Firestore rules natively.</p>
                  <pre className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[10px]">
firebase init hosting
firebase deploy --only hosting
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Pre-Launch Verification Checklist
              </h4>

              <div className="space-y-2">
                {[
                  { title: 'Store Details', desc: 'Madhav Medical Hall, Chanmana, Baheri, Darbhanga, Bihar. Helpline: 9122260360 verified.' },
                  { title: 'Bilingual Support', desc: 'Instant Hindi (हिन्दी) & English toggle active across all pages and buttons.' },
                  { title: 'Prescription Verification', desc: 'Legal disclaimer and Schedule H/H1 warning displayed before dispensing.' },
                  { title: 'Cart & Stock Engine', desc: 'Inventory stock count validation and coupon system (WELCOME50, HEALTH10).' },
                  { title: 'GPS Location Sharing', desc: 'Google Maps coordinates capture with explicit customer consent.' },
                  { title: 'PWA Manifest & Service Worker', desc: 'Installable on Android and iOS devices with offline caching.' },
                  { title: 'Payment Gateway', desc: 'Prepared for Razorpay / UPI QR with secure server verification and zero PIN storage.' },
                  { title: 'Pharmacist & Delivery Roles', desc: 'Separate portals for pharmacist prescription review and delivery boy route navigation.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Support: madhavmedicalhall2016@gmail.com
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
