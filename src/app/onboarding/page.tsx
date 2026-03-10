"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Handshake, ChevronLeft, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: "publish",
    title: "Publie un objet",
    description: "Échange ce que tu n'utilises plus contre des crédits et donne-leur une seconde vie.",
    icon: <PlusCircle className="w-12 h-12 text-white" strokeWidth={1.5} />,
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "discover",
    title: "Découvre près de toi",
    description: "Swipe pour trouver les pépites cachées dans ton quartier à Lomé.",
    icon: <Sparkles className="w-12 h-12 text-white" strokeWidth={1.5} />,
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: "secure",
    title: "Troc en toute sécurité",
    description: "Réserve tes objets coup de cœur et échange-les dans nos zones sécurisées.",
    icon: <Handshake className="w-12 h-12 text-white" strokeWidth={1.5} />,
    color: "from-emerald-600 to-indigo-600",
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      router.push("/signup"); // Or wherever the real entry point is
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  return (
    <main className="h-screen bg-black flex items-center justify-center overflow-hidden relative font-sans">
      
      {/* Dynamic Backgrounds matching the slide current color */}
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

      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      
      <div className="w-full h-full max-w-md mx-auto relative flex flex-col z-10 px-6 py-10">
        
        {/* Top bar (Back / Skip) */}
        <div className="flex justify-between items-center mb-8 h-10">
           {currentSlide > 0 ? (
             <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition">
               <ChevronLeft className="w-5 h-5" />
             </button>
           ) : <div />}
           
           <button onClick={() => router.push("/signup")} className="text-white/70 text-sm font-semibold tracking-wider uppercase hover:text-white transition">
             Skip
           </button>
        </div>

        {/* Carousel Content */}
        <div className="flex-1 flex flex-col items-center justify-center mt-[-10vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center w-full"
            >
               <div className="w-24 h-24 mb-8 rounded-[2rem] bg-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl border border-white/20">
                 {slides[currentSlide].icon}
               </div>
               
               <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                 {slides[currentSlide].title}
               </h1>
               
               <p className="text-white/80 text-[15px] max-w-[280px] leading-relaxed font-medium">
                 {slides[currentSlide].description}
               </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Indicators */}
        <div className="w-full mt-auto flex flex-col items-center gap-8 pb-4">
          
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-white text-gray-900 rounded-[1.5rem] py-4 font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            {currentSlide === slides.length - 1 ? "Commencer" : "Continuer"}
            {currentSlide === slides.length - 1 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>
    </main>
  );
}
