"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Music, ExternalLink, Play, Heart, CheckCircle2 } from "lucide-react";

export default function TikTokFeed() {
  const [activeTab, setActiveTab] = useState<"reels" | "player">("reels");

  useEffect(() => {
    // Charge dynamiquement le script d'intégration officiel TikTok
    const scriptId = "tiktok-embed-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).tiktokEmbed) {
      (window as any).tiktokEmbed.load();
    }
  }, [activeTab]);

  return (
    <section className="px-4 py-20 sm:px-6 md:px-10 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900 select-none">
      {/* Halo d'ambiance Or Studio BMW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[--brand] opacity-10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 space-y-10">
        {/* Header Carte Profil — Charte Graphique Or Studio */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 relative z-10">
            {/* Avatar avec Bordure Or Brand */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[--brand] bg-slate-800 p-0.5 shadow-xl shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo-square.png"
                  alt="BMW Photographe TikTok"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">BMW Photographe</h3>
                <CheckCircle2 className="w-5 h-5 text-[--brand] fill-current" />
              </div>
              <p className="text-xs font-mono font-bold text-[--brand] tracking-wide">@bmw_photographe221</p>
              <p className="text-xs text-slate-400 font-semibold max-w-md">
                Studio &amp; Extérieur à Thiès Médina Fall — Coulisses, shootings exclusifs &amp; actualités.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-center">
            <a
              href="https://www.tiktok.com/@bmw_photographe221"
              target="_blank"
              rel="noreferrer"
              className="py-3.5 px-6 bg-[--brand] hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[--brand]/20 transition-all active:scale-95"
            >
              <Music className="w-4 h-4" /> Suivre sur TikTok <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Switcher d'Onglets — Style Studio Épuré */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner gap-1">
            <button
              onClick={() => setActiveTab("reels")}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === "reels"
                  ? "bg-[--brand] text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Aperçu Séances Studio
            </button>

            <button
              onClick={() => setActiveTab("player")}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === "player"
                  ? "bg-[--brand] text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Music className="w-3.5 h-3.5" /> Lecteur TikTok Direct
            </button>
          </div>
        </div>

        {/* CONTENU ONGLET 1 : REELS STUDIO AUX COULEURS DU SITE */}
        {activeTab === "reels" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Shooting Photo Studio Médina Fall 📸",
                desc: "Session portrait & lumière façonnée en studio",
                cover: "/portfolio/studio1.png",
                tag: "Studio",
                views: "18.4K",
                likes: "3.2K",
              },
              {
                title: "Coulisses Cérémonie & Mariage 💍",
                desc: "Capture des moments uniques et émotions vives",
                cover: "/portfolio/exterior1.png",
                tag: "Mariage",
                views: "34.1K",
                likes: "6.8K",
              },
              {
                title: "Direction Artistique Extérieur 🎬",
                desc: "Retouche signature & angles professionnels",
                cover: "/portfolio/exterior2.png",
                tag: "Extérieur",
                views: "22.9K",
                likes: "4.5K",
              },
            ].map((item, idx) => (
              <a
                key={idx}
                href="https://www.tiktok.com/@bmw_photographe221"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-[9/15] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[--brand] hover:shadow-[0_15px_40px_-10px_rgba(244,145,45,0.3)] flex flex-col justify-between p-5"
              >
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/20 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-slate-950/90 backdrop-blur-md text-[--brand] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[--brand]/40 shadow-md uppercase tracking-wider">
                    <Music className="w-3 h-3 text-[--brand]" /> {item.tag}
                  </span>
                  <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-800">
                    BMW Photo
                  </span>
                </div>

                <div className="relative z-10 self-center w-16 h-16 rounded-full bg-slate-950/80 backdrop-blur-md border border-[--brand]/40 flex items-center justify-center text-[--brand] group-hover:scale-110 group-hover:bg-[--brand] group-hover:text-slate-950 transition-all duration-300 shadow-xl">
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                </div>

                <div className="relative z-10 space-y-2">
                  <h4 className="text-sm font-extrabold text-white leading-snug drop-shadow-md">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-semibold line-clamp-1">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-200 pt-3 border-t border-white/10">
                    <span className="flex items-center gap-1.5 text-[--brand]">
                      {item.views} vues
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Heart className="w-3.5 h-3.5 fill-current" /> {item.likes}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CONTENU ONGLET 2 : EMBED OFFICIELE TIKTOK WIDGET */}
        {activeTab === "player" && (
          <div className="flex justify-center items-center w-full min-h-[500px] bg-slate-900 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl overflow-hidden">
            <blockquote
              className="tiktok-embed"
              cite="https://www.tiktok.com/@bmw_photographe221"
              data-unique-id="bmw_photographe221"
              data-embed-type="creator"
              style={{ maxWidth: "780px", minWidth: "280px", width: "100%" }}
            >
              <section>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.tiktok.com/@bmw_photographe221?refer=creator_embed"
                  className="text-[--brand] font-bold underline text-sm"
                >
                  Regarder @bmw_photographe221 sur TikTok
                </a>
              </section>
            </blockquote>
          </div>
        )}
      </div>
    </section>
  );
}



