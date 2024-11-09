// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "./firebase"; // Firebase 설정 파일
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";

export default function HomePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  const { data: cameraData = [] } = useQuery({
    queryKey: ["cameraData"],
    queryFn: async () => {
      const response = await fetch("/data/camera_output.csv");
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, { header: true, dynamicTyping: true }).data;
      return parsedData;
    },
  });

  // 알림 권한 요청 및 토큰 가져오기
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        console.log("FCM Token:", token);
        // FCM 토큰을 백엔드로 전송하여 저장 가능
      } else {
        console.error("알림 권한이 허용되지 않았습니다.");
      }
    };

    requestNotificationPermission();
  }, []);

  // Kakao 지도 API 설정
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => console.error("Error getting user location:", error)
    );

    const kakaoScript = document.createElement("script");
    kakaoScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    kakaoScript.async = true;
    kakaoScript.onload = () => {
      window.kakao.maps.load(() => setIsKakaoLoaded(true));
    };
    document.head.appendChild(kakaoScript);

    return () => document.head.removeChild(kakaoScript);
  }, []);

  // Kakao 지도 및 마커 설정
  useEffect(() => {
    if (isKakaoLoaded && userLocation && window.kakao && window.kakao.maps) {
      initializeMap();
    }
  }, [isKakaoLoaded, userLocation, cameraData]);

  const initializeMap = () => {
    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 4,
    };
    const map = new window.kakao.maps.Map(container, options);

    const createMarker = (position, map, note) => {
      const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
      const marker = new window.kakao.maps.Marker({ position: markerPosition });
      marker.setMap(map);

      window.kakao.maps.event.addListener(marker, "click", () => setSelectedNote(note));
    };

    createMarker(userLocation, map, null);

    if (userLocation) {
      cameraData.forEach((camera) => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          camera.latitude,
          camera.longitude
        );
        if (distance <= 5000) {
          createMarker(
            { lat: camera.latitude, lng: camera.longitude },
            map,
            camera.parking_violation_note
          );
        }
      });
    }
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nearby Parking Enforcement Cameras</h1>
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
      <div className="mt-4 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Parking Violation Note</h2>
        {selectedNote ? <p>{selectedNote}</p> : <p>No camera selected</p>}
      </div>
    </div>
  );
}
