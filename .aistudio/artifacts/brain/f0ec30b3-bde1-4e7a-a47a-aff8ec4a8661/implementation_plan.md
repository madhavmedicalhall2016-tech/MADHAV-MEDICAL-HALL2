# Madhav Medical Hall — Backend Integration & Customer Experience Plan

Complete production-grade backend integration, Firebase Authentication and Cloud Firestore schema, standalone delivery rider portal with PIN access, and end-to-end customer medicine ordering for **Madhav Medical Hall** in Chanmana, Baheri, Darbhanga, Bihar.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core decisions were confirmed based on user feedback:
> - **Backend Provisioning**: AI Studio automated Firebase provisioning workflow with production-hardened `firestore.rules` and `firebase-blueprint.json` intermediate representation.
> - **Payment Method**: Pure **Cash and UPI on Delivery (COD)** with doorstep QR scan and physical receipt generation — completely eliminating misleading online gateway claims while securing transactions with zero PIN storage.
> - **Delivery Portal Architecture**: Dedicated **Rider PIN Access Portal** allowing delivery boys in Baheri/Chanmana to enter their secure 4-digit PIN to view only assigned orders, initiate 1-tap customer calls, launch Google Maps GPS directions, and update delivery states.

---

## 1. Overview & Core Concept

**Madhav Medical Hall** (*"आपके स्वास्थ्य का भरोसेमंद साथी"*) is a mobile-first online pharmacy catering to Chanmana, Baheri, and rural Darbhanga, Bihar. 

The application enables customers to:
1. Search and order OTC and prescription medicines in English and Hindi.
2. Upload doctor prescriptions (*Parcha*) via phone camera or gallery for pharmacist verification.
3. Share exact GPS delivery coordinates for accurate rural navigation.
4. Track live delivery milestones (Order Placed → Under Review → Confirmed → Preparing → Out for Delivery → Delivered).
5. Seamlessly manage accounts, addresses, and passwords with Firebase Authentication.
6. Provide pharmacists and delivery riders with role-isolated portals for order fulfillment and stock management.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Customer Registration & Auth Flow**:
   - Customer registers with Name, 10-digit Phone, Email, and Password.
   - Profile automatically stores delivery addresses and medical order history.
   - Forgot Password triggers verified password reset flow with security token validation.
   - Profile allows updating personal details, managing saved locations, changing passwords, and viewing terms.

2. **Medicine Search & Ordering Flow**:
   - Live search by medicine brand, salt, Hindi name, or health concern (fever, pain, gas, cough, BP).
   - Real-time stock availability badge (`In Stock`, `Only X Left`, `Out of Stock`).
   - Cart with free delivery goal tracker (Free above ₹399 in Chanmana & Baheri, else ₹30).
   - Checkout collects recipient name, phone, village/ward, and **GPS location consent** with Google Maps link generation.

3. **Prescription Review Flow**:
   - Customer captures doctor slip using mobile camera or file picker.
   - Prominent statutory warning displayed: *Schedule H/H1 drugs require pharmacist verification before dispensing.*
   - Order marked as `Under Review`. Pharmacist reviews slip, notes dosage, and calls customer on `9122260360` to confirm.

4. **Dedicated Rider PIN Delivery Portal**:
   - Accessible via quick link or rider login.
   - Rider enters their secure 4-digit PIN (e.g. `1234` for Ramesh Kumar, Baheri Zone).
   - Shows only orders assigned to this rider with:
     - Customer Name & Mobile (`tel:` tap-to-call)
     - Village/Ward address & GPS Google Maps navigation link
     - Amount to collect in Cash or doorstep UPI
     - 1-tap button to advance status to `Out for Delivery` and `Delivered`.

### Visual Identity & Theme
- **Dominant Colors**: Deep Emerald Green (`#047857` / `#065f46`), Clean Slate (`#f8fafc`), and Crisp White.
- **Accents**: Amber (`#d97706`) for pharmacist reviews, Soft Rose for Schedule H/H1 Rx notices, Royal Blue for delivery navigation.
- **Typography**: `Plus Jakarta Sans` for clean modern UI paired with `Noto Sans Devanagari` for natural Hindi rendering.
- **Thumb Zone Optimization**: 1-thumb reachability on mobile devices with sticky compact header and bottom navigation bar.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Layer Persistence (Firebase Ready + Local Fallback)**:
  - *Chosen Approach*: The codebase integrates the official Firebase SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`) using configuration from `firebase-applet-config.json` while maintaining a robust, non-blocking fallback to local persistent storage.
  - *Why*: Ensures the application functions immediately without crashing or displaying fake connection errors, while enabling instant live Firestore connectivity once provisioned.
- **Decision 2: Price & Total Server Validation**:
  - *Chosen Approach*: Order totals are computed and verified against canonical catalogue unit prices rather than trusting client-submitted totals.
  - *Why*: Prevents client-side price tampering and guarantees financial integrity.
- **Decision 3: Standalone Rider Portal with PIN**:
  - *Chosen Approach*: Riders access a dedicated delivery screen authenticated by quick PIN, bypassing complex multi-step customer registration.
  - *Why*: Practical for delivery personnel on motorcycles navigating rural roads in Baheri and Chanmana.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MADHAV MEDICAL HALL PWA                         │
│                    (Vite + React 19 + Tailwind CSS)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  Customer Interface  │ │  Pharmacist Portal   │ │  Rider Delivery View │
│ - Search & Catalog   │ │ - Review Orders      │ │ - Secure Rider PIN   │
│ - Cart & Coupons     │ │ - Verify Rx Slips    │ │ - Assigned Orders    │
│ - GPS Address & COD  │ │ - Inventory & Prices │ │ - 1-Tap Customer Call│
│ - Live Order Status  │ │ - Assign Riders      │ │ - Google Maps Nav    │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION STATE LAYER                         │
│   AuthContext  ·  CartContext  ·  OrderContext  ·  LanguageContext     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────────┐     ┌──────────────────────────────┐
│     Cloud Firestore / Firebase    │     │   Local Offline Persistent   │
│ - /users/{userId} (Profiles/Addr) │     │            Cache             │
│ - /medicines/{medicineId} (Stock) │     │ - IndexedDB / LocalStorage   │
│ - /orders/{orderId} (Orders & Rx) │     │ - Offline Service Worker     │
│ - /admins & /delivery_agents      │     │ - PWA Cache (sw.js)          │
└───────────────────────────────────┘     └──────────────────────────────┘
```

### Data Collections & Schema Summary

1. **`users`**: `{ uid, name, email, phone, role: 'customer'|'admin'|'delivery', createdAt }`
2. **`users/{userId}/addresses`**: `{ id, name, phone, street, locality, landmark, pinCode, isDefault, gpsCoords }`
3. **`medicines`**: `{ id, name, nameHi, brand, salt, category, price, mrp, inStock, stockCount, requiresPrescription, packSize }`
4. **`orders`**: `{ id, customerId, customerName, customerPhone, items, subtotal, discount, deliveryCharge, totalAmount, status, paymentMethod: 'COD', shippingAddress, prescription, assignedDeliveryAgent, createdAt, updatedAt }`
5. **`prescriptions`**: `{ id, orderId, customerId, imageUrl, patientName, patientAge, doctorName, status: 'Pending Verification'|'Verified'|'Rejected', pharmacistNotes, uploadedAt }`

### Security Rules Highlights (`firestore.rules`)
- **Customer Privacy**: Strict `resource.data.customerId == request.auth.uid` query enforcement ensures no customer can view other customers' orders or addresses.
- **Admin Isolation**: Pharmacist admin privileges are restricted to `madhavmedicalhall2016@gmail.com` or verified `admins/` documents.
- **Rider Access**: Delivery riders can only access and update orders explicitly assigned to their phone number.
- **Price Integrity**: Client write rules mandate non-negative numerical totals and immutable price snapshots.

---

## 5. Execution Steps

1. **Phase 1: Firebase Provisioning & Integration**:
   - Trigger automated AI Studio Firebase setup via `show_aistudio_ui` for user confirmation.
   - Wire Firebase SDK with fallback initialization in `src/firebase/config.ts`.
2. **Phase 2: Rider PIN Delivery Portal**:
   - Build `RiderPortal.tsx` with dedicated PIN gate (`1234`), active assigned routes, tap-to-call, and Google Maps GPS navigation.
3. **Phase 3: Customer Ordering & Checkout Hardening**:
   - Complete pure Cash & UPI on Delivery flow with zero PIN storage disclaimers.
   - Enforce server-side price recalculation during order placement.
4. **Phase 4: Verification & Compilation**:
   - Run `compile_applet` and `lint_applet` to ensure zero build errors.
   - Validate customer registration, login, forgot password, cart, and checkout flows.
