"use client";

import React, { useEffect } from "react";
import { Music, ExternalLink } from "lucide-react";

export default function TikTokFeed() {
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
  }, []);

  return (
    <section className="px-4 py-20 sm:px-6 md:px-10 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[--brand] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">
              <Music className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Intégration Officielle TikTok
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Vidéos Réelles <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-400 to-[--brand]">@bmw_photographe221</span>
            </h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl">
              Retrouvez l&apos;ensemble de nos publications, coulisses et tournages directement depuis TikTok.
            </p>
          </div>

          <a
            href="https://www.tiktok.com/@bmw_photographe221"
            target="_blank"
            rel="noreferrer"
            className="py-3 px-6 bg-gradient-to-r from-pink-600 via-rose-600 to-[--brand] hover:brightness-110 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-900/30 transition-all active:scale-95 shrink-0"
          >
            <Music className="w-4 h-4" /> Voir sur TikTok <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Real TikTok Profile & Video Embed Container */}
        <div className="flex justify-center items-center w-full min-h-[480px] bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl overflow-hidden">
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
                @bmw_photographe221 sur TikTok
              </a>
            </section>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

