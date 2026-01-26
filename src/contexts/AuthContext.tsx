import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

interface User {
  userid: number;
  email?: string;
}

interface BillingAddress {
  phonenumber: string;
  companyname?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstname: string, lastname: string, billing: BillingAddress) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "vintech_userid";
const EMAIL_STORAGE_KEY = "vintech_email";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedUserId) {
      setUser({ userid: parseInt(storedUserId, 10), email: storedEmail || undefined });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.result === "success" && response.userid) {
        localStorage.setItem(STORAGE_KEY, response.userid.toString());
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
        setUser({ userid: response.userid, email });
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.message || "Invalid email or password" 
      };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "An error occurred. Please try again." 
      };
    }
  }, []);

  const register = useCallback(async (
    email: string, 
    password: string, 
    firstname: string, 
    lastname: string,
    billing: BillingAddress
  ) => {
    try {
      const response = await authApi.register(email, password, firstname, lastname, billing);
      
      if (response.result === "success") {
        // Auto-login after successful registration
        return login(email, password);
      }
      
      return { 
        success: false, 
        error: response.message || response.error || "Registration failed. Please try again." 
      };
    } catch (error) {
      console.error("Register error:", error);
      return { 
        success: false, 
        error: "An error occurred. Please try again." 
      };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
