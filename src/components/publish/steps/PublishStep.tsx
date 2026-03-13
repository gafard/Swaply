"use client";

import React from "react";
import LocationSelector from "@/components/publish/LocationSelector";
import type { GeoCatalog, GeoCity, GeoZone } from "@/lib/geo";

interface PublishStepProps {
  // LocationSelector props
  geoCatalog: GeoCatalog;
  availableCities: GeoCity[];
  availableZones: GeoZone[];
  selectedCountryId: string;
  selectedCityId: string;
  selectedZoneId: string;
  selectedZone: GeoZone | null;
  isLoadingGeo: boolean;
  isRequestingLocation: boolean;
  coords: { lat: number; lng: number } | null;
  geoError: string | null;
  gpsError: string | null;
  clientError?: string;
  onCountryChange: (id: string) => void;
  onCityChange: (id: string) => void;
  onZoneChange: (id: string) => void;
  // Summary card data
  normalizedTitle: string;
  creditValue: number;
  photoCount: number;
  // i18n labels
  summaryTitle: string;
  summaryItemLabel: string;
  summaryItemFallback: string;
  summaryPhotosLabel: string;
  summaryPriceLabel: string;
  summaryCreditsShort: string;
  summaryZoneLabel: string;
  summaryZoneFallback: string;
}

export default function PublishStep({
  geoCatalog,
  availableCities,
  availableZones,
  selectedCountryId,
  selectedCityId,
  selectedZoneId,
  selectedZone,
  isLoadingGeo,
  isRequestingLocation,
  coords,
  geoError,
  gpsError,
  clientError,
  onCountryChange,
  onCityChange,
  onZoneChange,
  normalizedTitle,
  creditValue,
  photoCount,
  summaryTitle,
  summaryItemLabel,
  summaryItemFallback,
  summaryPhotosLabel,
  summaryPriceLabel,
  summaryCreditsShort,
  summaryZoneLabel,
  summaryZoneFallback,
}: PublishStepProps) {
  return (
    <div className="space-y-6">
      <LocationSelector
        availableCities={availableCities}
        availableZones={availableZones}
        clientError={clientError}
        geoCatalog={geoCatalog}
        geoError={geoError}
        gpsError={gpsError}
        isDetectingZone={Boolean(
          (isRequestingLocation || (coords && !selectedZoneId)) &&
            !isLoadingGeo &&
            !gpsError
        )}
        isLoadingGeo={isLoadingGeo}
        onCityChange={onCityChange}
        onCountryChange={onCountryChange}
        onZoneChange={onZoneChange}
        selectedCityId={selectedCityId}
        selectedCountryId={selectedCountryId}
        selectedZone={selectedZone}
        selectedZoneId={selectedZoneId}
      />

      <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          {summaryTitle}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#fff7ec,_#ffffff)] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              {summaryItemLabel}
            </p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {normalizedTitle || summaryItemFallback}
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-500">
              {summaryPhotosLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#f6f3ff,_#ffffff)] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              {summaryPriceLabel}
            </p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {creditValue} {summaryCreditsShort}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#eefbf8,_#ffffff)] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              {summaryZoneLabel}
            </p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {selectedZone?.name || summaryZoneFallback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
