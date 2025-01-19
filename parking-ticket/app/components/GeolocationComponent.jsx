"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";


// 알림권한 요청
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("이 브라우저는 알림을 지원하지 않습니다.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("알림 권한이 거부되었습니다.");
  }
};

// 알림 트리거 함수
const triggerNotification = (camera) => {
  if (Notification.permission === "granted") {
    new Notification("근처 알림", {
      body: `${camera.installation_location} 근처에서 10초 이상 머물렀습니다.`,

    });
  }
};

export default function GeolocationComponent({ setUserLocation }) {
  const [closestCamera, setClosestCamera] = useState(null);
  const stayTimerRef = useRef(null);

  const { data: cameraData = [] } = useQuery({
    queryKey: ["cameraData"],
    queryFn: async () => {
      const response = await fetch("/data/camera_output.csv");
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
      }).data;
      return parsedData;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    requestNotificationPermission();

    if (typeof navigator !== "undefined") {
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
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const closest = findClosestCamera(latitude, longitude);
          setClosestCamera(closest);
          checkProximity(latitude, longitude, closest);
        },
        (error) => {
          console.error("Error watching user location:", error);
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(stayTimerRef.current);
      };
    }
  }, [setUserLocation, cameraData]);

  const findClosestCamera = (userLat, userLng) => {
    let closest = null;
    let minDistance = Infinity;

    cameraData.forEach((camera) => {
      const distance = getDistance(
        userLat,
        userLng,
        camera.latitude,
        camera.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = camera;
      }
    });

    return closest;
  };

  const checkProximity = (userLat, userLng, closestCamera) => {
    const PROXIMITY_RADIUS = 100; 
    const STAY_DURATION = 10000;

    if (closestCamera) {
      const distance = getDistance(
        userLat,
        userLng,
        closestCamera.latitude,
        closestCamera.longitude
      );

      if (distance <= PROXIMITY_RADIUS) {
        if (!stayTimerRef.current) {
          stayTimerRef.current = setTimeout(() => {
            triggerNotification(closestCamera);
            stayTimerRef.current = null; // 초기화
          }, STAY_DURATION);
        }
      } else {
        if (stayTimerRef.current) {
          clearTimeout(stayTimerRef.current);
          stayTimerRef.current = null;
        }
      }
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

  return null;
}
