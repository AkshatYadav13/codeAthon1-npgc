import { useUserLocation } from '../../hook/locationHook.js';
import React, { useEffect } from 'react'
import { LiveTrackingMap } from './LiveTrackingMap';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { API_END_POINT } from '@/lib/constants';

const Home = () => {

  const { getUserLocation } = useUserLocation();
  const { venderActiveOrders, setVenderActiveOrders, user } = useAppStore();

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === 'Vender' 
          ? `${API_END_POINT}/order/vender/active` 
          : `${API_END_POINT}/order/customer/active`;
        
        const res = await fetch(endpoint, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
            setVenderActiveOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch active orders", error);
      }
    };
    
    fetchActiveOrders();
  }, [user, setVenderActiveOrders]);

  const activeOrder = Array.isArray(venderActiveOrders) && venderActiveOrders.length > 0 ? venderActiveOrders[0] : null;

  return (
    <div>
      Home
    </div>
  )
}

export default Home