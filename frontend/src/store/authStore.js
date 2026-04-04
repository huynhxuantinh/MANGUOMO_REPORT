import { create } from "zustand";

import { getMeApi, loginApi, registerApi } from "../api/auth";
import { clearAuthTokens, getAccessToken, setAuthTokens } from "../api/client";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: Boolean(getAccessToken()),
  isLoading: false,
  error: "",

  login: async ({ username, password }) => {
    set({ isLoading: true, error: "" });
    try {
      const tokens = await loginApi({ username, password });
      setAuthTokens(tokens);
      const user = await getMeApi();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || "Dang nhap that bai.";
      set({ error: message, isLoading: false, isAuthenticated: false });
      clearAuthTokens();
      return false;
    }
  },

  register: async ({ username, email, password }) => {
    set({ isLoading: true, error: "" });
    try {
      await registerApi({ username, email, password });
      set({ isLoading: false });
      return true;
    } catch (error) {
      const message = JSON.stringify(error.response?.data || "Dang ky that bai.");
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchMe: async () => {
    if (!getAccessToken()) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await getMeApi();
      set({ user, isAuthenticated: true });
    } catch {
      clearAuthTokens();
      set({ isAuthenticated: false, user: null });
    }
  },

  logout: () => {
    clearAuthTokens();
    set({ user: null, isAuthenticated: false, error: "" });
  },
}));

export default useAuthStore;
