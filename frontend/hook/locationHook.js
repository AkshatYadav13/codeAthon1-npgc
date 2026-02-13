import { useAppStore } from "@/store/useAppStore";
import { useCallback } from "react";

export const useUserLocation = () => {
  const setLocation = useAppStore((state) => state.setLocation);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        if (latitude && longitude) {
          setLocation(
            "",
            latitude,
            longitude
          );
        }
      },
      (error) => {
        console.log("Location error:", error.message);
      }
    );
  }, [setLocation]);

  return { getUserLocation };
};
