import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, PrescriptionData, Medicine, UserAddress } from '../types';
import { INITIAL_MEDICINES } from '../data/medicines';

interface OrderContextType {
  orders: Order[];
  medicines: Medicine[];
  createOrder: (orderData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: Order['items'];
    subtotal: number;
    discount: number;
    couponCode?: string;
    deliveryCharge: number;
    totalAmount: number;
    shippingAddress: UserAddress;
    paymentMethod: 'COD' | 'ONLINE_UPI' | 'STORE_PICKUP';
    prescription?: PrescriptionData;
  }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  cancelOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  assignDeliveryAgent: (orderId: string, agent: { name: string; phone: string }) => Promise<void>;
  updatePrescriptionStatus: (
    orderId: string,
    status: PrescriptionData['status'],
    pharmacistNotes?: string
  ) => Promise<void>;
  uploadDirectPrescription: (
    prescription: Omit<PrescriptionData, 'id' | 'uploadedAt' | 'status'>,
    customer: { id: string; name: string; phone: string; email: string; address?: UserAddress }
  ) => Promise<{ success: boolean; orderId?: string }>;
  updateMedicineStock: (medicineId: string, inStock: boolean, stockCount?: number) => void;
  updateMedicinePrice: (medicineId: string, newPrice: number, newMrp?: number) => void;
  addNewMedicine: (medicine: Medicine) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Initial sample orders for demonstration & realistic testing
const SAMPLE_INITIAL_ORDERS: Order[] = [
  {
    id: 'MMH-2026-10492',
    customerId: 'usr-demo-customer',
    customerName: 'Sunil Paswan',
    customerPhone: '9122260360',
    customerEmail: 'customer@example.com',
    items: [
      {
        medicineId: 'med-dolo-650',
        name: 'Dolo 650mg Tablet',
        brand: 'Micro Labs Ltd',
        price: 30,
        quantity: 2,
        packSize: '15 Tablets / Strip',
        requiresPrescription: false,
      },
      {
        medicineId: 'med-pan-d',
        name: 'Pan-D Capsule',
        brand: 'Alkem Laboratories',
        price: 175,
        quantity: 1,
        packSize: '15 Capsules / Strip',
        requiresPrescription: true,
      },
      {
        medicineId: 'med-electral-ors',
        name: 'Electral ORS Sachet (21.8g)',
        brand: 'FDC Ltd',
        price: 21,
        quantity: 3,
        packSize: '21.8g Sachet',
        requiresPrescription: false,
      }
    ],
    subtotal: 320,
    discount: 50,
    couponCode: 'WELCOME50',
    deliveryCharge: 0,
    totalAmount: 270,
    status: 'Out for Delivery',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: '2026-10-21T09:15:00.000Z',
        note: 'Order placed by customer via Cash on Delivery'
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-21T09:20:00.000Z',
        note: 'Dr. prescription verified by Madhav Medical pharmacist'
      },
      {
        status: 'Confirmed',
        timestamp: '2026-10-21T09:30:00.000Z',
        note: 'Order confirmed and medicines reserved'
      },
      {
        status: 'Preparing',
        timestamp: '2026-10-21T09:45:00.000Z',
        note: 'Medicines packed in tamper-evident sanitised bag'
      },
      {
        status: 'Out for Delivery',
        timestamp: '2026-10-21T10:10:00.000Z',
        note: 'Dispatched with delivery executive Ramesh Kumar'
      }
    ],
    shippingAddress: {
      id: 'addr-default-1',
      name: 'Sunil Paswan',
      phone: '9122260360',
      street: 'Ward No. 4, Near High School',
      locality: 'Chanmana, Baheri',
      landmark: 'Opposite Shiv Mandir',
      pinCode: '847105',
      gpsCoords: {
        latitude: 25.9687,
        longitude: 86.0125,
        mapsUrl: 'https://www.google.com/maps?q=25.9687,86.0125'
      }
    },
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    assignedDeliveryAgent: {
      name: 'Ramesh Kumar (Baheri Zone)',
      phone: '9876543210'
    },
    prescription: {
      id: 'rx-sample-1',
      imageUrl: '/madhav-logo.jpg',
      uploadedAt: '2026-10-21T09:15:00.000Z',
      patientName: 'Sunil Paswan',
      patientAge: '34',
      doctorName: 'Dr. A. K. Jha (Darbhanga)',
      notes: 'Please send evening dose instructions too',
      status: 'Verified',
      pharmacistNotes: 'Verified Pan-D prescription. Dolo is OTC.'
    },
    createdAt: '2026-10-21T09:15:00.000Z',
    updatedAt: '2026-10-21T10:10:00.000Z'
  }
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mmh_orders');
      return saved ? JSON.parse(saved) : SAMPLE_INITIAL_ORDERS;
    } catch {
      return SAMPLE_INITIAL_ORDERS;
    }
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem('mmh_inventory');
      return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
    } catch {
      return INITIAL_MEDICINES;
    }
  });

  useEffect(() => {
    localStorage.setItem('mmh_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mmh_inventory', JSON.stringify(medicines));
  }, [medicines]);

  const createOrder = async (orderData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: Order['items'];
    subtotal: number;
    discount: number;
    couponCode?: string;
    deliveryCharge: number;
    totalAmount: number;
    shippingAddress: UserAddress;
    paymentMethod: 'COD' | 'ONLINE_UPI' | 'STORE_PICKUP';
    prescription?: PrescriptionData;
  }): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      // 1. Verify stock for each ordered medicine
      for (const item of orderData.items) {
        const med = medicines.find((m) => m.id === item.medicineId);
        if (med && med.stockCount < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${item.name}. Available: ${med.stockCount}, Requested: ${item.quantity}.`
          };
        }
      }

      // 2. Decrement stock
      setMedicines((prev) =>
        prev.map((med) => {
          const orderedItem = orderData.items.find((item) => item.medicineId === med.id);
          if (orderedItem) {
            const nextCount = Math.max(0, med.stockCount - orderedItem.quantity);
            return {
              ...med,
              stockCount: nextCount,
              inStock: nextCount > 0,
            };
          }
          return med;
        })
      );

      // 3. Generate unique order ID
      const orderId = `MMH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date().toISOString();

      const initialStatus: OrderStatus = orderData.prescription || orderData.items.some((i) => i.requiresPrescription)
        ? 'Under Review'
        : 'Order Placed';

      const newOrder: Order = {
        id: orderId,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        couponCode: orderData.couponCode,
        deliveryCharge: orderData.deliveryCharge,
        totalAmount: orderData.totalAmount,
        status: initialStatus,
        statusHistory: [
          {
            status: initialStatus,
            timestamp: now,
            note: initialStatus === 'Under Review'
              ? 'Order requires pharmacist review for prescription medicine.'
              : 'Order placed by customer.'
          }
        ],
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'ONLINE_UPI' ? 'Paid' : 'Pending',
        transactionId: orderData.paymentMethod === 'ONLINE_UPI' ? 'UPI_TXN_' + Date.now() : undefined,
        prescription: orderData.prescription,
        createdAt: now,
        updatedAt: now,
      };

      setOrders((prev) => [newOrder, ...prev]);

      return { success: true, orderId };
    } catch (err) {
      console.error('Order creation error', err);
      return { success: false, error: 'Could not create order. Please try again.' };
    }
  };

  const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return { success: false, error: 'Order not found.' };

    if (existing.status === 'Out for Delivery' || existing.status === 'Delivered') {
      return {
        success: false,
        error: 'Order is already dispatched/delivered and cannot be cancelled automatically. Please call 9122260360.'
      };
    }

    if (existing.status === 'Cancelled') {
      return { success: false, error: 'Order is already cancelled.' };
    }

    const now = new Date().toISOString();
    // Restock items
    setMedicines((prev) =>
      prev.map((med) => {
        const item = existing.items.find((i) => i.medicineId === med.id);
        if (item) {
          const nextCount = med.stockCount + item.quantity;
          return { ...med, stockCount: nextCount, inStock: true };
        }
        return med;
      })
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'Cancelled',
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'Cancelled',
                timestamp: now,
                note: reason || 'Cancelled by customer as per store cancellation policy.'
              }
            ]
          };
        }
        return o;
      })
    );

    return { success: true };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              {
                status,
                timestamp: now,
                note: note || `Status updated to ${status}`
              }
            ]
          };
        }
        return o;
      })
    );
  };

  const assignDeliveryAgent = async (orderId: string, agent: { name: string; phone: string }) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            assignedDeliveryAgent: agent,
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              {
                status: o.status,
                timestamp: now,
                note: `Assigned to delivery agent ${agent.name} (${agent.phone})`
              }
            ]
          };
        }
        return o;
      })
    );
  };

  const updatePrescriptionStatus = async (
    orderId: string,
    status: PrescriptionData['status'],
    pharmacistNotes?: string
  ) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId && o.prescription) {
          return {
            ...o,
            prescription: {
              ...o.prescription,
              status,
              pharmacistNotes,
            },
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              {
                status: o.status,
                timestamp: now,
                note: `Prescription marked as ${status}. ${pharmacistNotes ? 'Pharmacist note: ' + pharmacistNotes : ''}`
              }
            ]
          };
        }
        return o;
      })
    );
  };

  const uploadDirectPrescription = async (
    prescription: Omit<PrescriptionData, 'id' | 'uploadedAt' | 'status'>,
    customer: { id: string; name: string; phone: string; email: string; address?: UserAddress }
  ): Promise<{ success: boolean; orderId?: string }> => {
    const orderId = `MMH-RX-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const fullPrescription: PrescriptionData = {
      ...prescription,
      id: 'rx-' + Date.now(),
      uploadedAt: now,
      status: 'Pending Verification',
    };

    const fallbackAddress: UserAddress = customer.address || {
      id: 'addr-rx',
      name: customer.name,
      phone: customer.phone,
      street: 'As per call discussion',
      locality: 'Chanmana / Baheri',
      pinCode: '847105',
    };

    const newOrder: Order = {
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryCharge: 0,
      totalAmount: 0,
      status: 'Under Review',
      statusHistory: [
        {
          status: 'Under Review',
          timestamp: now,
          note: 'Prescription uploaded. Registered Pharmacist will review and call customer on ' + customer.phone
        }
      ],
      shippingAddress: fallbackAddress,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      prescription: fullPrescription,
      createdAt: now,
      updatedAt: now,
      storeNotes: 'Prescription inquiry uploaded directly by customer.'
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { success: true, orderId };
  };

  const updateMedicineStock = (medicineId: string, inStock: boolean, stockCount?: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          const newCount = stockCount !== undefined ? stockCount : inStock ? 20 : 0;
          return {
            ...m,
            inStock,
            stockCount: newCount,
          };
        }
        return m;
      })
    );
  };

  const updateMedicinePrice = (medicineId: string, newPrice: number, newMrp?: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          const mrp = newMrp || m.mrp;
          const discountPercent = Math.max(0, Math.round(((mrp - newPrice) / mrp) * 100));
          return {
            ...m,
            price: newPrice,
            mrp,
            discountPercent,
          };
        }
        return m;
      })
    );
  };

  const addNewMedicine = (medicine: Medicine) => {
    setMedicines((prev) => [medicine, ...prev]);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        medicines,
        createOrder,
        cancelOrder,
        updateOrderStatus,
        assignDeliveryAgent,
        updatePrescriptionStatus,
        uploadDirectPrescription,
        updateMedicineStock,
        updateMedicinePrice,
        addNewMedicine,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
