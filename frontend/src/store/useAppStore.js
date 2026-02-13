import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import { API_END_POINT } from "@/lib/constants";

export const useAppStore = create()(
  persist(
    (set) => ({
      theme: "light",
      user: null,
      vendorDishes: [],
      vendors: [],
      selectedVendor: null,
      selectedVendorDishes: [],
      userLocation: {
        address: "",
        lat: null,
        lng: null
      },
      loading: {
        page: false,
        login: false,
        signUp: false,
        vendors: false,
        selectedVendor: false,
      },
      vender:null,
      setVenderActiveOrders: (venderActiveOrders) => set({ venderActiveOrders }),
      
      userLocation:{
        address:"",
        lat:null,
        lng:null
      },
    setLocation: (address, lat, lng) =>
      set(() => ({
        userLocation: {
          address,
          lat,
          lng
        }
      })),

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

      setLocation: (address, lat, lng) =>
        set(() => ({
          userLocation: {
            address,
            lat,
            lng
          }
        })),

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
      // ----------------------------
      // PROFILE
      // ----------------------------
      getProfile: async () => {
        try {
          const res = await fetch(`${API_END_POINT}/user/profile`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) {
            set({ user: data.user });
          }
        } catch (error) {
          console.error(error);
        }
      },

      updateProfile: async (profileData) => {
        const setLoading = useAppStore.getState().setLoading;
        setLoading("profileUpdate", true);

        try {
          const res = await fetch(`${API_END_POINT}/user/profile`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Update failed");
            return;
          }

          if (data.success) {
            set({ user: data.user });
            toast.success(data.message || "Profile updated successfully");
          }
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred");
        } finally {
          setLoading("profileUpdate", false);
        }
      },
      // ----------------------------
      // DISHES / ITEMS
      // ----------------------------
      getVendorDishes: async () => {
        try {
          const res = await fetch(`${API_END_POINT}/dish/my-dishes`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) {
            set({ vendorDishes: data.dishes });
          }
        } catch (error) {
          console.error(error);
        }
      },

      addDish: async (formData) => {
        const setLoading = useAppStore.getState().setLoading;
        setLoading("addDish", true);

        try {
          const res = await fetch(`${API_END_POINT}/dish`, {
            method: "POST",
            credentials: "include",
            // No content-type header for FormData, browser handles it
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Failed to add item");
            return;
          }

          if (data.success) {
            const { vendorDishes } = useAppStore.getState();
            set({ vendorDishes: [data.dish, ...vendorDishes] });
            toast.success(data.message || "Item listed successfully");
            return true;
          }
        } catch (error) {
          console.error(error);
          toast.error("Unexpected error occurred");
        } finally {
          setLoading("addDish", false);
        }
        return false;
      },

      logout: async () => {
        try {
          const res = await fetch(`${API_END_POINT}/user/logout`, {
            method: "GET",
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

      getAllVendors: async () => {
        set((state) => ({ loading: { ...state.loading, vendors: true } }));
        try {
          const response = await fetch(`${API_END_POINT}/vender/all`);
          const data = await response.json();
          if (data.success) {
            set({ vendors: data.vendors });
          }
        } catch (error) {
          console.error("Error fetching vendors:", error);
        } finally {
          set((state) => ({ loading: { ...state.loading, vendors: false } }));
        }
      },

      getVendorById: async (id) => {
        set((state) => ({ loading: { ...state.loading, selectedVendor: true } }));
        try {
          const response = await fetch(`${API_END_POINT}/vender/${id}`);
          const data = await response.json();
          if (data.success) {
            set({ selectedVendor: data.vender });
          }
        } catch (error) {
          console.error("Error fetching vendor:", error);
        } finally {
          set((state) => ({ loading: { ...state.loading, selectedVendor: false } }));
        }
      },

      getDishesByVendor: async (id) => {
        try {
          const response = await fetch(`${API_END_POINT}/dish/vender/${id}`);
          const data = await response.json();
          if (data.success) {
            set({ selectedVendorDishes: data.dishes });
          }
        } catch (error) {
          console.error("Error fetching dishes:", error);
        }
      },

      createOrder: async (orderData) => {
        const setLoading = useAppStore.getState().setLoading;
        setLoading("createOrder", true);
        try {
          const response = await fetch(`${API_END_POINT}/vender/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(orderData),
          });

          const data = await response.json();
          if (data.success) {
            toast.success("Order placed successfully!");
            // Optional: Clear cart local storage or state
            localStorage.removeItem("cart");
            return data.order;
          } else {
            toast.error(data.message || "Failed to place order");
          }
        } catch (error) {
          console.error("Error creating order:", error);
          toast.error("An error occurred while placing your order");
        } finally {
          setLoading("createOrder", false);
        }
        return null;
      },
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
