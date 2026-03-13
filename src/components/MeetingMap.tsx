"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom SVG Markers
const createCustomIcon = (color: string, isOfficial: boolean) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        border: 3px solid white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: rotate(-45deg);
        position: relative;
      ">
        <div style="transform: rotate(45deg);">
          ${isOfficial ? 
            '<svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>' : 
            '<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>'
          }
        </div>
        ${isOfficial ? `
          <div style="
            position: absolute;
            background: #10B981;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            top: -4px;
            right: -4px;
            border: 2px solid white;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Defer icon creation to avoid SSR/Evaluation issues
let officialIcon: L.DivIcon;
let standardIcon: L.DivIcon;

function getIcons() {
  if (!officialIcon) officialIcon = createCustomIcon("#10B981", true);
  if (!standardIcon) standardIcon = createCustomIcon("#4F46E5", false);
  return { officialIcon, standardIcon };
}

interface MeetingPoint {
  id: string;
  name: string;
  zone: string;
  description: string | null;
  lat: number;
  lng: number;
  isOfficial?: boolean;
}

interface MeetingMapProps {
  points: MeetingPoint[];
  selectedPointId?: string;
  onSelect: (point: MeetingPoint) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() === 13 ? 15 : map.getZoom());
  }, [center, map]);
  return null;
}

export default function MeetingMap({ points, selectedPointId, onSelect }: MeetingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[350px] w-full bg-slate-100 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-300 font-black uppercase tracking-tighter">Initialisation Carte...</div>;

  const defaultCenter: [number, number] = [6.1785, 1.2355]; // Total Hedzranawoe
  const selectedPoint = points.find(p => p.id === selectedPointId);
  const center = selectedPoint ? [selectedPoint.lat, selectedPoint.lng] as [number, number] : defaultCenter;

  return (
    <div className="h-[350px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl z-0 relative group">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {selectedPoint && <ChangeView center={[selectedPoint.lat, selectedPoint.lng]} />}
        {points.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]} 
            icon={point.isOfficial ? getIcons().officialIcon : getIcons().standardIcon}
            eventHandlers={{
              click: () => onSelect(point),
            }}
          >
            <Popup className="premium-popup">
              <div className="p-2 min-w-[160px]">
                {point.isOfficial && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 w-fit">
                    <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none"><path d="M20 6L9 17l-5-5"></path></svg>
                    Swap Spot Officiel
                  </div>
                )}
                <p className="font-black text-slate-900 text-sm leading-tight mb-0.5">{point.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">{point.zone}</p>
                <button 
                  onClick={() => onSelect(point)}
                  className={`w-full text-white text-[10px] font-black py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-opacity-30 ${
                    point.isOfficial ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'
                  }`}
                >
                  Sélectionner
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend / Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Points Sûrs</span>
         </div>
      </div>
    </div>
  );
}
