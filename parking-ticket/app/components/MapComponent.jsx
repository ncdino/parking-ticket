"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import ParkingCarImg from "@/public/image/parking-icon.png";

export default function MapComponent({ userLocation, setSelectedNote }) {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);

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
    if (isKakaoLoaded && userLocation && cameraData.length > 0 && !map) {
      // 카메라 데이터 로드 완료 후 맵 초기화
      initializeMap();
    }
  }, [isKakaoLoaded, userLocation, cameraData, map]);

  useEffect(() => {
    if (map && userLocation) {
      const latLng = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
      map.setCenter(latLng);

      if (userMarker) {
        userMarker.setPosition(latLng);
      } else {
        const newUserMarker = createUserMarker(latLng, map);
        setUserMarker(newUserMarker);
      }
    }
  }, [userLocation, map]);

  const initializeMap = () => {
    const mapContainer = document.getElementById("map");
    const mapOptions = {
      center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 4,
    };
    const mapInstance = new window.kakao.maps.Map(mapContainer, mapOptions);
    setMap(mapInstance);

    const initialUserLatLng = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    const initialUserMarker = createUserMarker(initialUserLatLng, mapInstance);
    setUserMarker(initialUserMarker);

    cameraData.forEach((camera) => {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        camera.latitude,
        camera.longitude
      );
      if (distance <= 10000) {
        createMarker(
          { lat: camera.latitude, lng: camera.longitude },
          mapInstance,
          camera
        );
      }
    });
  };

  const createUserMarker = (position, map) => {
    const userMarkerImage = new window.kakao.maps.MarkerImage(
      ParkingCarImg.src,
      new window.kakao.maps.Size(24, 24),
      { offset: new window.kakao.maps.Point(12, 12) }
    );

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: userMarkerImage,
    });
    marker.setMap(map);
    return marker;
  };

  const createMarker = (position, map, cameraInfo) => {
    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    window.kakao.maps.event.addListener(marker, "click", () => {
      setSelectedNote({
        note: cameraInfo.parking_violation_note,
        location: cameraInfo.installation_location,
      });
      drawCircle(position);
    });
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

  const drawCircle = (position) => {
    if (map) {
      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(position.lat, position.lng),
        radius: 200,
        strokeWeight: 2,
        strokeColor: "#ff0000",
        strokeOpacity: 1,
        fillColor: "#ff0000",
        fillOpacity: 0.4,
      });
      circle.setMap(map);
    }
  };

  return (
    <div>
      <div id="map" className="w-full h-[500px] rounded-2xl"></div>
    </div>
  );
}
