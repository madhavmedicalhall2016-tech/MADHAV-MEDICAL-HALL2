export type Language = 'en' | 'hi';

export type UserRole = 'customer' | 'admin' | 'delivery';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  locality: string; // e.g. Chanmana, Baheri
  landmark?: string;
  pinCode: string;
  isDefault?: boolean;
  gpsCoords?: {
    latitude: number;
    longitude: number;
    mapsUrl?: string;
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: UserAddress[];
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  nameHi: string;
  brand: string;
  salt: string;
  category: string;
  categoryHi: string;
  price: number; // Discounted store price (₹)
  mrp: number; // Maximum Retail Price (₹)
  discountPercent: number;
  packSize: string;
  packSizeHi: string;
  inStock: boolean;
  stockCount: number;
  requiresPrescription: boolean;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Drops' | 'Ointment' | 'Powder' | 'Device';
  dosageFormHi: string;
  uses: string;
  usesHi: string;
  sideEffectsWarning?: string;
  sideEffectsWarningHi?: string;
  image: string;
  featured?: boolean;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Under Review'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  packSize: string;
  requiresPrescription: boolean;
}

export interface PrescriptionData {
  id: string;
  imageUrl: string;
  uploadedAt: string;
  patientName: string;
  patientAge?: string;
  doctorName?: string;
  notes?: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  pharmacistNotes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  shippingAddress: UserAddress;
  paymentMethod: 'COD' | 'ONLINE_UPI' | 'STORE_PICKUP';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  prescription?: PrescriptionData;
  assignedDeliveryAgent?: {
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  storeNotes?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrder: number;
  description: string;
  descriptionHi: string;
}
