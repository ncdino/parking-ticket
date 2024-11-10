"use client"; // 컴포넌트 최상단에 추가

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import Head from "next/head";
import ParkingCarImg from "@/public/image/parking-icon.png";

export default function MainPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

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

  // 브라우저 환경에서만 사용자 위치를 가져오도록 설정
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
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
  }, []);

  // 사용자 위치가 설정된 후에만 Kakao Maps API 로드
  useEffect(() => {
    if (userLocation && typeof window !== "undefined") {
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
    }
  }, [userLocation]);

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
        <div className="mt-4 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Parking Violation Note</h2>
          {selectedNote ? <p>{selectedNote}</p> : <p>No camera selected</p>}
        </div>
      </div>
    </>
  );
}
