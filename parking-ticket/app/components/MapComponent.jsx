"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse"; // CSV 파싱을 위한 라이브러리
import ParkingCarImg from "@/public/image/parking-icon.png"; // 사용자 위치 마커 이미지 경로

export default function MapComponent({ userLocation, setSelectedNote }) {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  // TanStack Query로 CSV 파일에서 카메라 데이터 가져오기
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
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 카카오맵 API 스크립트 로딩
      const kakaoScript = document.createElement("script");
      kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      kakaoScript.async = true;
      kakaoScript.onload = () => {
        window.kakao.maps.load(() => {
          setIsKakaoLoaded(true);
        });
      };
      document.head.appendChild(kakaoScript);
      kakaoScript.onerror = () => {
        console.error("Failed to load Kakao Maps script.");
      };

      return () => {
        document.head.removeChild(kakaoScript);
      };
    }
  }, []);

  useEffect(() => {
    if (isKakaoLoaded && userLocation && cameraData.length > 0) {
      // 카카오맵 초기화
      initializeMap();
    }
  }, [isKakaoLoaded, userLocation, cameraData]);

  const initializeMap = () => {
    const mapContainer = document.getElementById("map");
    const mapOptions = {
      center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 4, // 지도 줌 레벨
    };
    const map = new window.kakao.maps.Map(mapContainer, mapOptions);

    // 사용자 위치에 마커 설정
    const userMarkerImage = new window.kakao.maps.MarkerImage(
      ParkingCarImg.src, // 사용자 위치 마커 이미지 경로
      new window.kakao.maps.Size(24, 24), // 이미지 크기
      { offset: new window.kakao.maps.Point(12, 12) } // 이미지 중심점
    );

    const userMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      image: userMarkerImage,
    });
    userMarker.setMap(map);

    // 주차단속카메라 데이터를 기반으로 마커 생성
    cameraData.forEach((camera) => {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        camera.latitude,
        camera.longitude
      );
      if (distance <= 10000) { // 거리 10km 이내에 카메라 마커 추가
        createMarker(
          { lat: camera.latitude, lng: camera.longitude },
          map,
          camera.parking_violation_note
        );
      }
    });
  };

  // 카메라 위치에 마커를 생성하고 클릭 시 세부 정보를 표시
  const createMarker = (position, map, note) => {
    const markerPosition = new window.kakao.maps.LatLng(
      position.lat,
      position.lng
    );
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    window.kakao.maps.event.addListener(marker, "click", () => {
      setSelectedNote(note); // 클릭 시 선택된 카메라 정보 표시
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

  return <div id="map" style={{ width: "100%", height: "500px" }} />;
}
