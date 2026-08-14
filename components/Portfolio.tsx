"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import MaterialIcon from "./MaterialIcon";
import { PortfolioItem } from "../lib/db";

interface PortfolioProps {
  images: PortfolioItem[];
}

export default function Portfolio({ images }: PortfolioProps) {
  const [filter, setFilter] = useState<"tout" | "studio" | "exterior">("tout");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => images.filter((img) => filter === "tout" || img.category === filter),
    [filter, images]
  );

  const handleFilter = (nextFilter: typeof filter) => {
    setFilter(nextFilter);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [filter]);

  const handleShare = async (img: PortfolioItem) => {
    const url = window.location.origin + img.src;
    if (navigator.share) {
      try { await navigator.share({ title: img.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = async (img: PortfolioItem) => {
    try {
      const res = await fetch(img.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = img.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.src, "_blank");
    }
  };

  const filters = [
    { key: "tout" as const, label: "Tout Voir", icon: "grid_view" },
    { key: "studio" as const, label: "En Studio", icon: "photo_camera" },
    { key: "exterior" as const, label: "À domicile", icon: "home" },
  ];

  return (
    <section id="portfolio" className="py-10 md:py-20 relative bg-white border-t border-slate-200">
      <div className="px-4 sm:px-6 md:px-10 max-w-[1400px] mx-auto mb-6 sm:mb-10">
        <div className="text-center max-w-md mx-auto mb-6">
          <p className="text-[11px] text-[--brand] font-extrabold uppercase tracking-widest mb-1">Portfolio</p>
          <h2 className="text-xl sm:text-3xl text-slate-900 font-extrabold tracking-tight">
            Nos réalisations
          </h2>
        </div>

        {/* Categories Selector Ultra Minimal Mobile */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 max-w-full">
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleFilter(f.key)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-all ${
                    active
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {f.label === "Tout Voir" ? "Tout" : f.label === "En Studio" ? "Studio" : "Extérieur"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Rounded Cards */}
      <div
        ref={scrollRef}
        className="scroll-gallery flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-visible px-5 md:px-10 max-w-[1400px] md:mx-auto snap-x snap-mandatory pb-4"
      >
        {filtered.map((img) => (
          <div
            key={`${filter}-${img.id}`}
            onClick={() => setLightbox(img)}
            className="snap-start shrink-0 w-[78vw] sm:w-[58vw] md:w-auto cursor-pointer classi-card bg-white p-3 relative group"
          >
            {/* Card Image Area with Rounded Corners and Badge */}
            <div className={`relative w-full ${img.aspectClass} overflow-hidden rounded-lg bg-slate-100`}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 78vw, 33vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Category overlay Tag */}
              <div className="absolute top-4 left-4 bg-white/95 text-slate-800 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded border border-slate-200">
                {img.category === "studio" ? "En Studio" : "À domicile"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="px-5 text-center text-slate-400 text-[13px] py-12">Aucune photo dans cette catégorie.</p>
      )}

      {/* ---- Lightbox ---- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-between p-6 backdrop-blur-sm anim-fade"
          onClick={() => setLightbox(null)}
        >
          {/* Top */}
          <div className="w-full max-w-4xl flex items-center justify-between pt-2 text-white border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] text-[--brand] uppercase tracking-widest font-extrabold">
                {lightbox.category === "studio" ? "Studio" : "Extérieur"}
              </p>
              <p className="text-lg font-bold tracking-wide">{lightbox.title}</p>
            </div>
            <button onClick={() => setLightbox(null)} className="p-3 hover:bg-white/10 rounded-full border border-white/15 transition-colors">
              <MaterialIcon name="close" className="text-lg text-white" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center w-full max-w-4xl my-6" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-h-[72vh] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
              <Image src={lightbox.src} alt={lightbox.alt} fill className="object-contain" sizes="100vw" priority />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pb-4 relative w-full max-w-4xl border-t border-white/10 pt-4 justify-end" onClick={(e) => e.stopPropagation()}>
            {copied && (
              <span className="absolute -top-10 right-4 bg-[--brand] text-white text-[11px] px-3 py-1 rounded whitespace-nowrap">
                Lien copié !
              </span>
            )}
            <button
              onClick={() => handleShare(lightbox)}
              className="flex items-center gap-2 px-5 py-3 border border-white/10 hover:bg-white/5 text-white text-[12px] font-bold rounded-full transition-colors"
            >
              <MaterialIcon name="share" className="text-base text-white" /> Partager
            </button>
            <button
              onClick={() => handleDownload(lightbox)}
              className="flex items-center gap-2 px-5 py-3 bg-[--brand] text-white text-[12px] font-bold rounded-full hover:brightness-105 transition-all"
            >
              <MaterialIcon name="download" className="text-base text-white" /> Télécharger
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
