"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser } from "../features/auth/services/authService";

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = getStoredUser();
        
        if (token && storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
          // Redirect to login if not on auth pages
          if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/") {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname, router]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const value = {
    user,
    loading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};