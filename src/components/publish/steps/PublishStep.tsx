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

      <div className="rounded-[30px] border border-border bg-surface p-5 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted">
          {summaryTitle}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-raised/60 p-3.5">
            <p className="text-[8px] font-black uppercase tracking-wider text-muted">
              {summaryItemLabel}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground truncate">
              {normalizedTitle || summaryItemFallback}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              {summaryPhotosLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised/60 p-3.5">
            <p className="text-[8px] font-black uppercase tracking-wider text-muted">
              {summaryPriceLabel}
            </p>
            <p className="mt-1 text-sm font-bold text-primary">
              {creditValue} {summaryCreditsShort}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised/60 p-3.5">
            <p className="text-[8px] font-black uppercase tracking-wider text-muted">
              {summaryZoneLabel}
            </p>
            <p className="mt-1 text-sm font-bold text-foreground truncate">
              {selectedZone?.name || summaryZoneFallback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
