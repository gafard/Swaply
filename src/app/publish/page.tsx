"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { publishItem } from "@/app/actions/item";
import { suggestListingFromImages, analyzePhotoQuality } from "@/app/actions/ai";
import { LOME_ZONES, findNearestZone } from "@/lib/zones";
import { useUploadThing } from "@/lib/uploadthing";
import { Package, Camera, Info, Sparkles, Wand2, Laptop, Clock, ShieldCheck, Headphones, Check, Star, AlertTriangle, Zap, Search, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAIEstimation } from "@/lib/ai-engine";
import { PhotoQualityResult } from "@/lib/validations";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.readAsDataURL(file);
  });
}

export default function PublishPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiError, setAiError] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creditValue, setCreditValue] = useState(100);
  const [selectedZone, setSelectedZone] = useState("");
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
    estimation?: {
      suggestedValue: number;
      minSuggestedValue: number;
      maxSuggestedValue: number;
      explanation: string;
      confidence: number;
    };
  }>({});

  // Guided Scanner State
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityResults, setQualityResults] = useState<(PhotoQualityResult | null)[]>([null, null, null, null]);

  const SCAN_STEPS = [
    { label: "Photo Principale", desc: "L'objet entier, bien centré", icon: Package, guide: "Placez l'objet au centre du cadre" },
    { label: "Face Arrière / Étiquette", desc: "Détails techniques importants", icon: Camera, guide: "Capturez les ports ou l'étiquette modèle" },
    { label: "Détails ou Défauts", desc: "Zoom sur l'état réel", icon: Search, guide: "Rapprochez-vous des imperfections ou rayures" },
    { label: "En fonctionnement", desc: "Objet allumé ou actif", icon: Zap, guide: "Montrez que l'appareil s'allume (écran, LED)" },
  ];

  const isConditionInconsistent = aiInsights.visualStatus && (
    (aiInsights.visualStatus === "BROKEN" && functionalStatus === "PERFECT") ||
    (aiInsights.visualStatus === "DEFECTIVE" && functionalStatus === "PERFECT")
  );

  // Recalculate estimation when tech details change (only for electronics)
  const refreshEstimation = async (updatedInsights = aiInsights, age = techAge, func = techFunctionality, accs = techAccessories) => {
    if (updatedInsights.category === "Électronique" && updatedInsights.confidence) {
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

      if (suggestion.category === "Électronique") {
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
      setUploadError("Maximum 4 photos autorisées.");
      return;
    }

    // Trigger location capture
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const nearest = findNearestZone(latitude, longitude);
        if (nearest && nearest !== "Tout Lomé") {
          setSelectedZone(nearest);
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

      const removeImage = (index: number) => {
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
        setImageUrls(prev => prev.filter((_, i) => i !== index));
      };

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pb-24 sm:pb-8">
      
      {/* 1. App Header */}
      <div className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-5 sticky top-0 z-40 border-b border-slate-100 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Publier un objet</h1>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
           <Package className="w-4 h-4 text-indigo-600" />
        </div>
      </div>
      
      <div className="flex-1 w-full px-5 pt-8 z-10">
        <form action={publishItem} className="space-y-8">
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
          <input type="hidden" name="latitude" value={coords?.lat || ""} />
          <input type="hidden" name="longitude" value={coords?.lng || ""} />
          
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
          <input type="hidden" name="aiExplanation" value={aiInsights.estimation?.explanation || ""} />
          
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scanner Objet</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-900 font-bold">Étape {currentStep + 1} / 4</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter italic">Assisté par IA</span>
                </div>
              </div>
              
              {isCheckingQuality && (
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm animate-pulse">
                  <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analyse Vision...</span>
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
                    "absolute inset-0 rounded-[3.5rem] overflow-hidden border-2 transition-all duration-700 shadow-2xl group",
                    isCheckingQuality ? "border-indigo-400 shadow-indigo-100" : "border-white shadow-slate-200/50"
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
                        "p-4 rounded-3xl backdrop-blur-2xl border shadow-2xl flex items-center justify-between",
                        qualityResults[currentStep]?.qualityScore! > 0.7 ? "bg-emerald-500/20 border-emerald-500/30 text-white" : "bg-amber-500/20 border-amber-500/30 text-white"
                      )}>
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center shadow-inner",
                              qualityResults[currentStep]?.qualityScore! > 0.7 ? "bg-emerald-500" : "bg-amber-500"
                            )}>
                               {qualityResults[currentStep]?.qualityScore! > 0.7 ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="text-[11px] font-black uppercase tracking-widest">
                                 {qualityResults[currentStep]?.qualityScore! > 0.7 ? "Qualité Excellente" : "Attention"}
                               </p>
                               <p className="text-[10px] opacity-80 font-bold leading-none mt-1">
                                 {qualityResults[currentStep]?.suggestions[0] || "Prêt pour la suite"}
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
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                         <div className="relative">
                            <button className="px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                               <RefreshCw className="w-5 h-5 text-indigo-600" />
                               Reprendre cette photo
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
                               Aller à l&apos;étape suivante
                               <ArrowRight className="w-5 h-5" />
                            </button>
                         )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative">
                       {/* Scanner Guide Grid */}
                       <div className="absolute inset-8 border border-white/10 rounded-[2.5rem] pointer-events-none">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-white/5" />
                          
                          {/* Corner Markers */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500 rounded-tl-3xl opacity-60" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500 rounded-tr-3xl opacity-60" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500 rounded-bl-3xl opacity-60" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500 rounded-br-3xl opacity-60" />
                       </div>

                       <div className="relative z-10 space-y-4">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="w-20 h-20 rounded-[2rem] bg-indigo-600/20 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20"
                          >
                             {(() => {
                               const Icon = SCAN_STEPS[currentStep].icon;
                               return <Icon className="w-10 h-10 text-white" />;
                             })()}
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-black text-white tracking-tight mb-2">
                              {SCAN_STEPS[currentStep].label}
                            </h3>
                            <p className="text-sm text-white/60 font-medium px-4 leading-relaxed">
                              {SCAN_STEPS[currentStep].desc}
                            </p>
                          </div>
                       </div>

                       {/* Call to Action Layer */}
                       <div className="absolute bottom-12 inset-x-8">
                          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[2.5rem] space-y-4 shadow-xl">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                               <Sparkles className="w-3 h-3" />
                               {SCAN_STEPS[currentStep].guide}
                            </p>
                            <div className="relative">
                              <button
                                type="button"
                                className="w-full py-4 bg-white rounded-2xl text-slate-900 font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                <Camera className="w-5 h-5 text-indigo-600" />
                                Ouvrir Caméra / Parcourir
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
               {SCAN_STEPS.map((step, idx) => (
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
                          Pass {idx + 1}
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
                    {uploadError || "L'IA a besoin d'une photo plus nette pour identifier l'objet. Veuillez réessayer."}
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
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Transparence Technique</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confiance absolue Swaply</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100">
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Obligatoire</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {[
                  { id: "PERFECT", label: "État Parfait", desc: "Comme neuf, aucun souci", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", techId: "perfect" },
                  ...(aiInsights.category === "Électronique" ? [
                    { id: "BATTERY_LOW", label: "Batterie faible", desc: "Autonomie réduite", icon: Clock, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100", techId: "battery_low" }
                  ] : []),
                  { id: "DEFECTIVE", label: "Défaut Mineur", desc: "ex: bouton, port USB", icon: Info, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", techId: "defect" },
                  { id: "BROKEN", label: "Hors d'usage", desc: "Pour pièces uniquement", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", techId: "defect" }
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => {
                      setFunctionalStatus(status.id as any);
                      if (aiInsights.category === "Électronique") {
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
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                       <Sparkles className="w-3 h-3" />
                       Alerte Cohérence IA
                    </p>
                    <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                      Notre analyse visuelle détecte un objet <span className="underline decoration-amber-400 decoration-2 underline-offset-2">{aiInsights.visualStatus === "BROKEN" ? "CASSÉ" : "DÉFECTUEUX"}</span>. 
                      Êtes-vous sûr de votre choix ?
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
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1.5">Photo Catalogue</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Les annonces avec des photos réelles sont réservées <span className="text-white font-black underline">3 fois plus vite</span> à Lomé.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
             {/* Title Input */}
             <div>
               <label className="block text-sm font-bold text-gray-800 mb-2" htmlFor="title">Titre</label>
               <input 
                 type="text" 
                 id="title" 
                 name="title" 
                 required 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 px-4 py-3.5 text-sm transition-all placeholder:text-gray-400 outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                 placeholder="ex. Chaussures de sport Nike" 
               />
             </div>

             {/* Description Input */}
             <div>
               <label className="block text-sm font-bold text-gray-800 mb-2" htmlFor="description">Description (Optionnel)</label>
               <textarea 
                 id="description" 
                 name="description" 
                 rows={3}
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 px-4 py-3.5 text-sm transition-all placeholder:text-gray-400 outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] resize-none" 
                 placeholder="État de l'objet, caractéristiques..." 
               />
             </div>

             {/* Hybrid AI Insights Card */}
             {photoPreviews.length > 0 && (aiInsights.category || isAnalyzing) && (
               <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Analyses Hybride IA</span>
                    </div>
                    {isAnalyzing && (
                      <span className="text-[10px] font-bold text-indigo-600 animate-pulse">Extraction...</span>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Type détecté</p>
                       <p className="text-[12px] font-bold text-slate-900 leading-tight">
                         {aiInsights.subcategory || aiInsights.category || "---"}
                       </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Marque</p>
                       <p className="text-[12px] font-bold text-slate-900 truncate">
                         {aiInsights.brand && aiInsights.brand !== "unknown" ? aiInsights.brand : "Générique"}
                       </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">État visuel</p>
                       <p className="text-[12px] font-bold text-slate-900 capitalize">{aiInsights.condition || "---"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Rareté</p>
                       <p className="text-[12px] font-bold text-indigo-600 capitalize font-black">{aiInsights.rarity || "---"}</p>
                    </div>
                 </div>

                 {/* Technical Details (specific for Electronics) */}
                 {aiInsights.category === "Électronique" && (
                   <div className="pt-4 border-t border-slate-100 space-y-5">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Détails Techniques</span>
                      </div>

                      {/* Model Guess & Confirmation */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Modèle identifié</label>
                        <div className="relative">
                          <input 
                            type="text"
                            name="modelGuess"
                            value={modelGuess}
                            onChange={(e) => setModelGuess(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="ex: Sony WH-1000XM4"
                          />
                          <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 opacity-50" />
                        </div>
                        <p className="text-[9px] text-slate-400 italic pl-1 flex items-center gap-1">
                          <Info className="w-2.5 h-2.5" />
                          L&apos;IA a détecté ce modèle. Modifiez si besoin.
                        </p>
                      </div>

                      {/* Age Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Âge de l&apos;appareil</label>
                        <div className="grid grid-cols-3 gap-2">
                           {[
                             { id: "less_than_1_year", label: "< 1 an" },
                             { id: "1_3_years", label: "1-3 ans" },
                             { id: "more_than_3_years", label: "> 3 ans" }
                           ].map(age => (
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Accessoires inclus</label>
                        <div className="flex flex-wrap gap-2">
                           {[
                             { id: "box", label: "Boîte d'origine" },
                             { id: "charger", label: "Chargeur" },
                             { id: "cables", label: "Câblage complet" }
                           ].map(acc => {
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

                 {/* Advanced Estimation Dashboard */}
                 {aiInsights.estimation && !isAnalyzing && (
                   <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Estimation Recommandée</span>
                            <span className="text-2xl font-black text-slate-900">{aiInsights.estimation.suggestedValue} <span className="text-sm opacity-50">CR</span></span>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Fourchette</span>
                            <span className="text-[12px] font-black text-indigo-600">{aiInsights.estimation.minSuggestedValue} – {aiInsights.estimation.maxSuggestedValue} CR</span>
                         </div>
                      </div>

                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-3 py-1">
                        &quot;{aiInsights.estimation.explanation}&quot;
                      </p>
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
                          {aiInsights.fraudRisk === "high" ? "Qualité insuffisante" : "Annonce sous surveillance"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          {aiInsights.flags?.join(", ") || "Critères de qualité non respectés."}
                        </p>
                      </div>
                   </div>
                 )}
               </div>
             )}

             {/* Guided Credit Value (Hybrid Slider) */}
             <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <label className="text-sm font-bold text-gray-800">Prix de l&apos;objet (Crédits)</label>
                  <div className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                    isOutOfRange ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {isOutOfRange ? "⚠️ Prix atypique" : "✅ Prix cohérent"}
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                   <div className="flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-5xl font-black text-slate-900">{creditValue}</span>
                        <span className="text-sm font-black text-indigo-600 ml-2 uppercase">Crédits</span>
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
                        <span>Accessible</span>
                        <span>Premium</span>
                     </div>
                   </div>
                   
                   {isOutOfRange && aiInsights.estimation && (
                     <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-100">
                        <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-bold leading-tight">
                          Ce prix s&apos;éloigne de la fourchette conseillée par l&apos;IA ({aiInsights.estimation.minSuggestedValue} – {aiInsights.estimation.maxSuggestedValue} CR). <br/>
                          <span className="opacity-70">Des prix trop élevés peuvent ralentir l&apos;échange.</span>
                        </p>
                     </div>
                   )}
                </div>
             </div>

             {/* Location Select App Style */}
             <div>
               <label className="block text-sm font-bold text-gray-800 mb-2" htmlFor="location">Zone de Campus (Lomé)</label>
               <div className="relative">
                 <select 
                   id="location" 
                   name="locationZone" 
                   required 
                   value={selectedZone}
                   onChange={(e) => setSelectedZone(e.target.value)}
                   className="w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 px-4 py-3.5 text-sm transition-all appearance-none shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                 >
                   <option value="" disabled>Sélectionnez une zone...</option>
                   {LOME_ZONES.filter(z => z !== "Tout Lomé").map(zone => (
                     <option key={zone} value={zone}>{zone}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </div>
               </div>
               {coords && !selectedZone && (
                 <p className="text-[10px] text-indigo-600 mt-2 font-bold animate-pulse">Détection de votre zone en cours...</p>
               )}
             </div>

          </div>

          <div className="pt-2 pb-12 space-y-4">
            <button
              type="submit"
              disabled={isUploading || isAnalyzing || photoPreviews.length < 2}
              className={cn(
                "w-full flex justify-center items-center py-5 px-4 border border-indigo-600/20 rounded-[1.5rem] shadow-[0_20px_40px_rgba(79,70,229,0.2)] text-[16px] font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:border-transparent",
                photoPreviews.length < 2 && "opacity-60 grayscale-[0.5]"
              )}
            >
               {isUploading ? "Upload en cours..." : isAnalyzing ? "Analyse IA..." : photoPreviews.length < 2 ? "2 photos requises" : "Publier l'objet"}
            </button>
            
            {photoPreviews.length > 0 && photoPreviews.length < 2 && (
              <div className="flex items-center justify-center gap-2 animate-bounce">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                  Ajoutez encore 1 photo 📸
                </p>
              </div>
            )}
            <p className="text-[10px] text-center mt-6 text-slate-400 font-bold uppercase tracking-widest px-8 leading-relaxed opacity-60">
              En publiant, vous acceptez nos conditions de sécurité pour la ville de Lomé.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
