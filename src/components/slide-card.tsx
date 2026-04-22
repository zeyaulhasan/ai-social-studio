"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, RefreshCcw, Check, Sparkles, BookOpen, Brain, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContentFormat, Slide } from "@/types/carousel";

interface SlideCardProps {
  slide: Slide;
  index: number;
  format: ContentFormat;
  regenerating: boolean;
  cardRef: (element: HTMLDivElement | null) => void;
  onChange: (id: string, key: "title" | "text", value: string) => void;
  onRegenerate: (index: number) => void;
  onCopy: (slide: Slide) => void;
  isPreview?: boolean;
}

const slideGradients = [
  "from-indigo-600 via-purple-600 to-blue-600",
  "from-orange-500 via-rose-500 to-red-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-blue-500 via-indigo-500 to-violet-600",
  "from-amber-400 via-orange-500 to-pink-500",
];

const slideIcons = [Brain, BookOpen, Zap, Target, Sparkles];

export function SlideCard({
  slide,
  index,
  format,
  regenerating,
  cardRef,
  onChange,
  onRegenerate,
  onCopy,
  isPreview = false,
}: SlideCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [copied, setCopied] = useState(false);

  const Icon = slideIcons[index % slideIcons.length];
  const gradient = slideGradients[index % slideGradients.length];

  const handleCopy = () => {
    onCopy(slide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aspectClass = useMemo(() => {
    if (format === "story") return "aspect-[9/16]";
    return "aspect-square";
  }, [format]);

  return (
    <motion.div
      initial={isPreview ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: isPreview ? 0 : index * 0.1 }}
      whileHover={isPreview ? {} : { scale: 1.03, y: -8 }}
      className={cn(
        "group relative flex flex-col transition-all duration-300",
        isPreview ? "w-full max-w-[400px] mx-auto" : "w-[320px] shrink-0"
      )}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 group-hover:shadow-violet-500/20 group-hover:scale-[1.03]",
          aspectClass,
          "flex flex-col items-center justify-center p-8 text-center"
        )}
      >
        {/* Background Layer */}
        <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-700", gradient)} />
        
        {/* Glassmorphism & Mesh Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pb-20 px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-full bg-white/20 p-3.5 backdrop-blur-xl border border-white/30 mb-8"
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>

          <div className="w-full space-y-4 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isEditingTitle ? (
                <motion.textarea
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  autoFocus
                  className="w-full bg-transparent text-2xl font-black text-white text-center outline-none resize-none placeholder:text-white/50 leading-tight"
                  value={slide.title}
                  onChange={(e) => onChange(slide.id, "title", e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  rows={2}
                />
              ) : (
                <motion.h2
                  key="view"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-3xl font-black tracking-tight text-white cursor-pointer leading-tight text-center drop-shadow-md"
                >
                  {slide.title}
                </motion.h2>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isEditingText ? (
                <motion.textarea
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  autoFocus
                  className="w-full bg-transparent text-lg text-white/90 text-center outline-none resize-none placeholder:text-white/40 font-medium leading-normal"
                  value={slide.text}
                  onChange={(e) => onChange(slide.id, "text", e.target.value)}
                  onBlur={() => setIsEditingText(false)}
                  rows={4}
                />
              ) : (
                <motion.p
                  key="view"
                  onClick={() => setIsEditingText(true)}
                  className="text-xl font-medium text-white/90 leading-snug cursor-pointer hover:opacity-80 transition-opacity line-clamp-5 text-center px-4"
                >
                  {slide.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Counter Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 z-20">
          <span className="text-[10px] font-bold text-white/90 tracking-[0.2em] uppercase">Slide {index + 1}</span>
        </div>
      </div>

      {/* Action Buttons (Floating on hover) */}
      {!isPreview && (
        <div className="mt-6 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={regenerating}
            className="rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg"
            onClick={() => onRegenerate(index)}
          >
            <RefreshCcw className={cn("h-4 w-4", regenerating && "animate-spin")} />
            <span className="ml-2">Magic</span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}
