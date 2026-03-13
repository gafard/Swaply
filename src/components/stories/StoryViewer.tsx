"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Story {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: Date | string;
  user: {
    username: string;
    avatarUrl?: string | null;
  };
}

export default function StoryViewer({ 
  stories, 
  initialIndex = 0, 
  onClose 
}: { 
  stories: Story[]; 
  initialIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);


  const duration = 5000; // 5 seconds per story
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const next = () => {
    if (index < stories.length - 1) {
      setIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    startTimeRef.current = Date.now();

    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        next();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]);

  const current = stories[index];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center sm:p-4"
    >
      <div className="relative w-full h-full max-w-[450px] bg-[#1a1a1a] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 inset-x-4 flex gap-1.5 z-20">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: i === index ? `${progress}%` : i < index ? "100%" : "0%" }}
                transition={{ ease: "linear", duration: i === index ? 0.05 : 0.2 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 inset-x-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              {current.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (

                 <User className="w-5 h-5 text-white/50" />
               )}
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">@{current.user.username}</p>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                {new Date(current.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={prev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={next} />
        </div>

        {/* Image Content */}
        <div className="flex-1 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={current.imageUrl} 
            alt="" 
            className="w-full h-full object-contain"
          />

           {current.caption && (
             <div className="absolute bottom-12 inset-x-8 text-center bg-black/40 backdrop-blur-xl p-6 rounded-[28px] border border-white/10">
                <p className="text-sm font-bold text-white leading-relaxed">
                  {current.caption}
                </p>
             </div>
           )}
        </div>

        {/* Desktop Controls */}
        <button 
          onClick={prev}
          disabled={index === 0}
          className="hidden sm:flex absolute left-[-80px] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl items-center justify-center text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={next}
          className="hidden sm:flex absolute right-[-80px] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}
