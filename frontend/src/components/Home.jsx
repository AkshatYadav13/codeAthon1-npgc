import { useUserLocation } from '../../hook/locationHook.js';
import React, { useEffect } from 'react'

const Home = () => {
  const { getUserLocation } = useUserLocation();

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div>Home</div>
  )
}

export default Home