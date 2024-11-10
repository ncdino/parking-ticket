"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse"; // 설치 필요: npm install papaparse
import Head from "next/head";
import ParkingCarImg from "@/public/image/parking-icon.png";

export default function MainPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [selectedNote, setSelectedNote] = useState(""); // 선택된 카메라 정보

  // TanStack Query로 CSV 데이터 가져오기
  const { data: cameraData = [] } = useQuery({
    queryKey: ["cameraData"],
    queryFn: async () => {
      const response = await fetch("/data/camera_output.csv");
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
      }).data;
      console.log("완료");
      return parsedData;
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      // 사용자 위치 얻기
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
    }

    // Kakao Maps API 로드
    const kakaoScript = document.createElement("script");
    kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false`;
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

    const createMarker = (position, map, note, isUserLocation = false) => {
      const markerPosition = new window.kakao.maps.LatLng(
        position.lat,
        position.lng
      );
      const markerImage = isUserLocation
        ? new window.kakao.maps.MarkerImage(
            ParkingCarImg.src, // 사용자 위치 마커 이미지 경로
            new window.kakao.maps.Size(24, 24), // 이미지 크기
            { offset: new window.kakao.maps.Point(12, 12) } // 이미지 중심점
          )
        : null;
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
      });
      marker.setMap(map);

      // 마커 클릭 시 주차단속카메라 정보 표시
      window.kakao.maps.event.addListener(marker, "click", () => {
        setSelectedNote(note); // 선택된 카메라의 주차단속 내용
      });
    };

    createMarker(userLocation, map, null, true);

    // 주차단속카메라 데이터 표시
    cameraData.forEach((camera) => {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        camera.latitude, // 카메라의 위도
        camera.longitude // 카메라의 경도
      );
      if (distance <= 100000) {
        createMarker(
          { lat: camera.latitude, lng: camera.longitude },
          map,
          camera.parking_violation_note
        );
      }
    });
  };

  // 거리 계산 함수
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터로 반환
  };

  return (
    <>
      <Head>
        <title>Nearby Parking Enforcement Cameras</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Nearby Parking Enforcement Cameras
        </h1>
        <div id="map" style={{ width: "100%", height: "500px" }}></div>

        {/* 지도 아래에 카메라 정보 출력 */}
        <div className="mt-4 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Parking Violation Note</h2>
          {selectedNote ? <p>{selectedNote}</p> : <p>No camera selected</p>}
        </div>
      </div>
    </>
  );
}
