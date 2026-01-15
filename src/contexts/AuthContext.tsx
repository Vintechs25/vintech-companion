import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

interface User {
  userid: number;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstname: string, lastname: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "vintech_userid";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    if (storedUserId) {
      setUser({ userid: parseInt(storedUserId, 10) });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.result === "success" && response.userid) {
        localStorage.setItem(STORAGE_KEY, response.userid.toString());
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
    lastname: string
  ) => {
    try {
      const response = await authApi.register(email, password, firstname, lastname);
      
      if (response.result === "success") {
        // Auto-login after successful registration
        return login(email, password);
      }
      
      return { 
        success: false, 
        error: response.error || "Registration failed. Please try again." 
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
