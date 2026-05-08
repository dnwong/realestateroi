import React, { createContext, useContext } from 'react';
import { useAuthQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } from '../hooks/useAuthQuery';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: user, isLoading } = useAuthQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading,
      isAuthenticated: !!user,
      login: loginMutation.mutateAsync,
      register: registerMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      loginError: loginMutation.error,
      registerError: registerMutation.error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
