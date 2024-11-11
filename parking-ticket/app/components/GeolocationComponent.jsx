// components/GeolocationComponent.js
import { useState, useEffect } from 'react';

export default function GeolocationComponent({ setUserLocation }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 첫 위치를 가져옴
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting initial user location:', error);
        },
        { enableHighAccuracy: true }
      );

      // 위치 변화 감지를 위해 watchPosition 사용
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error watching user location:', error);
        },
        { enableHighAccuracy: true }
      );

      // 컴포넌트가 언마운트될 때 watchPosition 해제
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [setUserLocation]);

  return null;
}
