import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetCurrentUser, UserProfile } from "@workspace/api-client-react";
import { getToken, removeToken } from "@/lib/auth";

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setTokenState] = useState<string | null>(() => getToken());

  useEffect(() => {
    const handleChange = () => setTokenState(getToken());
    window.addEventListener("emp_pro_auth_change", handleChange);
    return () => window.removeEventListener("emp_pro_auth_change", handleChange);
  }, []);

  const { data: user, isLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    } as any,
  });

  useEffect(() => {
    if (isError) {
      removeToken();
      setLocation("/login");
    }
  }, [isError, setLocation]);

  const logout = () => {
    removeToken();
    setLocation("/login");
  };

  const loading = !!token && isLoading;

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
