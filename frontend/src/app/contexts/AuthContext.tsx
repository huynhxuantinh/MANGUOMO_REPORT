import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../lib/services";
import { saveTokens, clearTokens } from "../lib/api";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user từ /auth/me/ khi khởi động nếu có token
  useEffect(() => {
    const token = localStorage.getItem("elh_access");
    if (!token) {
      setLoading(false);
      return;
    }
    authService.me()
      .then((res) => {
        const data = res.data;
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.is_staff ? "admin" : "user",
        });
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.login(email, password);
      const { access, refresh } = res.data;
      saveTokens(access, refresh);

      const meRes = await authService.me();
      const data = meRes.data;
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.is_staff ? "admin" : "user",
      });
      return { success: true };
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Email hoặc mật khẩu không đúng";
      return { success: false, error: detail };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.register(name, email, password);
      // Auto-login sau khi đăng ký
      return await login(email, password);
    } catch (err: any) {
      const data = err?.response?.data;
      const detail =
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        "Đăng ký thất bại";
      return { success: false, error: detail };
    }
  };

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
