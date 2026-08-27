"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';
import { loginWithGoogle, logout, resolveUserRoleAndTenant } from './auth';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        const resolved = resolveUserRoleAndTenant(currentUser.email);
        setRole(resolved.role);
        setTenantId(resolved.tenantId);
      } else {
        setUser(null);
        setRole(null);
        setTenantId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, role, tenantId, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
