"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, ChevronRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { selectMeetingPoint } from "@/app/actions/exchange";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import to avoid SSR issues with Leaflet
const MeetingMap = dynamic(() => import("./MeetingMap"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-300 font-bold">Chargement de la carte...</div>
});

interface MeetingPoint {
  id: string;
  name: string;
  zone: string;
  description: string | null;
  lat: number;
  lng: number;
}

interface MeetingPointSelectorProps {
  exchangeId: string;
  points: MeetingPoint[];
  currentPointId?: string | null;
}

export default function MeetingPointSelector({ exchangeId, points, currentPointId }: MeetingPointSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MeetingPoint | null>(
    points.find(p => p.id === currentPointId) || null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  // Get user location for distance display
  useState(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location access denied for meeting points")
      );
    }
  });

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleSelect = async (point: MeetingPoint) => {
    setSelectedPoint(point);
  };

  const confirmSelection = async () => {
    if (!selectedPoint) return;
    setIsUpdating(true);
    try {
      await selectMeetingPoint(exchangeId, selectedPoint.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to select meeting point:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Active State / Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedPoint ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <MapPin className={`w-6 h-6 ${selectedPoint ? 'fill-emerald-600' : ''}`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Lieu de rencontre</p>
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              {selectedPoint ? selectedPoint.name : "Choisir un lieu sûr"}
            </h3>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <div className="px-6 pb-6">
              {/* Map Container */}
              <div className="mb-6">
                <MeetingMap 
                  points={points} 
                  selectedPointId={selectedPoint?.id} 
                  onSelect={handleSelect} 
                />
              </div>

              {/* Point Details & Actions */}
              {selectedPoint && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{selectedPoint.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{selectedPoint.zone}</p>
                        {userCoords && (
                          <span className="text-[10px] font-bold text-slate-400">
                             • à {getDistance(userCoords.lat, userCoords.lng, selectedPoint.lat, selectedPoint.lng)} km
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPoint.id === currentPointId && (
                      <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmé
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {selectedPoint.description || "Lieu de rencontre sécurisé recommandé par Swaply."}
                  </p>
                </motion.div>
              )}

              <button
                disabled={!selectedPoint || isUpdating || selectedPoint.id === currentPointId}
                onClick={confirmSelection}
                className="w-full bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {isUpdating ? "Mise à jour..." : selectedPoint?.id === currentPointId ? "Lieu déjà sélectionné" : "Confirmer ce lieu"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
