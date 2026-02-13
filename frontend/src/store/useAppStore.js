import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import { API_END_POINT } from "@/lib/constants";

export const useAppStore = create()(
  persist(
    (set) => ({
      theme: "light",
      user: null,
      loading: {
        page: false,
        login: false,
        signUp: false,
      },

      setTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("bite-buddy-theme", theme);
        set({ theme });
      },

      initializeTheme: () => {
        if (typeof window !== "undefined") {
          const storedTheme = localStorage.getItem("bite-buddy-theme") || "light";
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(storedTheme);
          set({ theme: storedTheme });
        }
      },

      resetStore: () => set({ user: null }),

      // Utility to update loading dynamically
      setLoading: (key, value) =>
        set((state) => ({ loading: { ...state.loading, [key]: value } })),

      // ----------------------------
      // LOGIN
      // ----------------------------
      login: async (credentials) => {
        const setLoading = useAppStore.getState().setLoading;
        setLoading("login", true);

        try {
          const res = await fetch(`${API_END_POINT}/user/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Login failed");
            return;
          }

          if (data.success) {
            set({ user: data.user });
            toast.success(data.message || "Login successful");
          }
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          setLoading("login", false);
        }
      },

      // ----------------------------
      // SIGNUP
      // ----------------------------
      signUp: async (credentials) => {
        const setLoading = useAppStore.getState().setLoading;
        setLoading("signUp", true)

        try {
          const res = await fetch(`${API_END_POINT}/user/signup`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "SignUp failed");
            return;
          }

          if (data.success) {
            set({ user: data.user });
            toast.success(data.message || "SignUp successful");
          }
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred, try again later");
        } finally {
          setLoading("signUp", false);
        }
      },

      logout: async () => {
        try {
          const res = await fetch(`${API_END_POINT}/user/logout`, {
            method: "GET", // Or POST depending on route definition, checking user.route.js... 
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) {
            set({ user: null });
            toast.success(data.message || "Logged out successfully");
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to logout");
        }
      },
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
