"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Sparkles, Wand2, ChevronLeft, ChevronRight, Layout, Eye } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FormatSelector } from "@/components/format-selector";
import { SlideCard } from "@/components/slide-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { CarouselResult, ContentFormat, Slide } from "@/types/carousel";
import { useTheme } from "@/context/theme-context";

const HISTORY_KEY = "ai-social-studio-history";

interface HistoryItem extends CarouselResult {
  createdAt: string;
}

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const SkeletonCard = () => (
  <div className="w-[320px] shrink-0 aspect-square rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center p-8 space-y-6">
    <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700" />
    <div className="w-3/4 h-8 rounded-lg bg-slate-300 dark:bg-slate-700" />
    <div className="w-full h-24 rounded-lg bg-slate-300 dark:bg-slate-700" />
  </div>
);

export function Studio() {
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState<ContentFormat>("carousel");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [topic, setTopic] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const slideRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { theme, toggleTheme } = useTheme();

  // Reset results when format changes
  const lastFormatRef = useRef(format);
  useEffect(() => {
    if (lastFormatRef.current !== format) {
      setSlides([]);
      setTopic("");
      lastFormatRef.current = format;
    }
  }, [format]);

  // Load history on mount
  useEffect(() => {
    setMounted(true);
    
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as HistoryItem[];
        setHistory(parsed);
      } catch {
        // Ignore invalid cached history payloads.
      }
    }
  }, []);

  const canGenerate = idea.trim().length > 8 && !loading;

  const outputTitle = useMemo(() => {
    if (!topic) return "Your generated content will appear here";
    return topic;
  }, [topic]);

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), format }),
      });
      const payload = (await response.json()) as CarouselResult & { error?: string; details?: string };
      if (!response.ok || !payload.slides?.length) throw new Error(payload.details ?? payload.error ?? "Could not generate content.");
      setSlides(payload.slides);
      setTopic(payload.topic);
      const nextHistory: HistoryItem[] = [{ topic: payload.topic, slides: payload.slides, createdAt: new Date().toISOString() }, ...history].slice(0, 8);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateSlide(index: number) {
    if (!slides[index] || regeneratingIndex !== null) return;
    setRegeneratingIndex(index);
    setError(null);
    try {
      const response = await fetch("/api/regenerate-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: topic || idea, format, slideIndex: index, currentSlide: slides[index] }),
      });
      const payload = (await response.json()) as Slide & { error?: string; details?: string };
      if (!response.ok || !payload.id) throw new Error(payload.details ?? payload.error ?? "Could not regenerate slide.");
      setSlides((prev) => prev.map((s, i) => (i === index ? payload : s)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setRegeneratingIndex(null);
    }
  }

  async function handleDownloadSlides() {
    if (!slides.length || downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const filePrefix = sanitizeFileName(topic || "ai-social-studio");
      for (let i = 0; i < slides.length; i++) {
        const target = slideRefs.current[slides[i].id];
        if (!target) continue;
        const dataUrl = await toPng(target, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
        const link = document.createElement("a");
        link.download = `${filePrefix}-slide-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      setError("Failed to export images. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleSlideChange(id: string, key: "title" | "text", value: string) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-slate-100 transition-colors duration-300 selection:bg-violet-500/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              AI Social Studio
            </h1>
            <p className="mt-2 text-lg font-medium text-slate-500 dark:text-slate-400">
              Turn ideas into viral content in seconds 🚀
            </p>
          </motion.div>
          <ThemeToggle />
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Wand2 className="h-6 w-6 text-violet-500" />
                  Viral Idea Input
                </CardTitle>
                <CardDescription className="text-base">AI will shape your thought into a scroll-stopping sequence.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Enter your idea... e.g., Why students forget what they learn"
                  className="min-h-[180px] text-lg bg-slate-50 dark:bg-slate-950 border-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <FormatSelector value={format} onChange={setFormat} />
                  <Button 
                    size="lg" 
                    onClick={handleGenerate} 
                    disabled={!canGenerate}
                    className="h-14 px-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-xl shadow-violet-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 hover:brightness-110"
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    {loading ? "Generating viral content... 🚀" : "Generate Viral Content"}
                  </Button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl text-sm font-medium border bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                  >
                    {error}
                  </motion.p>
                )}
              </CardContent>
            </Card>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black">{outputTitle}</h2>
                  <p className="text-base text-slate-500 dark:text-slate-400">Preview your viral carousel below.</p>
                </div>
                <div className="flex items-center gap-3">
                  {slides.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewMode(!previewMode)}
                      className={cn("rounded-full h-11 px-6 font-bold transition-all", previewMode && "bg-violet-500 text-white border-violet-500 hover:bg-violet-600")}
                    >
                      {previewMode ? <Layout className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {previewMode ? "Grid View" : "Preview Mode"}
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    onClick={handleDownloadSlides} 
                    disabled={!slides.length || downloading}
                    className="rounded-full h-11 px-6 font-bold shadow-lg"
                  >
                    {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PNGs
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-6 overflow-x-hidden py-4">
                      {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </motion.div>
                  ) : slides.length > 0 ? (
                    previewMode ? (
                      <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-8 py-12">
                        <div className="relative w-full max-w-[450px] flex items-center group">
                          <Button variant="ghost" size="icon" className="absolute -left-16 rounded-full bg-white dark:bg-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}>
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <SlideCard isPreview slide={slides[currentSlideIndex]} index={currentSlideIndex} format={format} regenerating={regeneratingIndex === currentSlideIndex} cardRef={(el) => (slideRefs.current[slides[currentSlideIndex].id] = el)} onChange={handleSlideChange} onRegenerate={handleRegenerateSlide} onCopy={() => {}} />
                          <Button variant="ghost" size="icon" className="absolute -right-16 rounded-full bg-white dark:bg-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}>
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          {slides.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlideIndex(i)} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", i === currentSlideIndex ? "bg-violet-500 w-8" : "bg-slate-300 dark:bg-slate-700")} />
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn(
                        "flex gap-6 pb-8",
                        format === "post" ? "justify-center" : "overflow-x-auto snap-x snap-mandatory"
                      )}>
                        {slides.map((slide, i) => (
                          <div key={slide.id} className={cn(format !== "post" && "snap-center")}>
                            <SlideCard 
                              slide={slide} 
                              index={i} 
                              format={format} 
                              isPreview={format === "post"}
                              regenerating={regeneratingIndex === i} 
                              cardRef={(el) => (slideRefs.current[slide.id] = el)} 
                              onChange={handleSlideChange} 
                              onRegenerate={handleRegenerateSlide} 
                              onCopy={async (s) => {
                                await navigator.clipboard.writeText(`${s.title}\n${s.text}`);
                              }} 
                            />
                          </div>
                        ))}
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[400px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center p-8 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
                  >
                      <div className="p-8 rounded-full mb-6 animate-bounce bg-violet-50 dark:bg-violet-950/30">
                        <Sparkles className="h-14 w-12 text-violet-500" />
                      </div>
                      <h3 className="text-2xl font-black">Enter an idea above and create viral content 🚀</h3>
                      <p className="mt-3 max-w-md text-lg text-slate-500 dark:text-slate-400">Witness the magic of viral content generation with just one click.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Layout className="h-5 w-5 text-violet-500" />
                  Recent Creations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 font-medium py-4">Your generation history will appear here.</p>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.createdAt} 
                      onClick={() => { setTopic(item.topic); setIdea(item.topic); setSlides(item.slides); }}
                      className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-all group"
                    >
                      <p className="font-bold text-sm line-clamp-1 group-hover:text-violet-600 transition-colors">{item.topic}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

