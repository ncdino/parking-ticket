"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import Head from "next/head";
import ParkingCarImg from "@/public/image/parking-icon.png";
import { getToken } from "firebase/messaging";
import { messaging } from "@/firebase/firebaseConfig";

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null); // 선택된 카메라 정보 상태 추가

  // CSV 데이터 불러오기
  const { data: cameraData = [] } = useQuery({
    queryKey: ["cameraData"],
    queryFn: async () => {
      const response = await fetch("/data/camera_output.csv");
      const csvText = await response.text();
      return Papa.parse(csvText, { header: true, dynamicTyping: true }).data;
    },
  });

  // 사용자 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );

    // Kakao Maps API 로드
    const kakaoScript = document.createElement("script");
    kakaoScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    kakaoScript.async = true;
    kakaoScript.onload = () => {
      window.kakao.maps.load(() => {
        setIsKakaoLoaded(true);
      });
    };
    document.head.appendChild(kakaoScript);

    return () => {
      document.head.removeChild(kakaoScript);
    };
  }, []);

  // 서비스 워커 등록 및 FCM 토큰 요청
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // 서비스 워커 등록
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });
          console.log("FCM Token:", token);
        } else {
          console.warn("알림 권한이 거부되었습니다.");
        }
      } catch (error) {
        console.error("알림 권한 요청 오류:", error);
      }
    };

    // FCM 초기화 및 알림 권한 요청
    requestNotificationPermission();
  }, []);

  // 지도 초기화
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

    // 사용자 위치 마커 생성
    const createMarker = (position, isUserLocation = false, cameraInfo = null) => {
      const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
      const markerImage = isUserLocation
        ? new window.kakao.maps.MarkerImage(
            ParkingCarImg.src,
            new window.kakao.maps.Size(24, 24),
            { offset: new window.kakao.maps.Point(12, 12) }
          )
        : null;

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
      });
      marker.setMap(map);

      // 카메라 마커 클릭 이벤트 추가
      if (cameraInfo) {
        window.kakao.maps.event.addListener(marker, "click", () => {
          setSelectedCamera(cameraInfo); // 선택된 카메라 정보 업데이트
        });
      }
    };

    // 사용자 위치 마커 추가
    createMarker(userLocation, true);

    // 카메라 데이터 마커 생성 (5000m 이내)
    if (userLocation) {
      cameraData.forEach((camera) => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          camera.latitude,
          camera.longitude
        );
        if (distance <= 5000) {
          createMarker({ lat: camera.latitude, lng: camera.longitude }, false, camera);
        }
      });
    }
  };

  // 거리 계산 함수
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
    <>
      <Head>
        <title>Nearby Parking Enforcement Cameras</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold mb-4">Nearby Parking Enforcement Cameras</h1>
        <div id="map" style={{ width: "100%", height: "500px" }}></div>

        {/* 선택된 카메라 정보 표시 */}
        {selectedCamera && (
          <div className="mt-4 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">선택된 카메라 정보</h2>
            <p>위도: {selectedCamera.latitude}</p>
            <p>경도: {selectedCamera.longitude}</p>
            <p>추가 정보: {selectedCamera.info || "정보 없음"}</p>
          </div>
        )}
      </div>
    </>
  );
}
