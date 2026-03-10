"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MeetingPoint {
  id: string;
  name: string;
  zone: string;
  description: string | null;
  lat: number;
  lng: number;
}

interface MeetingMapProps {
  points: MeetingPoint[];
  selectedPointId?: string;
  onSelect: (point: MeetingPoint) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function MeetingMap({ points, selectedPointId, onSelect }: MeetingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-2xl" />;

  const defaultCenter: [number, number] = [6.1751, 1.2132]; // Lomé Univ
  const selectedPoint = points.find(p => p.id === selectedPointId);
  const center = selectedPoint ? [selectedPoint.lat, selectedPoint.lng] as [number, number] : defaultCenter;

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedPoint && <ChangeView center={[selectedPoint.lat, selectedPoint.lng]} />}
        {points.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]} 
            icon={icon}
            eventHandlers={{
              click: () => onSelect(point),
            }}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <p className="font-black text-slate-900 text-sm leading-tight mb-1">{point.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{point.zone}</p>
                <button 
                  onClick={() => onSelect(point)}
                  className="w-full bg-indigo-600 text-white text-[10px] font-black py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Choisir ce lieu
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
