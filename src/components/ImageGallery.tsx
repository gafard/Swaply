"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: { url: string; order: number }[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 opacity-30">
        <Package className="w-20 h-20 text-slate-400" />
      </div>
    );
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-full group">
      {/* Main Image */}
      <img
        src={images[currentIndex].url}
        alt={`${title} - Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      )}

      {/* Index Badge */}
      <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
