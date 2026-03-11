"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Handshake,
  MapPin,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { updateCurrentUserLocation } from "@/app/actions/location";
import AppLogo from "@/components/AppLogo";
import { GeoCatalog } from "@/lib/geo";
import { localizeHref } from "@/lib/i18n/pathnames";
import { normalizePostAuthPath, sanitizeNextPath } from "@/lib/onboarding";

type GeoPayload = {
  countries: GeoCatalog;
  currentLocation: {
    countryId: string | null;
    cityId: string | null;
    zoneId: string | null;
    countryName: string | null;
    cityName: string | null;
    zoneName: string | null;
  } | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("onboarding");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [geoCatalog, setGeoCatalog] = useState<GeoCatalog>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPayload["currentLocation"]>(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const slides = [
    {
      id: "publish",
      title: t("slides.publish.title"),
      description: t("slides.publish.description"),
      icon: <PlusCircle className="h-12 w-12 text-white" strokeWidth={1.5} />,
      color: "from-indigo-600 to-indigo-800",
    },
    {
      id: "discover",
      title: t("slides.discover.title"),
      description: t("slides.discover.description"),
      icon: <Sparkles className="h-12 w-12 text-white" strokeWidth={1.5} />,
      color: "from-cyan-600 to-indigo-700",
    },
    {
      id: "secure",
      title: t("slides.secure.title"),
      description: t("slides.secure.description"),
      icon: <Handshake className="h-12 w-12 text-white" strokeWidth={1.5} />,
      color: "from-emerald-600 to-teal-700",
    },
  ];

  const isAuthenticated = currentLocation !== null;

  const selectedCountry = useMemo(
    () => geoCatalog.find((country) => country.id === selectedCountryId) ?? null,
    [geoCatalog, selectedCountryId]
  );
  const availableCities = selectedCountry?.cities ?? [];
  const selectedCity = useMemo(
    () => availableCities.find((city) => city.id === selectedCityId) ?? null,
    [availableCities, selectedCityId]
  );
  const availableZones = selectedCity?.zones ?? [];
  const postOnboardingPath = useMemo(
    () => normalizePostAuthPath(sanitizeNextPath(searchParams.get("next"))),
    [searchParams]
  );

  const getLocationError = (code: string) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "location_invalid":
        return t("errors.locationInvalid");
      default:
        return t("errors.save");
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadGeoContext() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/geo", { cache: "no-store" });
        const payload = (await response.json()) as GeoPayload;

        if (!response.ok) {
          throw new Error("geo_load_failed");
        }

        if (!isMounted) {
          return;
        }

        setGeoCatalog(payload.countries ?? []);
        setCurrentLocation(payload.currentLocation);

        if (payload.currentLocation) {
          const initialCountryId = payload.currentLocation.countryId ?? payload.countries[0]?.id ?? "";
          const initialCountry =
            payload.countries.find((country) => country.id === initialCountryId) ??
            payload.countries[0] ??
            null;
          const initialCityId = payload.currentLocation.cityId ?? initialCountry?.cities[0]?.id ?? "";
          const initialCity =
            initialCountry?.cities.find((city) => city.id === initialCityId) ??
            initialCountry?.cities[0] ??
            null;
          const initialZoneId = payload.currentLocation.zoneId ?? initialCity?.zones[0]?.id ?? "";

          setSelectedCountryId(initialCountryId);
          setSelectedCityId(initialCityId);
          setSelectedZoneId(initialZoneId);
        }
      } catch {
        if (isMounted) {
          setError(t("errors.load"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGeoContext();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (availableCities.length === 0) {
      if (selectedCityId) setSelectedCityId("");
      if (selectedZoneId) setSelectedZoneId("");
      return;
    }

    if (!availableCities.some((city) => city.id === selectedCityId)) {
      setSelectedCityId(availableCities[0]?.id ?? "");
    }
  }, [availableCities, isAuthenticated, selectedCityId, selectedZoneId]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (availableZones.length === 0) {
      if (selectedZoneId) {
        setSelectedZoneId("");
      }
      return;
    }

    if (!availableZones.some((zone) => zone.id === selectedZoneId)) {
      setSelectedZoneId(availableZones[0]?.id ?? "");
    }
  }, [availableZones, isAuthenticated, selectedZoneId]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((slide) => slide + 1);
      return;
    }

    router.push(localizeHref(locale, "/signup"));
  };

  const handleSaveLocation = () => {
    setError(null);

    startSaving(async () => {
      const formData = new FormData();
      formData.set("countryId", selectedCountryId);
      formData.set("cityId", selectedCityId);
      formData.set("zoneId", selectedZoneId);

      const result = await updateCurrentUserLocation(formData);
      if (!result.ok) {
        setError(getLocationError(result.code));
        return;
      }

      router.push(localizeHref(locale, postOnboardingPath));
      router.refresh();
    });
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md animate-pulse space-y-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 text-white">
          <div className="h-10 w-10 rounded-2xl bg-white/10" />
          <div className="h-8 rounded-2xl bg-white/10" />
          <div className="h-20 rounded-[2rem] bg-white/10" />
          <div className="h-14 rounded-[1.5rem] bg-white/10" />
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    const activeZoneName =
      availableZones.find((zone) => zone.id === selectedZoneId)?.name ?? t("activeZoneFallback");

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),linear-gradient(160deg,rgba(15,23,42,0.98),rgba(2,6,23,0.94))] p-8 shadow-2xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300/70">
                  {t("brand")}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight">{t("marketTitle")}</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{t("marketBody")}</p>
              </div>
              <AppLogo
                size={56}
                priority
                className="h-14 w-14"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                  {t("country")}
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(event) => setSelectedCountryId(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/40"
                >
                  <option value="" disabled className="text-slate-900">
                    {t("selectCountry")}
                  </option>
                  {geoCatalog.map((country) => (
                    <option key={country.id} value={country.id} className="text-slate-900">
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                  {t("city")}
                </label>
                <select
                  value={selectedCityId}
                  onChange={(event) => setSelectedCityId(event.target.value)}
                  disabled={availableCities.length === 0}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/40 disabled:opacity-40"
                >
                  <option value="" disabled className="text-slate-900">
                    {t("selectCity")}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city.id} value={city.id} className="text-slate-900">
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                  {t("zone")}
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(event) => setSelectedZoneId(event.target.value)}
                  disabled={availableZones.length === 0}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white outline-none focus:border-cyan-400/40 disabled:opacity-40"
                >
                  <option value="" disabled className="text-slate-900">
                    {t("selectZone")}
                  </option>
                  {availableZones.map((zone) => (
                    <option key={zone.id} value={zone.id} className="text-slate-900">
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
              <div className="mb-2 flex items-center gap-3 text-cyan-200">
                <MapPin className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                  {t("activeZone")}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{activeZoneName}</p>
              <p className="mt-1 text-xs text-white/55">{t("activeZoneBody")}</p>
            </div>

            {error && (
              <div className="mt-5 rounded-[1.25rem] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={isSaving || !selectedCountryId || !selectedCityId || !selectedZoneId}
              className="mt-8 w-full rounded-[1.5rem] bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 shadow-xl shadow-cyan-400/20 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? t("saving") : t("activateMarket")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-black font-sans">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} opacity-40`}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-6 py-10">
        <div className="mb-8 flex h-10 items-center justify-between">
          {currentSlide > 0 ? (
            <button
              onClick={() => setCurrentSlide((slide) => slide - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <AppLogo size={40} priority className="h-10 w-10" />
          )}

          <button
            onClick={() => router.push(localizeHref(locale, "/signup"))}
            className="text-sm font-semibold uppercase tracking-wider text-white/70 transition hover:text-white"
          >
            {t("skip")}
          </button>
        </div>

        <div className="mt-[-10vh] flex flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex w-full flex-col items-center text-center"
            >
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/20 shadow-2xl backdrop-blur-2xl">
                {slides[currentSlide].icon}
              </div>

              <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white">
                {slides[currentSlide].title}
              </h1>

              <p className="max-w-[280px] text-[15px] font-medium leading-relaxed text-white/80">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-8 pb-4">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-white py-4 text-[15px] font-bold text-gray-900 shadow-xl shadow-white/10 transition-all hover:bg-gray-50 active:scale-95"
          >
            {currentSlide === slides.length - 1 ? t("start") : t("continue")}
            {currentSlide === slides.length - 1 ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
