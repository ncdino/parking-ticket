// components/MainPage.js
"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import MapComponent from './MapComponent';
import CameraInfo from './CameraInfo';

const GeolocationComponent = dynamic(() => import('./GeolocationComponent'), { ssr: false });

export default function MainPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedNote, setSelectedNote] = useState(""); // 선택된 카메라 정보

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
