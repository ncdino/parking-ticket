"use client";

import { useEffect, useRef, useState } from "react";

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
      icon: "/notification-icon.png",
    });
  }
};

export default function GeolocationComponent({ setUserLocation, cameraData }) {
  const [closestCamera, setClosestCamera] = useState(null);
  const stayTimerRef = useRef(null);
  const prevLocationRef = useRef(null);
  const locationChangeTimeRef = useRef(null);

  useEffect(() => {
    requestNotificationPermission();

    if (typeof navigator !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          prevLocationRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          locationChangeTimeRef.current = Date.now();
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

          const currentTime = Date.now();
          const timeDiff = currentTime - (locationChangeTimeRef.current || 0);

          if (timeDiff > 10000) {
            const closest = findClosestCamera(latitude, longitude);
            setClosestCamera(closest);
            checkProximity(latitude, longitude, closest);
          }

          locationChangeTimeRef.current = currentTime;

          if (prevLocationRef.current) {
            const distance = getDistance(
              latitude,
              longitude,
              prevLocationRef.current.lat,
              prevLocationRef.current.lng
            );
            if (distance > 10) { // gps 미세반응 -> 10m
              prevLocationRef.current = { lat: latitude, lng: longitude };
            }
          }
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
      const distance = getDistance(userLat, userLng, camera.latitude, camera.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closest = camera;
      }
    });

    return closest;
  };

  // 특정 반경 내 머무는지 확인하는 함수
  const checkProximity = (userLat, userLng, closestCamera) => {
    const PROXIMITY_RADIUS = 100;
    const STAY_DURATION = 10000;

    if (closestCamera) {
      const distance = getDistance(userLat, userLng, closestCamera.latitude, closestCamera.longitude);

      if (distance <= PROXIMITY_RADIUS) {
        if (!stayTimerRef.current) {
          stayTimerRef.current = setTimeout(() => {
            triggerNotification(closestCamera);
            stayTimerRef.current = null;
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
