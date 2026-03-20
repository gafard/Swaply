"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import StoryViewer from "./StoryViewer";

interface Story {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  user: {
    username: string;
    avatarUrl?: string | null;
  };
}

export default function StoryCarousel({ stories }: { stories: Story[] }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
        {/* Post Story Button */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
          <div className="p-[3px] rounded-[24px] bg-white border border-gray-100 shadow-sm transition-transform active:scale-95">
            <div className="w-16 h-16 rounded-[21px] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-300 transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post</span>
        </div>

        {/* Stories */}
        {stories.map((story, i) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => setSelectedStoryIndex(i)}
          >
            <div className="p-[3px] rounded-[24px] bg-gradient-to-tr from-[#FF8800] to-[#FF0080] shadow-md group-hover:scale-105 transition-transform">
              <div className="p-[2.5px] bg-white rounded-[21px]">
                <div className="w-16 h-16 rounded-[19px] bg-slate-100 overflow-hidden border border-gray-100">
                  <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[70px]">
              {story.user.username}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer 
            stories={stories} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setSelectedStoryIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
