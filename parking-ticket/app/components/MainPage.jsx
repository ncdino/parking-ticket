// components/MainPage.js
"use client";

import { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import CameraInfo from "./CameraInfo";

export default function MainPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedNote, setSelectedNote] = useState(""); // 선택된 카메라 정보

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 첫 위치를 가져옴
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting initial user location:", error);
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
          console.error("Error watching user location:", error);
        },
        { enableHighAccuracy: true }
      );

      // 컴포넌트가 언마운트될 때 watchPosition 해제
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  return (
    <div>
      <h1>Nearby Parking Enforcement Cameras</h1>
      <MapComponent
        userLocation={userLocation}
        setSelectedNote={setSelectedNote}
      />
      <CameraInfo selectedNote={selectedNote} />
    </div>
  );
}
