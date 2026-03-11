"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { GeoCatalog, GeoCity, GeoZone } from "@/lib/geo";

type LocationSelectorProps = {
  availableCities: GeoCity[];
  availableZones: GeoZone[];
  clientError?: string | null;
  geoCatalog: GeoCatalog;
  geoError?: string | null;
  gpsError?: string | null;
  isDetectingZone: boolean;
  isLoadingGeo: boolean;
  onCityChange: (cityId: string) => void;
  onCountryChange: (countryId: string) => void;
  onZoneChange: (zoneId: string) => void;
  selectedCityId: string;
  selectedCountryId: string;
  selectedZone?: GeoZone | null;
  selectedZoneId: string;
};

export default function LocationSelector({
  availableCities,
  availableZones,
  clientError,
  geoCatalog,
  geoError,
  gpsError,
  isDetectingZone,
  isLoadingGeo,
  onCityChange,
  onCountryChange,
  onZoneChange,
  selectedCityId,
  selectedCountryId,
  selectedZone,
  selectedZoneId,
}: LocationSelectorProps) {
  const t = useTranslations("publish");
  const errorMessage = geoError || gpsError;
  const errorId = "location-error";

  return (
    <div className="space-y-4">
      <div className="mb-1 flex items-center justify-between px-1">
        <label className="text-sm font-bold text-gray-800">{t("location.title")}</label>
        {selectedZone ? (
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
            {selectedZone.name}
          </span>
        ) : null}
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className={cn(
            "rounded-2xl border px-4 py-3 text-[11px] font-bold",
            geoError
              ? "border-rose-100 bg-rose-50 text-rose-700"
              : "border-amber-100 bg-amber-50 text-amber-700"
          )}
        >
          {errorMessage}
        </div>
      ) : isLoadingGeo ? (
        <div className="space-y-3 rounded-[34px] border border-slate-100 bg-white p-5 shadow-[0_18px_48px_rgba(16,32,58,0.08)] animate-pulse">
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
          <div className="h-11 rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="relative space-y-4 overflow-hidden rounded-[34px] border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#eefbf8_100%)] p-5 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-200/25 blur-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="countryId"
                className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
              >
                {t("country")}
              </label>
              <select
                id="countryId"
                required
                value={selectedCountryId}
                onChange={(event) => onCountryChange(event.target.value)}
                aria-invalid={Boolean(clientError)}
                aria-describedby={clientError ? errorId : undefined}
                className={cn(
                  "w-full rounded-[20px] border bg-white/85 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500",
                  clientError ? "border-rose-300" : "border-slate-200"
                )}
              >
                <option value="" disabled>
                  {t("selectCountry")}
                </option>
                {geoCatalog.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="cityId"
                className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
              >
                {t("city")}
              </label>
              <select
                id="cityId"
                required
                value={selectedCityId}
                onChange={(event) => onCityChange(event.target.value)}
                disabled={availableCities.length === 0}
                aria-invalid={Boolean(clientError)}
                aria-describedby={clientError ? errorId : undefined}
                className={cn(
                  "w-full rounded-[20px] border bg-white/85 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-50",
                  clientError ? "border-rose-300" : "border-slate-200"
                )}
              >
                <option value="" disabled>
                  {t("selectCity")}
                </option>
                {availableCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="zoneId"
              className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
            >
              {t("zone")}
            </label>
            <select
              id="zoneId"
              required
              value={selectedZoneId}
              onChange={(event) => onZoneChange(event.target.value)}
              disabled={availableZones.length === 0}
              aria-invalid={Boolean(clientError)}
              aria-describedby={clientError ? errorId : undefined}
              className={cn(
                "w-full rounded-[20px] border bg-white/85 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-50",
                clientError ? "border-rose-300" : "border-slate-200"
              )}
            >
              <option value="" disabled>
                {t("selectZone")}
              </option>
              {availableZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {clientError ? (
            <p id={errorId} role="alert" className="text-[11px] font-bold text-rose-600">
              {clientError}
            </p>
          ) : null}
        </div>
      )}

      {isDetectingZone ? (
        <p className="mt-2 animate-pulse text-[10px] font-bold text-primary">
          {t("detectingZone")}
        </p>
      ) : null}
    </div>
  );
}
