import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserAddress, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: Omit<UserAddress, 'id'>;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; resetToken?: string; error?: string }>;
  resetPasswordWithToken: (email: string, token: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<UserAddress>;
  updateAddress: (address: UserAddress) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for hashing password client-side using SHA-256 so no plain text password is ever saved
async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + '_mmh_secure_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_ADDRESS: UserAddress = {
  id: 'addr-default-1',
  name: 'Sunil Paswan',
  phone: '9122260360',
  street: 'Ward No. 4, Near High School',
  locality: 'Chanmana, Baheri',
  landmark: 'Opposite Shiv Mandir',
  pinCode: '847105',
  isDefault: true,
  gpsCoords: {
    latitude: 25.9687,
    longitude: 86.0125,
    mapsUrl: 'https://www.google.com/maps?q=25.9687,86.0125'
  }
};

const DEMO_USERS: Record<string, { profile: UserProfile; passHash: string }> = {
  'customer@example.com': {
    profile: {
      uid: 'usr-demo-customer',
      name: 'Sunil Paswan',
      email: 'customer@example.com',
      phone: '9122260360',
      role: 'customer',
      addresses: [DEFAULT_ADDRESS],
      createdAt: new Date().toISOString(),
    },
    passHash: '', // Initialized in effect
  },
  'madhavmedicalhall2016@gmail.com': {
    profile: {
      uid: 'usr-admin-pharmacist',
      name: 'Madhav Pharmacist (Admin)',
      email: 'madhavmedicalhall2016@gmail.com',
      phone: '9122260360',
      role: 'admin',
      addresses: [
        {
          id: 'addr-store',
          name: 'Madhav Medical Hall',
          phone: '9122260360',
          street: 'Main Market Road',
          locality: 'Chanmana, Baheri, Darbhanga',
          landmark: 'Medical Hall Complex',
          pinCode: '847105',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    },
    passHash: '',
  },
  'delivery@madhav.com': {
    profile: {
      uid: 'usr-delivery-agent',
      name: 'Ramesh Kumar (Baheri Zone)',
      email: 'delivery@madhav.com',
      phone: '9876543210',
      role: 'delivery',
      addresses: [],
      createdAt: new Date().toISOString(),
    },
    passHash: '',
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize secure users store in localStorage if not already set
  useEffect(() => {
    const initStore = async () => {
      try {
        const storedUsers = localStorage.getItem('mmh_registered_users');
        if (!storedUsers) {
          const defaultHash = await hashPassword('password123');
          const adminHash = await hashPassword('admin123');
          const usersWithHashes: Record<string, { profile: UserProfile; passHash: string }> = {
            'customer@example.com': {
              ...DEMO_USERS['customer@example.com'],
              passHash: defaultHash,
            },
            'madhavmedicalhall2016@gmail.com': {
              ...DEMO_USERS['madhavmedicalhall2016@gmail.com'],
              passHash: adminHash,
            },
            'delivery@madhav.com': {
              ...DEMO_USERS['delivery@madhav.com'],
              passHash: defaultHash,
            }
          };
          localStorage.setItem('mmh_registered_users', JSON.stringify(usersWithHashes));
        }

        // Restore active session
        const activeUserStr = localStorage.getItem('mmh_active_user');
        if (activeUserStr) {
          setCurrentUser(JSON.parse(activeUserStr));
        }
      } catch (err) {
        console.error('Failed to init auth store', err);
      } finally {
        setIsLoading(false);
      }
    };

    initStore();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const storedUsersStr = localStorage.getItem('mmh_registered_users');
      const users: Record<string, { profile: UserProfile; passHash: string }> = storedUsersStr ? JSON.parse(storedUsersStr) : {};

      const userRecord = users[trimmedEmail];
      if (!userRecord) {
        return {
          success: false,
          error: 'No registered account found with this email. Please check your spelling or register.'
        };
      }

      const inputHash = await hashPassword(pass);
      if (userRecord.passHash !== inputHash) {
        return {
          success: false,
          error: 'Incorrect password. Please try again or use "Forgot Password".'
        };
      }

      setCurrentUser(userRecord.profile);
      localStorage.setItem('mmh_active_user', JSON.stringify(userRecord.profile));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Login error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: Omit<UserAddress, 'id'>;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const email = data.email.trim().toLowerCase();
      if (!email.includes('@') || !email.includes('.')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (data.phone.trim().replace(/\D/g, '').length < 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
      }
      if (data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const storedUsersStr = localStorage.getItem('mmh_registered_users');
      const users: Record<string, { profile: UserProfile; passHash: string }> = storedUsersStr ? JSON.parse(storedUsersStr) : {};

      if (users[email]) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const passHash = await hashPassword(data.password);
      const uid = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

      const addresses: UserAddress[] = [];
      if (data.address && data.address.street && data.address.locality) {
        addresses.push({
          ...data.address,
          id: 'addr-' + Date.now(),
          isDefault: true,
        });
      }

      const newProfile: UserProfile = {
        uid,
        name: data.name.trim(),
        email,
        phone: data.phone.trim(),
        role: email === 'madhavmedicalhall2016@gmail.com' ? 'admin' : 'customer',
        addresses,
        createdAt: new Date().toISOString(),
      };

      users[email] = {
        profile: newProfile,
        passHash,
      };

      localStorage.setItem('mmh_registered_users', JSON.stringify(users));
      setCurrentUser(newProfile);
      localStorage.setItem('mmh_active_user', JSON.stringify(newProfile));

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mmh_active_user');
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; resetToken?: string; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const storedUsersStr = localStorage.getItem('mmh_registered_users');
    const users: Record<string, { profile: UserProfile; passHash: string }> = storedUsersStr ? JSON.parse(storedUsersStr) : {};

    if (!users[trimmedEmail]) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const resetToken = 'MMH-RESET-' + Math.floor(100000 + Math.random() * 900000);
    sessionStorage.setItem('mmh_reset_token_' + trimmedEmail, resetToken);

    return { success: true, resetToken };
  };

  const resetPasswordWithToken = async (
    email: string,
    token: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedToken = sessionStorage.getItem('mmh_reset_token_' + trimmedEmail);

    if (!expectedToken || expectedToken !== token.trim()) {
      return { success: false, error: 'Invalid or expired reset code. Please request a new link.' };
    }

    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const storedUsersStr = localStorage.getItem('mmh_registered_users');
    const users: Record<string, { profile: UserProfile; passHash: string }> = storedUsersStr ? JSON.parse(storedUsersStr) : {};

    if (!users[trimmedEmail]) {
      return { success: false, error: 'Account not found.' };
    }

    const newHash = await hashPassword(newPass);
    users[trimmedEmail].passHash = newHash;
    localStorage.setItem('mmh_registered_users', JSON.stringify(users));
    sessionStorage.removeItem('mmh_reset_token_' + trimmedEmail);

    return { success: true };
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };
    if (newPass.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    const storedUsersStr = localStorage.getItem('mmh_registered_users');
    const users: Record<string, { profile: UserProfile; passHash: string }> = storedUsersStr ? JSON.parse(storedUsersStr) : {};

    const userRecord = users[currentUser.email.toLowerCase()];
    if (!userRecord) return { success: false, error: 'User record not found.' };

    const currentHash = await hashPassword(currentPass);
    if (userRecord.passHash !== currentHash) {
      return { success: false, error: 'Current password is not correct.' };
    }

    const newHash = await hashPassword(newPass);
    users[currentUser.email.toLowerCase()].passHash = newHash;
    localStorage.setItem('mmh_registered_users', JSON.stringify(users));

    return { success: true };
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in.' };

    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('mmh_active_user', JSON.stringify(updated));

    const storedUsersStr = localStorage.getItem('mmh_registered_users');
    if (storedUsersStr) {
      const users = JSON.parse(storedUsersStr);
      if (users[currentUser.email.toLowerCase()]) {
        users[currentUser.email.toLowerCase()].profile = updated;
        localStorage.setItem('mmh_registered_users', JSON.stringify(users));
      }
    }

    return { success: true };
  };

  const addAddress = async (newAddr: Omit<UserAddress, 'id'>): Promise<UserAddress> => {
    const address: UserAddress = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      isDefault: currentUser?.addresses.length === 0 || newAddr.isDefault,
    };

    if (currentUser) {
      let addresses = [...currentUser.addresses];
      if (address.isDefault) {
        addresses = addresses.map((a) => ({ ...a, isDefault: false }));
      }
      addresses.push(address);
      await updateProfile({ addresses });
    }
    return address;
  };

  const updateAddress = async (updatedAddr: UserAddress): Promise<void> => {
    if (!currentUser) return;
    let addresses = currentUser.addresses.map((a) => (a.id === updatedAddr.id ? updatedAddr : a));
    if (updatedAddr.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a.id === updatedAddr.id }));
    }
    await updateProfile({ addresses });
  };

  const deleteAddress = async (id: string): Promise<void> => {
    if (!currentUser) return;
    const addresses = currentUser.addresses.filter((a) => a.id !== id);
    if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }
    await updateProfile({ addresses });
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    if (!currentUser) return;
    const addresses = currentUser.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await updateProfile({ addresses });
  };

  const deleteAccount = async (): Promise<void> => {
    if (!currentUser) return;
    const storedUsersStr = localStorage.getItem('mmh_registered_users');
    if (storedUsersStr) {
      const users = JSON.parse(storedUsersStr);
      delete users[currentUser.email.toLowerCase()];
      localStorage.setItem('mmh_registered_users', JSON.stringify(users));
    }
    logout();
  };

  const switchRole = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      localStorage.setItem('mmh_active_user', JSON.stringify(updated));
    } else {
      // Find default user of this role
      const found = Object.values(DEMO_USERS).find((u) => u.profile.role === role);
      if (found) {
        setCurrentUser(found.profile);
        localStorage.setItem('mmh_active_user', JSON.stringify(found.profile));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPasswordWithToken,
        changePassword,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        deleteAccount,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
