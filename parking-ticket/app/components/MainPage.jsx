// components/MainPage.js
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import MapComponent from "./MapComponent";
import CameraInfo from "./CameraInfo";
import { useQuery } from "@tanstack/react-query";

const GeolocationComponent = dynamic(() => import("./GeolocationComponent"), {
  ssr: false,
});

export default function MainPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedNote, setSelectedNote] = useState(""); // 선택된 카메라 정보

  // TanStack Query로 CSV 파일에서 카메라 데이터 가져오기

  return (
    <div>
      <GeolocationComponent setUserLocation={setUserLocation} />
      <MapComponent
        userLocation={userLocation}
        setSelectedNote={setSelectedNote}
      />
      <CameraInfo selectedNote={selectedNote} />
    </div>
  );
}
