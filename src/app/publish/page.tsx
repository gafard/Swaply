"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { publishItem } from "@/app/actions/item";
import { suggestListingFromImages, analyzePhotoQuality } from "@/app/actions/ai";
import { useUploadThing } from "@/lib/uploadthing";
import { Package, Camera, Info, Sparkles, Wand2, Laptop, Clock, ShieldCheck, Headphones, Check, Star, AlertTriangle, Zap, Search, RefreshCw, ArrowRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAIEstimation } from "@/lib/ai-engine";
import { PhotoQualityResult, AIEstimation } from "@/lib/validations";
import JustificationCard from "@/components/JustificationCard";
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

export default function PublishPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("publish");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiError, setAiError] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creditValue, setCreditValue] = useState(100);
  const [geoCatalog, setGeoCatalog] = useState<GeoCatalog>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Technical Details State (Electronics)
  const [techAge, setTechAge] = useState<string>("1_3_years");
  const [techAccessories, setTechAccessories] = useState<string[]>(["charger"]);
  const [techFunctionality, setTechFunctionality] = useState<string>("perfect");
  const [modelGuess, setModelGuess] = useState("");
  const [functionalStatus, setFunctionalStatus] = useState<"PERFECT" | "DEFECTIVE" | "BROKEN">("PERFECT");

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<{
    category?: string;
    subcategory?: string;
    brand?: string;
    condition?: string;
    visualStatus?: "PERFECT" | "DEFECTIVE" | "BROKEN";
    rarity?: string;
    fraudRisk?: string;
    isStockPhoto?: boolean;
    flags?: string[];
    confidence?: number;
    estimation?: AIEstimation;
  }>({});

  // Guided Scanner State
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityResults, setQualityResults] = useState<(PhotoQualityResult | null)[]>([null, null, null, null]);

  const scanSteps = [
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

  // Recalculate estimation when tech details change (only for electronics)
  const refreshEstimation = async (updatedInsights = aiInsights, age = techAge, func = techFunctionality, accs = techAccessories) => {
    if (isElectronicsCategory(updatedInsights.category) && updatedInsights.confidence) {
       // We need to pass the base suggestion to the engine
       const suggestion = {
         category: updatedInsights.category as any,
         subcategory: updatedInsights.subcategory || "",
         brand: updatedInsights.brand || "unknown",
         condition: updatedInsights.condition as any || "good",
         visualStatus: updatedInsights.visualStatus || "PERFECT",
         rarity: updatedInsights.rarity as any || "common",
         fraudRisk: updatedInsights.fraudRisk as any || "low",
         isStockPhoto: updatedInsights.isStockPhoto || false,
         flags: updatedInsights.flags || [],
         confidence: updatedInsights.confidence,
         title: title,
         description: description
       };

       const newEstimation = await calculateAIEstimation(suggestion, {
         age,
         functionality: func,
         accessories: accs
       });

       setAiInsights(prev => ({ ...prev, estimation: newEstimation }));
       setCreditValue(newEstimation.suggestedValue);
    }
  };

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    uploadProgressGranularity: "fine",
    onUploadBegin: () => {
      setUploadError(null);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onUploadError: (error) => {
      setUploadError(error.message);
      setUploadProgress(0);
    },
  });

  const analyzeImages = async (base64Array: string[]) => {
    setIsAnalyzing(true);
    setAiError(false);
    try {
      const suggestion = await suggestListingFromImages(base64Array);
      
      if (suggestion.title) setTitle(suggestion.title);
      if (suggestion.description) setDescription(suggestion.description);
      if (suggestion.modelGuess) setModelGuess(suggestion.modelGuess);
      
      const insights = {
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
        await refreshEstimation(insights);
      }
      
      if (!suggestion.title && !suggestion.description) {
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
    const remainingSlots = 4 - photoPreviews.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setUploadError(t("errors.maxPhotos"));
      return;
    }

    // Trigger location capture
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const nearest = findNearestZoneInCity(availableZones, latitude, longitude);
        if (nearest) {
          setSelectedZoneId(nearest.id);
        }
      });
    }

    // 1. Process all files
    const totalSlots = 4;
    let targetStep = currentStep;
    
    // Create copies to update
    let nextPreviews = [...photoPreviews];
    let nextUrls = [...imageUrls];
    let nextQuality = [...qualityResults];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const stepToIndex = (targetStep + i) % totalSlots;
      
      const previewUrl = URL.createObjectURL(file);
      nextPreviews[stepToIndex] = previewUrl;
      
      try {
        const base64 = await readFileAsDataUrl(file);
        setIsCheckingQuality(true);
        const quality = await analyzePhotoQuality(base64, stepToIndex);
        setIsCheckingQuality(false);
        
        nextQuality[stepToIndex] = quality as PhotoQualityResult;

        // Auto-fill from first photo EVER (index 0)
        if (stepToIndex === 0 && quality?.objectDetected) {
          if (!title) setTitle(quality.objectDetected);
          setAiInsights(prev => ({ 
            ...prev, 
            subcategory: quality.objectDetected || undefined, 
            brand: quality.brandDetected || undefined,
            confidence: quality.qualityScore
          }));
        }

        const result = await startUpload([file]);
        if (result) {
          nextUrls[stepToIndex] = result[0].ufsUrl;
        }
      } catch (err) {
        console.error("Upload error for file", i, err);
      }
    }

    setPhotoPreviews(nextPreviews);
    setImageUrls(nextUrls);
    setQualityResults(nextQuality);
    setUploadProgress(100);
    setUploadError(null);

    // Auto-advance logic: find first empty step
    const firstEmpty = nextPreviews.findIndex((p, idx) => !p && idx < totalSlots);
    if (firstEmpty !== -1) {
      setCurrentStep(firstEmpty);
    } else {
      // All filled, maybe go to last or stay? Stay for now.
    }

    // Overall analysis if 2+
    if (nextPreviews.filter(Boolean).length >= 2) {
      try {
        const allBase64 = await Promise.all(
          nextPreviews.filter(Boolean).map(url => fetch(url).then(r => r.blob()).then(blob => {
             return new Promise<string>((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result as string);
               reader.readAsDataURL(blob);
             });
          }))
        );
        analyzeImages(allBase64);
      } catch (err) {
        console.error("Analysis skip: failed to prepare base64", err);
      }
    }
  };

  const manualTriggerAI = async () => {
    if (photoPreviews.length === 0) return;
    setIsAnalyzing(true);
    setAiError(false);
    
    try {
      const allBase64 = await Promise.all(
        photoPreviews.map(url => fetch(url).then(r => r.blob()).then(blob => {
           return new Promise<string>((resolve) => {
             const reader = new FileReader();
             reader.onloadend = () => resolve(reader.result as string);
             reader.readAsDataURL(blob);
           });
        }))
      );
      analyzeImages(allBase64);
    } catch (error) {
      setAiError(true);
      setIsAnalyzing(false);
    }
  };

  const isOutOfRange = aiInsights.estimation && (
    creditValue < aiInsights.estimation.minSuggestedValue || 
    creditValue > aiInsights.estimation.maxSuggestedValue
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

  const removeImage = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen bg-background flex flex-col pb-24 sm:pb-8">
      
      {/* 1. App Header */}
      <div className="bg-surface/80 backdrop-blur-xl px-5 pt-12 pb-5 sticky top-0 z-40 border-b border-border flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{t("title")}</h1>
        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 transition-colors">
           <Package className="w-4.5 h-4.5 text-primary" />
        </div>
      </div>
      
      <div className="flex-1 w-full px-5 pt-8 z-10">
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
                {/* 1. Photo Management Grid (TOP PRIORITY) */}
          {/* 1. GUIDED PHOTO SCANNER (PREMIUM EXPERIENCE) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {t("scanner.title")}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-foreground font-semibold">
                    {t("scanner.stepCounter", {
                      current: currentStep + 1,
                      total: scanSteps.length,
                    })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[10px] text-primary font-bold uppercase tracking-tight italic">
                    {t("scanner.aiAssisted")}
                  </span>
                </div>
              </div>
              
              {isCheckingQuality && (
                <div className="flex items-center gap-2 bg-[#EEF2FF] px-3 py-1.5 rounded-full border border-primary/10 shadow-sm animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {t("scanner.vision")}
                  </span>
                </div>
              )}
            </div>

            {/* Main Scanner Area */}
            <div className="relative aspect-[4/5] w-full h-[450px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute inset-0 rounded-[32px] overflow-hidden border-2 transition-all duration-700 shadow-card group",
                    isCheckingQuality ? "border-primary/40 shadow-blue-100/50" : "border-surface shadow-slate-200/20"
                  )}
                >
                  {/* Real-time Quality Feedback Overlay */}
                  {qualityResults[currentStep] && (
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute top-6 inset-x-6 z-30"
                    >
                      <div className={cn(
                        "p-4 rounded-3xl backdrop-blur-2xl border shadow-popup flex items-center justify-between",
                        qualityResults[currentStep]?.qualityScore! > 0.7 ? "bg-emerald-500/20 border-emerald-500/30 text-white" : "bg-amber-500/20 border-amber-500/30 text-white"
                      )}>
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-2xl flex items-center justify-center shadow-inner",
                              qualityResults[currentStep]?.qualityScore! > 0.7 ? "bg-emerald-500" : "bg-amber-500"
                            )}>
                               {qualityResults[currentStep]?.qualityScore! > 0.7 ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="text-[11px] font-bold uppercase tracking-wider leading-none">
                                 {qualityResults[currentStep]?.qualityScore! > 0.7
                                   ? t("scanner.quality.excellent")
                                   : t("scanner.quality.warning")}
                               </p>
                               <p className="text-[10px] opacity-80 font-medium leading-none mt-1.5">
                                 {qualityResults[currentStep]?.suggestions[0] || t("scanner.quality.ready")}
                               </p>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Camera / Preview Layer */}
                  {photoPreviews[currentStep] ? (
                    <div className="w-full h-full relative group">
                      <img 
                        src={photoPreviews[currentStep]} 
                        alt={t("scanner.previewAlt")} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                         <div className="relative">
                            <button className="px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                               <RefreshCw className="w-5 h-5 text-indigo-600" />
                               {t("scanner.retakePhoto")}
                            </button>
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleImageChange}
                            />
                         </div>
                         
                         {currentStep < 3 && (
                            <button 
                              onClick={() => setCurrentStep(prev => prev + 1)}
                              className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-all"
                            >
                               {t("scanner.nextStep")}
                               <ArrowRight className="w-5 h-5" />
                            </button>
                         )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-foreground flex flex-col items-center justify-center p-8 text-center relative">
                       {/* Scanner Guide Grid */}
                       <div className="absolute inset-8 border border-white/5 rounded-[32px] pointer-events-none">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-white/5" />
                          
                          {/* Corner Markers */}
                          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl" />
                          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl" />
                          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl" />
                          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/40 rounded-br-3xl" />
                       </div>

                       <div className="relative z-10 space-y-6">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="w-20 h-20 rounded-[28px] bg-primary/20 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/10"
                          >
                             {(() => {
                               const Icon = scanSteps[currentStep].icon;
                               return <Icon className="w-10 h-10 text-white" />;
                             })()}
                          </motion.div>
                          <div className="px-4">
                            <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                              {scanSteps[currentStep].label}
                            </h3>
                            <p className="text-sm text-white/40 font-medium leading-relaxed">
                              {scanSteps[currentStep].desc}
                            </p>
                          </div>
                       </div>

                       {/* Call to Action Layer */}
                       <div className="absolute bottom-10 inset-x-8">
                          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[28px] space-y-4 shadow-popup">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                {scanSteps[currentStep].guide}
                            </p>
                            <div className="relative">
                              <button
                                type="button"
                                className="w-full py-4 bg-white rounded-2xl text-foreground font-bold text-sm uppercase tracking-widest shadow-cta flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                <Camera className="w-5 h-5 text-primary" />
                                {t("scanner.scanObject")}
                              </button>
                              <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                              />
                            </div>
                          </div>
                       </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Steps & Thumbnails Strip */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
               {scanSteps.map((step, idx) => (
                 <button
                   key={idx}
                   type="button"
                   onClick={() => idx < imageUrls.length && setCurrentStep(idx)}
                   className={cn(
                     "relative flex-shrink-0 w-20 aspect-square rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-1 overflow-hidden",
                     currentStep === idx ? "border-indigo-500 bg-white shadow-lg ring-4 ring-indigo-50" : "border-transparent bg-white/50"
                   )}
                 >
                    {photoPreviews[idx] ? (
                      <>
                        <img src={photoPreviews[idx]} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-lg">
                           <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      </>
                    ) : (
                      <>
                        <step.icon className={cn("w-5 h-5", currentStep === idx ? "text-indigo-600" : "text-slate-300")} />
                        <span className={cn("text-[8px] font-black uppercase tracking-tighter", currentStep === idx ? "text-indigo-900" : "text-slate-400")}>
                          {t("scanner.stepBadge", { index: idx + 1 })}
                        </span>
                      </>
                    )}
                 </button>
               ))}

               {imageUrls.length > 0 && (
                 <button
                   type="button"
                   onClick={() => {
                     setPhotoPreviews([]);
                     setImageUrls([]);
                     setCurrentStep(0);
                     setQualityResults([null, null, null, null]);
                   }}
                   className="flex-shrink-0 w-20 aspect-square rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all"
                 >
                   <RefreshCw className="w-5 h-5" />
                 </button>
               )}
            </div>

            {/* Error Messages */}
            {(uploadError || aiError) && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-3 mx-1">
                 <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                 <p className="text-[11px] font-bold text-rose-800 leading-tight">
                    {uploadError || t("errors.aiPhotoQuality")}
                 </p>
              </div>
            )}
          </div>

          {/* 2. État de l'objet (Mandatory & Premium) */}
          {photoPreviews.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {t("condition.title")}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {t("condition.subtitle")}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100">
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">
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
                      "group flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-500",
                      functionalStatus === status.id 
                        ? "border-indigo-500 bg-white shadow-2xl shadow-indigo-100/50 -translate-y-1" 
                        : "bg-slate-50/50 border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-colors duration-500",
                      functionalStatus === status.id ? "bg-indigo-600 text-white border-indigo-400" : `${status.bg} ${status.color} ${status.border}`
                    )}>
                      <status.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={cn("text-sm font-black tracking-tight transition-colors", functionalStatus === status.id ? "text-indigo-900" : "text-slate-800")}>
                        {status.label}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium leading-tight">
                        {status.desc}
                      </p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
                      functionalStatus === status.id ? "bg-indigo-600 border-indigo-600 scale-110" : "border-slate-200 group-hover:border-slate-300"
                    )}>
                      {functionalStatus === status.id && (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {isConditionInconsistent && (
                <div className="bg-amber-50/80 backdrop-blur-md border border-amber-200 p-5 rounded-[2.5rem] flex gap-4 animate-in zoom-in duration-700">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shrink-0 shadow-sm self-start">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5" />
                       {t("condition.consistencyAlertTitle")}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
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
              )}

              {aiInsights.isStockPhoto && (
                <div className="bg-slate-900 p-5 rounded-[2.5rem] flex gap-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 shadow-inner border border-slate-700">
                    <Camera className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1.5">
                      {t("catalogPhoto.title")}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      {t.rich("catalogPhoto.body", {
                        strong: (chunks) => (
                          <span className="text-white font-black underline">{chunks}</span>
                        ),
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-6">
            {/* 3. Informations de base */}
            <div className="bg-surface rounded-[32px] p-7 border border-border shadow-sm space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    {t("details.title")}
                  </h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                    {t("details.subtitle")}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="title">
                  {t("details.fields.title")}
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface border border-border rounded-2xl focus:border-slate-400 text-foreground px-4 py-3.5 text-sm transition-all placeholder:text-muted outline-none shadow-sm" 
                  placeholder={t("details.placeholders.title")} 
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="description">
                  {t("details.fields.descriptionOptional")}
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface border border-border rounded-2xl focus:border-slate-400 text-foreground px-4 py-3.5 text-sm transition-all placeholder:text-muted outline-none shadow-sm resize-none" 
                  placeholder={t("details.placeholders.description")} 
                />
              </div>
                  </div>
                </div>

                {/* Hybrid AI Insights Card */}
                {photoPreviews.length > 0 && (aiInsights.category || isAnalyzing) && (
                  <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-3xl p-5 space-y-5">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-primary" />
                         <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                           {t("ai.title")}
                         </span>
                       </div>
                       {isAnalyzing && (
                         <span className="text-[10px] font-bold text-primary animate-pulse">
                           {t("ai.extracting")}
                         </span>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {t("ai.detectedType")}
                          </p>
                          <p className="text-[12px] font-bold text-foreground leading-tight">
                            {aiInsights.subcategory || aiInsights.category || "---"}
                          </p>
                       </div>
                       <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {t("ai.brand")}
                          </p>
                          <p className="text-[12px] font-bold text-foreground truncate">
                            {aiInsights.brand && aiInsights.brand !== "unknown"
                              ? aiInsights.brand
                              : t("ai.genericBrand")}
                          </p>
                       </div>
                       <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {t("ai.visualState")}
                          </p>
                          <p className="text-[12px] font-bold text-foreground capitalize">{aiInsights.condition || "---"}</p>
                       </div>
                       <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {t("ai.rarity")}
                          </p>
                          <p className="text-[12px] font-bold text-primary capitalize font-bold">{aiInsights.rarity || "---"}</p>
                       </div>
                    </div>

                 {/* Technical Details (specific for Electronics) */}
                 {isElectronics && (
                   <div className="pt-4 border-t border-slate-100 space-y-5">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                           {t("technical.title")}
                         </span>
                      </div>

                      {/* Model Guess & Confirmation */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                          {t("technical.model")}
                        </label>
                        <div className="relative">
                          <input 
                            type="text"
                            name="modelGuess"
                            value={modelGuess}
                            onChange={(e) => setModelGuess(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder={t("technical.modelPlaceholder")}
                          />
                          <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 opacity-50" />
                        </div>
                        <p className="text-[9px] text-slate-400 italic pl-1 flex items-center gap-1">
                          <Info className="w-2.5 h-2.5" />
                          {t("technical.modelHint")}
                        </p>
                      </div>

                      {/* Age Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                          {t("technical.ageLabel")}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                           {ageOptions.map((age) => (
                             <button
                               key={age.id}
                               type="button"
                               onClick={() => { setTechAge(age.id); refreshEstimation(aiInsights, age.id); }}
                               className={cn(
                                 "py-2.5 rounded-xl text-[10px] font-black transition-all border",
                                 techAge === age.id ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                               )}
                             >
                               {age.label}
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* Accessories */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                          {t("technical.accessoriesLabel")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                           {accessoryOptions.map(acc => {
                             const isSelected = techAccessories.includes(acc.id);
                             return (
                               <button
                                 key={acc.id}
                                 type="button"
                                 onClick={() => {
                                   const next = isSelected 
                                     ? techAccessories.filter(a => a !== acc.id)
                                     : [...techAccessories, acc.id];
                                   setTechAccessories(next);
                                   refreshEstimation(aiInsights, techAge, techFunctionality, next);
                                 }}
                                 className={cn(
                                   "px-3 py-2 rounded-full text-[9px] font-black transition-all border flex items-center gap-1.5",
                                   isSelected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-100 text-slate-400"
                                 )}
                               >
                                 {isSelected && <Check className="w-2.5 h-2.5" />}
                                 {acc.label}
                               </button>
                             );
                           })}
                        </div>
                      </div>
                   </div>
                 )}

                 {/* Advanced Estimation Dashboard (Prix Juste) */}
                 {aiInsights.estimation && !isAnalyzing && (
                   <div className="space-y-4">
                     <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                             {t("pricing.recommendedEstimation")}
                           </span>
                           <span className="text-2xl font-black text-slate-900">
                             {aiInsights.estimation.suggestedValue}{" "}
                             <span className="text-sm opacity-50 font-black">
                               {t("pricing.creditsShort")}
                             </span>
                           </span>
                        </div>
                        <div className="text-right">
                           <span className="text-[9px] font-bold text-slate-400 uppercase block">
                             {t("pricing.range")}
                           </span>
                           <span className="text-[12px] font-black text-indigo-600">
                             {aiInsights.estimation.minSuggestedValue} – {aiInsights.estimation.maxSuggestedValue} {t("pricing.creditsShort")}
                           </span>
                        </div>
                     </div>
                     
                     <JustificationCard estimation={aiInsights.estimation} />
                   </div>
                 )}

                 {/* Fraud/Quality Check */}
                 {aiInsights.fraudRisk && aiInsights.fraudRisk !== "low" && (
                   <div className={cn(
                     "p-3 rounded-2xl border flex items-start gap-3",
                     aiInsights.fraudRisk === "high" ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100"
                   )}>
                      <Info className={cn("w-4 h-4 mt-0.5", aiInsights.fraudRisk === "high" ? "text-rose-500" : "text-amber-500")} />
                      <div>
                        <p className={cn("text-[11px] font-bold", aiInsights.fraudRisk === "high" ? "text-rose-700" : "text-amber-700")}>
                          {aiInsights.fraudRisk === "high"
                            ? t("ai.qualityInsufficient")
                            : t("ai.listingUnderWatch")}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          {aiInsights.flags?.join(", ") || t("ai.qualityCriteriaNotMet")}
                        </p>
                      </div>
                   </div>
                 )}
               </div>
             )}

             {/* Guided Credit Value (Hybrid Slider) */}
             <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <label className="text-sm font-bold text-gray-800">{t("pricing.title")}</label>
                  <div className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                    isOutOfRange ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {isOutOfRange ? t("pricing.outlier") : t("pricing.coherent")}
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                   <div className="flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-5xl font-black text-slate-900">{creditValue}</span>
                        <span className="text-sm font-black text-indigo-600 ml-2 uppercase">
                          {t("pricing.credits")}
                        </span>
                      </div>
                   </div>

                   <div className="px-2">
                     <input 
                       type="range" 
                       name="creditValue"
                       min="10" 
                       max="1000" 
                       step="5"
                       value={creditValue}
                       onChange={(e) => setCreditValue(parseInt(e.target.value))}
                       className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     />
                     <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <span>{t("pricing.accessible")}</span>
                        <span>{t("pricing.premium")}</span>
                     </div>
                   </div>
                   
                   {isOutOfRange && aiInsights.estimation && (
                     <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-100">
                        <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-bold leading-tight">
                          {t("pricing.outlierHelp", {
                            min: aiInsights.estimation.minSuggestedValue,
                            max: aiInsights.estimation.maxSuggestedValue,
                            credits: t("pricing.creditsShort"),
                          })}{" "}
                          <br />
                          <span className="opacity-70">{t("pricing.outlierHint")}</span>
                        </p>
                     </div>
                   )}
                </div>
             </div>

             {/* DB-backed Location */}
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-1 px-1">
                 <label className="text-sm font-bold text-gray-800">{t("location.title")}</label>
                 {selectedZone && (
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                     {selectedZone.name}
                   </span>
                 )}
               </div>

               {geoError ? (
                 <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] font-bold text-rose-700">
                   {geoError}
                 </div>
               ) : isLoadingGeo ? (
                 <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3 animate-pulse">
                   <div className="h-11 rounded-2xl bg-slate-100" />
                   <div className="h-11 rounded-2xl bg-slate-100" />
                   <div className="h-11 rounded-2xl bg-slate-100" />
                 </div>
               ) : (
                 <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                         {t("country")}
                       </label>
                       <select
                         required
                         value={selectedCountryId}
                         onChange={(e) => setSelectedCountryId(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500"
                       >
                         <option value="" disabled>{t("selectCountry")}</option>
                         {geoCatalog.map((country) => (
                           <option key={country.id} value={country.id}>
                             {country.name}
                           </option>
                         ))}
                       </select>
                     </div>

                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                         {t("city")}
                       </label>
                       <select
                         required
                         value={selectedCityId}
                         onChange={(e) => setSelectedCityId(e.target.value)}
                         disabled={availableCities.length === 0}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-50"
                       >
                         <option value="" disabled>{t("selectCity")}</option>
                         {availableCities.map((city) => (
                           <option key={city.id} value={city.id}>
                             {city.name}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                       {t("zone")}
                     </label>
                     <select
                       required
                       value={selectedZoneId}
                       onChange={(e) => setSelectedZoneId(e.target.value)}
                       disabled={availableZones.length === 0}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 disabled:opacity-50"
                     >
                       <option value="" disabled>{t("selectZone")}</option>
                       {availableZones.map((zone) => (
                         <option key={zone.id} value={zone.id}>
                           {zone.name}
                         </option>
                       ))}
                     </select>
                   </div>
                 </div>
               )}

               {coords && !selectedZoneId && !isLoadingGeo && (
                 <p className="text-[10px] text-primary mt-2 font-bold animate-pulse">
                   {t("detectingZone")}
                 </p>
               )}
             </div>

          <div className="pt-2 pb-12 space-y-5">
            <button
              type="submit"
              disabled={isSubmitting || isUploading || isAnalyzing || photoPreviews.length < 2 || isLoadingGeo || !selectedZoneId}
              className={cn(
                "w-full flex justify-center items-center py-5 px-4 rounded-[20px] shadow-cta text-[16px] font-bold text-white bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:text-white disabled:shadow-none",
                photoPreviews.length < 2 && "opacity-60 grayscale-[0.5]"
              )}
            >
               {isSubmitting
                 ? t("submitting")
                 : isUploading
                   ? t("uploading")
                   : isAnalyzing
                     ? t("analyzing")
                     : photoPreviews.length < 2
                       ? t("twoPhotosRequired")
                       : t("submit")}
            </button>
            
            {photoPreviews.length > 0 && photoPreviews.length < 2 && (
              <div className="flex items-center justify-center gap-2 animate-bounce">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {t("addOneMorePhoto")}
                </p>
              </div>
            )}
            <p className="text-[10px] text-center mt-6 text-muted font-bold uppercase tracking-widest px-8 leading-relaxed opacity-60">
              {t("terms")}
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
