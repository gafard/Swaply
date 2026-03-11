"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { publishItem } from "@/app/actions/item";
import { suggestListingFromImages, analyzePhotoQuality } from "@/app/actions/ai";
import { useUploadThing } from "@/lib/uploadthing";
import { type LucideIcon, Package, Camera, Clock, ShieldCheck, Check, AlertTriangle, Zap, Search, Sparkles, Info, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAIEstimation } from "@/lib/ai-engine";
import { PhotoQualityResult } from "@/lib/validations";
import PhotoScanner, { type PublishScanStep } from "@/components/publish/PhotoScanner";
import PricingSlider from "@/components/publish/PricingSlider";
import AIInsightsCard, { type PublishAIInsights } from "@/components/publish/AIInsightsCard";
import LocationSelector from "@/components/publish/LocationSelector";
import {
  findNearestZoneInCity,
  GeoCatalog,
} from "@/lib/geo";
import { localizeHref } from "@/lib/i18n/pathnames";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = src;
  });
}

async function optimizeImageForAI(file: File, maxDimension = 1280, quality = 0.82) {
  const sourceUrl = await readFileAsDataUrl(file);
  const image = await loadImageElement(sourceUrl);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);

  if (largestSide <= maxDimension) {
    return sourceUrl;
  }

  const scale = maxDimension / largestSide;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    return sourceUrl;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function PublishPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("publish");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [analysisPayloads, setAnalysisPayloads] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiError, setAiError] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creditValue, setCreditValue] = useState(100);
  const [geoCatalog, setGeoCatalog] = useState<GeoCatalog>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clientErrors, setClientErrors] = useState<Partial<Record<"title" | "description" | "creditValue" | "images" | "location", string>>>({});
  
  // Technical Details State (Electronics)
  const [techAge, setTechAge] = useState<string>("1_3_years");
  const [techAccessories, setTechAccessories] = useState<string[]>(["charger"]);
  const [techFunctionality, setTechFunctionality] = useState<string>("perfect");
  const [modelGuess, setModelGuess] = useState("");
  const [functionalStatus, setFunctionalStatus] = useState<"PERFECT" | "DEFECTIVE" | "BROKEN">("PERFECT");

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<PublishAIInsights>({});

  // Guided Scanner State
  const [currentStep, setCurrentStep] = useState(0);
  const [flowStep, setFlowStep] = useState(0);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityResults, setQualityResults] = useState<(PhotoQualityResult | null)[]>([null, null, null, null]);
  const estimationTimeoutRef = useRef<number | null>(null);
  const estimationRequestIdRef = useRef(0);
  const previewObjectUrlsRef = useRef<Record<number, string>>({});

  const scanSteps: PublishScanStep[] = [
    {
      label: t("scanner.steps.main.label"),
      desc: t("scanner.steps.main.description"),
      icon: Package,
      guide: t("scanner.steps.main.guide"),
    },
    {
      label: t("scanner.steps.back.label"),
      desc: t("scanner.steps.back.description"),
      icon: Camera,
      guide: t("scanner.steps.back.guide"),
    },
    {
      label: t("scanner.steps.details.label"),
      desc: t("scanner.steps.details.description"),
      icon: Search,
      guide: t("scanner.steps.details.guide"),
    },
    {
      label: t("scanner.steps.active.label"),
      desc: t("scanner.steps.active.description"),
      icon: Zap,
      guide: t("scanner.steps.active.guide"),
    },
  ];

  const normalizeCategory = (value?: string | null) =>
    (value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const isElectronicsCategory = (value?: string | null) => {
    const normalized = normalizeCategory(value);
    return (
      normalized === "electronique" ||
      normalized === "electronics" ||
      normalized === "electronica" ||
      normalized === "eletronicos"
    );
  };

  const isConditionInconsistent = aiInsights.visualStatus && (
    (aiInsights.visualStatus === "BROKEN" && functionalStatus === "PERFECT") ||
    (aiInsights.visualStatus === "DEFECTIVE" && functionalStatus === "PERFECT")
  );

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
  const selectedZone = useMemo(
    () => availableZones.find((zone) => zone.id === selectedZoneId) ?? null,
    [availableZones, selectedZoneId]
  );
  const isElectronics = isElectronicsCategory(aiInsights.category);
  const photoCount = photoPreviews.filter(Boolean).length;
  const uploadedImageCount = imageUrls.filter(Boolean).length;
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  const scannerErrorMessage = clientErrors.images || uploadError || (aiError ? t("errors.aiPhotoQuality") : null);
  const conditionOptions = [
    {
      id: "PERFECT",
      label: t("condition.options.perfect.label"),
      desc: t("condition.options.perfect.description"),
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      techId: "perfect",
    },
    ...(isElectronics
      ? [
          {
            id: "BATTERY_LOW",
            label: t("condition.options.batteryLow.label"),
            desc: t("condition.options.batteryLow.description"),
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100",
            techId: "battery_low",
          },
        ]
      : []),
    {
      id: "DEFECTIVE",
      label: t("condition.options.defective.label"),
      desc: t("condition.options.defective.description"),
      icon: Info,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      techId: "defect",
    },
    {
      id: "BROKEN",
      label: t("condition.options.broken.label"),
      desc: t("condition.options.broken.description"),
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
      techId: "defect",
    },
  ];
  const ageOptions = [
    { id: "less_than_1_year", label: t("technical.age.lessThanOneYear") },
    { id: "1_3_years", label: t("technical.age.oneToThreeYears") },
    { id: "more_than_3_years", label: t("technical.age.moreThanThreeYears") },
  ];
  const accessoryOptions = [
    { id: "box", label: t("technical.accessories.box") },
    { id: "charger", label: t("technical.accessories.charger") },
    { id: "cables", label: t("technical.accessories.cables") },
  ];
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setUploadError(null);
      clearClientError("images");
    },
    onUploadError: (error) => {
      setUploadError(error.message);
    },
  });
  const flowSteps: Array<{
    id: "photos" | "analysis" | "details" | "pricing" | "publish";
    label: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    surface: string;
    glow: string;
  }> = [
    {
      id: "photos",
      label: t("flow.steps.photos.label"),
      description: t("flow.steps.photos.description"),
      icon: Camera,
      accent: "from-[#102a72] via-[#2457ff] to-[#78c8ff]",
      surface: "border-[#d7e4ff] bg-[#edf4ff]",
      glow: "shadow-[0_22px_55px_rgba(36,87,255,0.18)]",
    },
    {
      id: "analysis",
      label: t("flow.steps.analysis.label"),
      description: t("flow.steps.analysis.description"),
      icon: Sparkles,
      accent: "from-[#2c145f] via-[#5b2be0] to-[#8f7cff]",
      surface: "border-[#e4dbff] bg-[#f5f1ff]",
      glow: "shadow-[0_22px_55px_rgba(91,43,224,0.18)]",
    },
    {
      id: "details",
      label: t("flow.steps.details.label"),
      description: t("flow.steps.details.description"),
      icon: Info,
      accent: "from-[#123c52] via-[#1983a6] to-[#7ad8e6]",
      surface: "border-[#d6eef4] bg-[#eefbfd]",
      glow: "shadow-[0_22px_55px_rgba(25,131,166,0.18)]",
    },
    {
      id: "pricing",
      label: t("flow.steps.pricing.label"),
      description: t("flow.steps.pricing.description"),
      icon: Zap,
      accent: "from-[#3d2611] via-[#e88922] to-[#ffd36b]",
      surface: "border-[#f8dfb8] bg-[#fff5df]",
      glow: "shadow-[0_22px_55px_rgba(232,137,34,0.18)]",
    },
    {
      id: "publish",
      label: t("flow.steps.publish.label"),
      description: t("flow.steps.publish.description"),
      icon: MapPin,
      accent: "from-[#0b3340] via-[#0f766e] to-[#5ed4bf]",
      surface: "border-[#d0efe9] bg-[#ebfaf7]",
      glow: "shadow-[0_22px_55px_rgba(15,118,110,0.18)]",
    },
  ];
  const isPhotosStepComplete = photoCount >= 2 && !isCheckingQuality;
  const isAnalysisStepComplete = isPhotosStepComplete && !isAnalyzing;
  const isDetailsStepComplete =
    normalizedTitle.length >= 2 &&
    (normalizedDescription.length === 0 || normalizedDescription.length >= 5);
  const isPricingStepComplete =
    Number.isFinite(creditValue) && !Number.isNaN(creditValue) && creditValue >= 10;
  const isPublishStepComplete = Boolean(selectedCountryId && selectedCityId && selectedZoneId);
  const flowCompletion = [
    isPhotosStepComplete,
    isAnalysisStepComplete,
    isDetailsStepComplete,
    isPricingStepComplete,
    isPublishStepComplete,
  ];
  const canAccessFlowStep = (index: number) =>
    index === 0 || flowCompletion.slice(0, index).every(Boolean);
  const maxUnlockedFlowStep = flowSteps.reduce(
    (currentMax, _step, index) => (canAccessFlowStep(index) ? index : currentMax),
    0
  );
  const currentFlowMeta = flowSteps[flowStep];
  const CurrentFlowIcon = currentFlowMeta.icon;
  const flowProgress = Math.round(((flowStep + 1) / flowSteps.length) * 100);

  const clearClientError = useCallback(
    (field: keyof typeof clientErrors) => {
      setClientErrors((previous) => {
        if (!previous[field]) {
          return previous;
        }

        const next = { ...previous };
        delete next[field];
        return next;
      });
    },
    []
  );

  const revokePreviewAtIndex = useCallback((index: number) => {
    const existingUrl = previewObjectUrlsRef.current[index];
    if (existingUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(existingUrl);
    }
    delete previewObjectUrlsRef.current[index];
  }, []);

  const revokeAllPreviewUrls = useCallback(() => {
    Object.keys(previewObjectUrlsRef.current).forEach((index) => {
      revokePreviewAtIndex(Number(index));
    });
  }, [revokePreviewAtIndex]);

  const cancelScheduledEstimation = useCallback(() => {
    if (estimationTimeoutRef.current) {
      clearTimeout(estimationTimeoutRef.current);
      estimationTimeoutRef.current = null;
    }
    estimationRequestIdRef.current += 1;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadGeoCatalog() {
      setIsLoadingGeo(true);
      setGeoError(null);

      try {
        const response = await fetch("/api/geo", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || t("errors.loadGeo"));
        }

        if (!isMounted) {
          return;
        }

        const countries = (payload?.countries ?? []) as GeoCatalog;
        const currentLocation = payload?.currentLocation;
        setGeoCatalog(countries);

        const initialCountryId = currentLocation?.countryId ?? countries[0]?.id ?? "";
        const initialCountry =
          countries.find((country) => country.id === initialCountryId) ?? countries[0] ?? null;
        const initialCityId =
          currentLocation?.cityId ?? initialCountry?.cities[0]?.id ?? "";
        const initialCity =
          initialCountry?.cities.find((city) => city.id === initialCityId) ??
          initialCountry?.cities[0] ??
          null;
        const initialZoneId =
          currentLocation?.zoneId ?? initialCity?.zones[0]?.id ?? "";

        setSelectedCountryId(initialCountryId);
        setSelectedCityId(initialCityId);
        setSelectedZoneId(initialZoneId);
      } catch (error) {
        if (isMounted) {
          setGeoError(
            error instanceof Error
              ? error.message
              : t("errors.loadGeo")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingGeo(false);
        }
      }
    }

    loadGeoCatalog();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    if (availableCities.length === 0) {
      if (selectedCityId) {
        setSelectedCityId("");
      }
      if (selectedZoneId) {
        setSelectedZoneId("");
      }
      return;
    }

    if (!availableCities.some((city) => city.id === selectedCityId)) {
      setSelectedCityId(availableCities[0]?.id ?? "");
    }
  }, [availableCities, selectedCityId, selectedZoneId]);

  useEffect(() => {
    if (availableZones.length === 0) {
      if (selectedZoneId) {
        setSelectedZoneId("");
      }
      return;
    }

    if (!availableZones.some((zone) => zone.id === selectedZoneId)) {
      setSelectedZoneId(availableZones[0]?.id ?? "");
    }
  }, [availableZones, selectedZoneId]);

  useEffect(() => {
    if (!coords || selectedZoneId || availableZones.length === 0) {
      return;
    }

    const nearest = findNearestZoneInCity(availableZones, coords.lat, coords.lng);
    if (nearest) {
      setSelectedZoneId(nearest.id);
      setGpsError(null);
      clearClientError("location");
    }
  }, [availableZones, clearClientError, coords, selectedZoneId]);

  useEffect(() => {
    if (selectedZoneId && gpsError) {
      setGpsError(null);
    }
  }, [gpsError, selectedZoneId]);

  useEffect(() => {
    return () => {
      cancelScheduledEstimation();
      revokeAllPreviewUrls();
    };
  }, [cancelScheduledEstimation, revokeAllPreviewUrls]);

  useEffect(() => {
    if (!canAccessFlowStep(flowStep)) {
      setFlowStep(maxUnlockedFlowStep);
    }
  }, [flowStep, maxUnlockedFlowStep]);

  const requestLocation = useCallback(() => {
    if (coords || isRequestingLocation) {
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGpsError(t("errors.gpsNotSupported"));
      return;
    }

    setIsRequestingLocation(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsRequestingLocation(false);
      },
      (error) => {
        setIsRequestingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError(t("errors.gpsPermissionDenied"));
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError(t("errors.gpsUnavailable"));
            break;
          case error.TIMEOUT:
            setGpsError(t("errors.gpsTimeout"));
            break;
          default:
            setGpsError(t("errors.locationUnavailable"));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 300_000,
      }
    );
  }, [coords, isRequestingLocation, t]);

  const runEstimation = useCallback(
    async (
      requestId: number,
      updatedInsights = aiInsights,
      age = techAge,
      func = techFunctionality,
      accs = techAccessories
    ) => {
      if (!isElectronicsCategory(updatedInsights.category) || !updatedInsights.confidence) {
        return;
      }

      const suggestion = {
        category: updatedInsights.category as any,
        subcategory: updatedInsights.subcategory || "",
        brand: updatedInsights.brand || "unknown",
        condition: (updatedInsights.condition as any) || "good",
        visualStatus: updatedInsights.visualStatus || "PERFECT",
        rarity: (updatedInsights.rarity as any) || "common",
        fraudRisk: (updatedInsights.fraudRisk as any) || "low",
        isStockPhoto: updatedInsights.isStockPhoto || false,
        flags: updatedInsights.flags || [],
        confidence: updatedInsights.confidence,
        title,
        description,
      };

      const newEstimation = await calculateAIEstimation(suggestion, {
        age,
        functionality: func,
        accessories: accs,
      });

      if (requestId !== estimationRequestIdRef.current) {
        return;
      }

      setAiInsights((previous) => ({ ...previous, estimation: newEstimation }));
      setCreditValue(newEstimation.suggestedValue);
    },
    [aiInsights, description, techAccessories, techAge, techFunctionality, title]
  );

  const refreshEstimation = useCallback(
    (
      updatedInsights = aiInsights,
      age = techAge,
      func = techFunctionality,
      accs = techAccessories
    ) => {
      cancelScheduledEstimation();

      if (!isElectronicsCategory(updatedInsights.category) || !updatedInsights.confidence) {
        return;
      }

      const requestId = estimationRequestIdRef.current;
      estimationTimeoutRef.current = window.setTimeout(() => {
        estimationTimeoutRef.current = null;
        void runEstimation(requestId, updatedInsights, age, func, accs);
      }, 320);
    },
    [aiInsights, cancelScheduledEstimation, runEstimation, techAccessories, techAge, techFunctionality]
  );

  const validateClientForm = useCallback(() => {
    const nextErrors: Partial<Record<"title" | "description" | "creditValue" | "images" | "location", string>> = {};

    if (uploadedImageCount < 2) {
      nextErrors.images = t("errors.imagesRequired");
    }

    if (title.trim().length < 2) {
      nextErrors.title = t("errors.titleInvalid");
    }

    const normalizedDescription = description.trim();
    if (normalizedDescription.length > 0 && normalizedDescription.length < 5) {
      nextErrors.description = t("errors.descriptionInvalid");
    }

    if (!Number.isFinite(creditValue) || Number.isNaN(creditValue) || creditValue < 0) {
      nextErrors.creditValue = t("errors.priceInvalid");
    }

    if (!selectedCountryId || !selectedCityId || !selectedZoneId) {
      nextErrors.location = t("errors.locationUnavailable");
    }

    setClientErrors(nextErrors);
    return nextErrors;
  }, [creditValue, description, selectedCityId, selectedCountryId, selectedZoneId, t, title, uploadedImageCount]);

  const analyzeImages = async (base64Array: string[]) => {
    setIsAnalyzing(true);
    setAiError(false);
    try {
      const suggestion = await suggestListingFromImages(base64Array);
      
      if (suggestion.title) setTitle(suggestion.title);
      if (suggestion.description) setDescription(suggestion.description);
      if (suggestion.modelGuess) setModelGuess(suggestion.modelGuess);
      
      const insights: PublishAIInsights = {
        category: suggestion.category,
        subcategory: suggestion.subcategory,
        brand: suggestion.brand,
        condition: suggestion.condition,
        visualStatus: suggestion.visualStatus,
        rarity: suggestion.rarity,
        fraudRisk: suggestion.fraudRisk,
        isStockPhoto: suggestion.isStockPhoto,
        flags: suggestion.flags,
        confidence: suggestion.confidence,
        estimation: suggestion.estimation
      };
      
      setAiInsights(insights);

      if (suggestion.estimation) {
        setCreditValue(suggestion.estimation.suggestedValue);
      }

      if (isElectronicsCategory(suggestion.category)) {
        refreshEstimation(insights);
      }
      
      if (!suggestion.estimation) {
        setAiError(true);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setAiError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images total
    const isReplacingCurrentStep = Boolean(photoPreviews[currentStep]);
    const remainingSlots = 4 - photoCount + (isReplacingCurrentStep ? 1 : 0);
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setUploadError(t("errors.maxPhotos"));
      return;
    }

    clearClientError("images");
    requestLocation();

    // 1. Process all files
    const totalSlots = 4;
    const targetStep = currentStep;
    
    // Create copies to update
    let nextPreviews = [...photoPreviews];
    let nextUrls = [...imageUrls];
    let nextPayloads = [...analysisPayloads];
    let nextQuality = [...qualityResults];

    setIsCheckingQuality(true);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const stepToIndex = (targetStep + i) % totalSlots;

        revokePreviewAtIndex(stepToIndex);
        const previewUrl = URL.createObjectURL(file);
        previewObjectUrlsRef.current[stepToIndex] = previewUrl;
        nextPreviews[stepToIndex] = previewUrl;

        try {
          const base64 = await optimizeImageForAI(file);
          nextPayloads[stepToIndex] = base64;
          const quality = await analyzePhotoQuality(base64, stepToIndex);
          const resolvedQuality = quality as PhotoQualityResult;

          if (resolvedQuality.analysisError) {
            nextQuality[stepToIndex] = null;
          } else {
            nextQuality[stepToIndex] = resolvedQuality;

            if (stepToIndex === 0 && resolvedQuality.objectDetected) {
              if (!title) setTitle(resolvedQuality.objectDetected);
              setAiInsights((prev) => ({
                ...prev,
                subcategory: resolvedQuality.objectDetected || undefined,
                brand: resolvedQuality.brandDetected || undefined,
                confidence: resolvedQuality.qualityScore,
              }));
            }
          }

          const result = await startUpload([file]);
          if (result) {
            nextUrls[stepToIndex] = result[0].ufsUrl;
          }
        } catch (err) {
          console.error("Upload error for file", i, err);
        }
      }
    } finally {
      setIsCheckingQuality(false);
    }

    setPhotoPreviews(nextPreviews);
    setImageUrls(nextUrls);
    setAnalysisPayloads(nextPayloads);
    setQualityResults(nextQuality);
    setUploadError(null);

    // Auto-advance logic: find first empty step
    const firstEmpty = nextPreviews.findIndex((p, idx) => !p && idx < totalSlots);
    if (firstEmpty !== -1) {
      setCurrentStep(firstEmpty);
    } else {
      // All filled, maybe go to last or stay? Stay for now.
    }

    // Overall analysis if 2+
    if (nextPayloads.filter(Boolean).length >= 2) {
      try {
        const allBase64 = nextPayloads.filter(Boolean);
        void analyzeImages(allBase64);
      } catch (err) {
        console.error("Analysis skip: failed to prepare base64", err);
      }
    }

    e.target.value = "";
  };

  const isOutOfRange = Boolean(
    aiInsights.estimation &&
      (creditValue < aiInsights.estimation.minSuggestedValue ||
        creditValue > aiInsights.estimation.maxSuggestedValue)
  );

  const getPublishErrorMessage = (code: string) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "title_invalid":
        return t("errors.titleInvalid");
      case "description_invalid":
        return t("errors.descriptionInvalid");
      case "price_invalid":
        return t("errors.priceInvalid");
      case "images_required":
        return t("errors.imagesRequired");
      case "location_unavailable":
        return t("errors.locationUnavailable");
      default:
        return t("errors.generic");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateClientForm();
    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors)[0] ?? t("errors.generic"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await publishItem(new FormData(event.currentTarget));
      if (!result.ok) {
        toast.error(getPublishErrorMessage(result.code));
        return;
      }

      toast.success(
        result.data?.awardedFirstPublishBonus ? t("successWithBonus") : t("success")
      );
      router.push(
        localizeHref(
          locale,
          result.data?.itemId ? `/item/${result.data.itemId}` : "/profile/items"
        )
      );
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScanner = useCallback(() => {
    cancelScheduledEstimation();
    revokeAllPreviewUrls();
    setFlowStep(0);
    setPhotoPreviews([]);
    setImageUrls([]);
    setAnalysisPayloads([]);
    setQualityResults([null, null, null, null]);
    setCurrentStep(0);
    setUploadError(null);
    setAiError(false);
    clearClientError("images");
  }, [cancelScheduledEstimation, clearClientError, revokeAllPreviewUrls]);

  const goToNextFlowStep = useCallback(() => {
    setFlowStep((current) => Math.min(current + 1, maxUnlockedFlowStep));
  }, [maxUnlockedFlowStep]);

  const goToPreviousFlowStep = useCallback(() => {
    setFlowStep((current) => Math.max(current - 1, 0));
  }, []);

  const isFinalFlowStep = flowStep === flowSteps.length - 1;
  const isNextFlowDisabled =
    !flowCompletion[flowStep] ||
    (flowStep === 0 && isCheckingQuality);
  const isSubmitDisabled =
    isSubmitting ||
    isUploading ||
    isAnalyzing ||
    uploadedImageCount < 2 ||
    isLoadingGeo ||
    !selectedZoneId;

  return (
    <main className="min-h-screen bg-transparent flex flex-col pb-24 sm:pb-8">
      
      {/* 1. App Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/70 bg-[#f8f2e9]/80 px-5 pb-5 pt-10 backdrop-blur-2xl">
        <div>
          <h1 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-foreground">{t("title")}</h1>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[24px] border border-white/80 bg-white/80 shadow-[0_16px_35px_rgba(36,87,255,0.12)] transition-colors">
           <Package className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="z-10 flex-1 w-full px-5 pt-7">
        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
          <input type="hidden" name="latitude" value={coords?.lat || ""} />
          <input type="hidden" name="longitude" value={coords?.lng || ""} />
          <input type="hidden" name="countryId" value={selectedCountryId} />
          <input type="hidden" name="cityId" value={selectedCityId} />
          <input type="hidden" name="zoneId" value={selectedZoneId} />
          <input type="hidden" name="locationZone" value={selectedZone?.name || ""} />
          
          {/* AI insights hidden fields */}
          <input type="hidden" name="category" value={aiInsights.category || ""} />
          <input type="hidden" name="subcategory" value={aiInsights.subcategory || ""} />
          <input type="hidden" name="brand" value={aiInsights.brand || ""} />
          <input type="hidden" name="condition" value={aiInsights.condition || ""} />
          <input type="hidden" name="rarity" value={aiInsights.rarity || "common"} />
          <input type="hidden" name="fraudRisk" value={aiInsights.fraudRisk || "low"} />
          <input type="hidden" name="aiConfidence" value={aiInsights.confidence || ""} />
          
          <input type="hidden" name="suggestedValue" value={aiInsights.estimation?.suggestedValue || ""} />
          <input type="hidden" name="minSuggestedValue" value={aiInsights.estimation?.minSuggestedValue || ""} />
          <input type="hidden" name="maxSuggestedValue" value={aiInsights.estimation?.maxSuggestedValue || ""} />
          <input type="hidden" name="aiExplanation" value={aiInsights.estimation ? JSON.stringify(aiInsights.estimation.details) : ""} />
          
          {/* Technical and Functional hidden fields */}
          <input type="hidden" name="techAge" value={techAge} />
          <input type="hidden" name="techAccessories" value={techAccessories.join(",")} />
          <input type="hidden" name="techFunctionality" value={techFunctionality} />
          <input type="hidden" name="modelGuess" value={modelGuess} />
          <input type="hidden" name="functionalStatus" value={functionalStatus} />
          <input type="hidden" name="isNotifiedDefective" value={isConditionInconsistent ? "true" : "false"} />
          <div className="space-y-6">
            <div className="paper-panel relative overflow-hidden rounded-[36px] p-5 sm:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,255,0.16),_transparent_42%),radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_46%)]" />
              <div className="pointer-events-none absolute -right-8 top-6 h-28 w-28 rounded-full bg-white/45 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-[0_12px_26px_rgba(16,32,58,0.08)]">
                    <CurrentFlowIcon className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                      {t("flow.badge")}
                    </p>
                  </div>
                  <h2 className="ink-title mt-4 text-[1.8rem] font-bold leading-none sm:text-[2rem]">
                    {currentFlowMeta.label}
                  </h2>
                  <p className="mt-2 max-w-[28rem] text-sm font-medium leading-6 text-slate-500">
                    {currentFlowMeta.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-[28px] border px-4 py-3 text-right backdrop-blur-xl",
                    currentFlowMeta.surface,
                    currentFlowMeta.glow
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {t("flow.counter", {
                      current: flowStep + 1,
                      total: flowSteps.length,
                    })}
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">{flowProgress}%</p>
                </div>
              </div>

              <div className="relative mt-6 h-3 overflow-hidden rounded-full bg-white/80 shadow-[inset_0_1px_3px_rgba(16,32,58,0.06)]">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                    currentFlowMeta.accent
                  )}
                  style={{ width: `${flowProgress}%` }}
                />
              </div>

              <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
                {flowSteps.map((step, index) => {
                  const isActive = flowStep === index;
                  const isUnlocked = canAccessFlowStep(index);
                  const isComplete = flowCompletion[index];
                  const StepIcon = step.icon;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => setFlowStep(index)}
                      className={cn(
                        "min-w-[148px] rounded-[24px] border px-3 py-3 text-left transition-all duration-300",
                        isActive
                          ? cn("border-transparent text-white shadow-xl", step.accent, step.glow)
                          : isComplete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : isUnlocked
                              ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              : "border-slate-100 bg-slate-50 text-slate-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-2xl border",
                            isActive
                              ? "border-white/20 bg-white/15 text-white"
                              : isComplete
                                ? "border-emerald-200 bg-white text-emerald-600"
                                : "border-slate-200 bg-slate-50 text-slate-400"
                          )}
                        >
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] opacity-75">
                          0{index + 1}
                        </span>
                      </div>
                      <span className="mt-3 block text-[11px] font-black leading-tight">
                        {step.label}
                      </span>
                      <span className="mt-1 block text-[10px] font-medium leading-4 opacity-75">
                        {step.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {flowStep === 0 ? (
                <motion.div
                  key="flow-photos"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <PhotoScanner
                    currentStep={currentStep}
                    errorMessage={scannerErrorMessage}
                    isCheckingQuality={isCheckingQuality}
                    onFileChange={handleImageChange}
                    onReset={resetScanner}
                    onStepChange={setCurrentStep}
                    photoPreviews={photoPreviews}
                    qualityResults={qualityResults}
                    scanSteps={scanSteps}
                  />

                  {photoCount > 0 && uploadedImageCount < 2 ? (
                    <div className="flex items-center justify-center gap-2 animate-bounce">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {t("addOneMorePhoto")}
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}

              {flowStep === 1 ? (
                <motion.div
                  key="flow-analysis"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                {photoPreviews.length > 0 ? (
                  <div className="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-inner">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black tracking-tight text-slate-900">
                            {t("condition.title")}
                          </h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {t("condition.subtitle")}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1">
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none text-rose-500">
                          {t("condition.required")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {conditionOptions.map((status) => (
                        <button
                          key={status.id}
                          type="button"
                          onClick={() => {
                            setFunctionalStatus(status.id as any);
                            if (isElectronics) {
                              setTechFunctionality(status.techId);
                              refreshEstimation(aiInsights, techAge, status.techId);
                            }
                          }}
                          className={cn(
                            "group flex items-center gap-4 rounded-[2rem] border p-5 transition-all duration-500",
                            functionalStatus === status.id
                              ? "border-indigo-500 bg-white -translate-y-1 shadow-2xl shadow-indigo-100/50"
                              : "border-transparent bg-slate-50/50 hover:border-slate-200"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-colors duration-500",
                              functionalStatus === status.id
                                ? "border-indigo-400 bg-indigo-600 text-white"
                                : `${status.bg} ${status.color} ${status.border}`
                            )}
                          >
                            <status.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={cn(
                                "text-sm font-black tracking-tight transition-colors",
                                functionalStatus === status.id ? "text-indigo-900" : "text-slate-800"
                              )}
                            >
                              {status.label}
                            </p>
                            <p className="text-[11px] font-medium leading-tight text-slate-400">
                              {status.desc}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500",
                              functionalStatus === status.id
                                ? "scale-110 border-indigo-600 bg-indigo-600"
                                : "border-slate-200 group-hover:border-slate-300"
                            )}
                          >
                            {functionalStatus === status.id ? (
                              <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>

                    {isConditionInconsistent ? (
                      <div className="flex gap-4 rounded-[2.5rem] border border-amber-200 bg-amber-50/80 p-5 backdrop-blur-md animate-in zoom-in duration-700">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-2xl border border-amber-200 bg-white shadow-sm">
                          <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t("condition.consistencyAlertTitle")}
                          </p>
                          <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                            {t.rich("condition.consistencyAlertBody", {
                              status:
                                aiInsights.visualStatus === "BROKEN"
                                  ? t("condition.visualStatus.broken")
                                  : t("condition.visualStatus.defective"),
                              strong: (chunks) => (
                                <span className="underline decoration-amber-400 decoration-2 underline-offset-2">
                                  {chunks}
                                </span>
                              ),
                            })}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {aiInsights.isStockPhoto ? (
                      <div className="flex gap-4 rounded-[2.5rem] bg-slate-900 p-5 shadow-2xl">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 shadow-inner">
                          <Camera className="h-6 w-6 text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                            {t("catalogPhoto.title")}
                          </p>
                          <p className="text-[11px] font-medium leading-relaxed text-slate-400">
                            {t.rich("catalogPhoto.body", {
                              strong: (chunks) => (
                                <span className="font-black text-white underline">{chunks}</span>
                              ),
                            })}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {photoPreviews.length > 0 ? (
                  aiInsights.category || isAnalyzing ? (
                    <AIInsightsCard
                      accessoryOptions={accessoryOptions}
                      ageOptions={ageOptions}
                      aiInsights={aiInsights}
                      isAnalyzing={isAnalyzing}
                      isElectronics={isElectronics}
                      modelGuess={modelGuess}
                      onAccessoryToggle={(accessoryId) => {
                        const nextAccessories = techAccessories.includes(accessoryId)
                          ? techAccessories.filter((item) => item !== accessoryId)
                          : [...techAccessories, accessoryId];
                        setTechAccessories(nextAccessories);
                        refreshEstimation(aiInsights, techAge, techFunctionality, nextAccessories);
                      }}
                      onAgeChange={(ageId) => {
                        setTechAge(ageId);
                        refreshEstimation(aiInsights, ageId);
                      }}
                      onModelGuessChange={setModelGuess}
                      techAccessories={techAccessories}
                      techAge={techAge}
                    />
                  ) : (
                    <div className="rounded-[32px] border border-slate-200/70 bg-[#F8FAFC] p-6 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {t("flow.aiFallback.title")}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                        {t("flow.aiFallback.body")}
                      </p>
                    </div>
                  )
                ) : null}
                </motion.div>
              ) : null}

              {flowStep === 2 ? (
                <motion.div
                  key="flow-details"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[32px] border border-border bg-surface p-7 shadow-sm space-y-6"
                >
                <div className="flex items-center gap-3 px-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 text-primary">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {t("details.title")}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      {t("details.subtitle")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="title">
                    {t("details.fields.title")}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      clearClientError("title");
                    }}
                    aria-invalid={Boolean(clientErrors.title)}
                    aria-describedby={clientErrors.title ? "title-error" : undefined}
                    className={cn(
                      "w-full rounded-2xl border bg-surface px-4 py-3.5 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted focus:border-slate-400",
                      clientErrors.title ? "border-rose-300" : "border-border"
                    )}
                    placeholder={t("details.placeholders.title")}
                  />
                  {clientErrors.title ? (
                    <p id="title-error" role="alert" className="mt-2 text-[11px] font-bold text-rose-600">
                      {clientErrors.title}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="description">
                    {t("details.fields.descriptionOptional")}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearClientError("description");
                    }}
                    aria-invalid={Boolean(clientErrors.description)}
                    aria-describedby={clientErrors.description ? "description-error" : undefined}
                    className={cn(
                      "w-full resize-none rounded-2xl border bg-surface px-4 py-3.5 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted focus:border-slate-400",
                      clientErrors.description ? "border-rose-300" : "border-border"
                    )}
                    placeholder={t("details.placeholders.description")}
                  />
                  {clientErrors.description ? (
                    <p id="description-error" role="alert" className="mt-2 text-[11px] font-bold text-rose-600">
                      {clientErrors.description}
                    </p>
                  ) : null}
                </div>
                </motion.div>
              ) : null}

              {flowStep === 3 ? (
                <motion.div
                  key="flow-pricing"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PricingSlider
                    creditValue={creditValue}
                    errorMessage={clientErrors.creditValue}
                    estimation={aiInsights.estimation}
                    isOutOfRange={Boolean(isOutOfRange)}
                    onChange={(value) => {
                      setCreditValue(value);
                      clearClientError("creditValue");
                    }}
                  />
                </motion.div>
              ) : null}

              {flowStep === 4 ? (
                <motion.div
                  key="flow-publish"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                <LocationSelector
                  availableCities={availableCities}
                  availableZones={availableZones}
                  clientError={clientErrors.location}
                  geoCatalog={geoCatalog}
                  geoError={geoError}
                  gpsError={gpsError}
                  isDetectingZone={Boolean(
                    (isRequestingLocation || (coords && !selectedZoneId)) &&
                      !isLoadingGeo &&
                      !gpsError
                  )}
                  isLoadingGeo={isLoadingGeo}
                  onCityChange={(cityId) => {
                    setSelectedCityId(cityId);
                    clearClientError("location");
                  }}
                  onCountryChange={(countryId) => {
                    setSelectedCountryId(countryId);
                    clearClientError("location");
                  }}
                  onZoneChange={(zoneId) => {
                    setSelectedZoneId(zoneId);
                    clearClientError("location");
                  }}
                  selectedCityId={selectedCityId}
                  selectedCountryId={selectedCountryId}
                  selectedZone={selectedZone}
                  selectedZoneId={selectedZoneId}
                />

                <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {t("flow.summary.title")}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#fff7ec,_#ffffff)] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {t("flow.summary.item")}
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {normalizedTitle || t("flow.summary.itemFallback")}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-slate-500">
                        {t("flow.summary.photos", { count: uploadedImageCount })}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#f6f3ff,_#ffffff)] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {t("flow.summary.price")}
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {creditValue} {t("pricing.creditsShort")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,_#eefbf8,_#ffffff)] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {t("flow.summary.zone")}
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {selectedZone?.name || t("flow.summary.zoneFallback")}
                      </p>
                    </div>
                  </div>
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="relative sticky bottom-4 z-30 space-y-4 pb-4 pt-2">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f6f1e8] via-[#f6f1e8]/86 to-transparent blur-xl" />
              <div className="paper-panel relative overflow-hidden rounded-[28px] p-3">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                <div
                  className={cn(
                    "grid gap-3",
                    flowStep === 0 ? "grid-cols-1" : "grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]"
                  )}
                >
                  {flowStep > 0 ? (
                    <button
                      type="button"
                      onClick={goToPreviousFlowStep}
                      className="flex items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-white px-4 py-5 text-sm font-black text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("flow.back")}
                    </button>
                  ) : null}

                  {flowStep < flowSteps.length - 1 ? (
                    <button
                      type="button"
                      disabled={isNextFlowDisabled}
                      onClick={goToNextFlowStep}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r px-4 py-5 text-[16px] font-bold text-white shadow-cta transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none",
                        currentFlowMeta.accent
                      )}
                    >
                      {t("flow.next")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className={cn(
                        "flex w-full items-center justify-center rounded-[20px] bg-gradient-to-r px-4 py-5 text-[16px] font-bold text-white shadow-cta transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:text-white disabled:shadow-none",
                        currentFlowMeta.accent,
                        uploadedImageCount < 2 && "opacity-60 grayscale-[0.5]"
                      )}
                    >
                      {isSubmitting
                        ? t("submitting")
                        : isUploading
                          ? t("uploading")
                          : isAnalyzing
                            ? t("analyzing")
                            : t("flow.submit")}
                    </button>
                  )}
                </div>
              </div>

              {isFinalFlowStep ? (
                <p className="mt-6 px-8 text-center text-[10px] font-bold uppercase tracking-widest leading-relaxed text-muted opacity-60">
                  {t("terms")}
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
