"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { selectMeetingPoint } from "@/app/actions/exchange";

const MeetingMap = dynamic(() => import("./MeetingMap"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-slate-50" />,
});

interface MeetingPoint {
  id: string;
  name: string;
  zone: string;
  description: string | null;
  lat: number;
  lng: number;
  isOfficial?: boolean;
}

interface MeetingPointSelectorProps {
  exchangeId: string;
  points: MeetingPoint[];
  currentPointId?: string | null;
}

export default function MeetingPointSelector({
  exchangeId,
  points,
  currentPointId,
}: MeetingPointSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MeetingPoint | null>(
    points.find((point) => point.id === currentPointId) || null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const t = useTranslations("exchange.meeting");

  useState(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => undefined
      );
    }
  });

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const radiusKm = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (radiusKm * c).toFixed(1);
  };

  const confirmSelection = async () => {
    if (!selectedPoint) {
      return;
    }

    setIsUpdating(true);
    try {
      const result = await selectMeetingPoint(exchangeId, selectedPoint.id);
      if (!result.ok) {
        toast.error(t("errors.generic"));
        return;
      }

      toast.success(t("success"));
      setIsOpen(false);
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`mb-6 overflow-hidden rounded-[2rem] border transition-all duration-500 ${
        selectedPoint?.isOfficial
          ? "border-emerald-100 bg-white shadow-lg shadow-emerald-50"
          : "border-slate-100 bg-white shadow-sm"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ${
              selectedPoint?.isOfficial
                ? "scale-110 bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                : selectedPoint
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <MapPin className={`h-6 w-6 ${selectedPoint ? "fill-current" : ""}`} />
          </div>
          <div className="text-left">
            <div className="mb-0.5 flex items-center gap-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("title")}
              </p>
              {selectedPoint?.isOfficial && (
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-emerald-600">
                  {t("secure")}
                </span>
              )}
            </div>
            <h3 className="text-sm font-black leading-tight text-slate-900">
              {selectedPoint ? selectedPoint.name : t("chooseSafeSpot")}
            </h3>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-300" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-300" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <div className="px-6 pb-6 pt-2">
              <div className="mb-6">
                <MeetingMap
                  points={points}
                  selectedPointId={selectedPoint?.id}
                  onSelect={(point) => setSelectedPoint(point)}
                />
              </div>

              {selectedPoint && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`mb-6 rounded-2xl border p-5 transition-colors duration-500 ${
                    selectedPoint.isOfficial
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{selectedPoint.name}</h4>
                        {selectedPoint.isOfficial && (
                          <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {t("swapSpot")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            selectedPoint.isOfficial ? "text-emerald-600" : "text-indigo-500"
                          }`}
                        >
                          {selectedPoint.zone}
                        </p>
                        {userCoords && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {t("distance", {
                              amount: getDistance(
                                userCoords.lat,
                                userCoords.lng,
                                selectedPoint.lat,
                                selectedPoint.lng
                              ),
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPoint.id === currentPointId && (
                      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                        {t("confirmed")}
                      </div>
                    )}
                  </div>
                  <p className="text-xs italic leading-relaxed text-slate-500">
                    {selectedPoint.description || t("fallbackDescription")}
                  </p>
                </motion.div>
              )}

              <button
                disabled={!selectedPoint || isUpdating || selectedPoint.id === currentPointId}
                onClick={confirmSelection}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {isUpdating
                  ? t("updating")
                  : selectedPoint?.id === currentPointId
                    ? t("alreadySelected")
                    : t("confirm")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
