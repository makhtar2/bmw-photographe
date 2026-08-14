"use client";

import React from "react";
import Image from "next/image";
import { Play, ExternalLink, Music, Heart, Eye } from "lucide-react";

interface TikTokVideo {
  id: string;
  url: string;
  title: string;
  views: string;
  likes: string;
  coverUrl: string;
  duration: string;
}

const TIKTOK_VIDEOS: TikTokVideo[] = [
  {
    id: "1",
    url: "https://www.tiktok.com/@bmw_photographe221",
    title: "✨ Coulisses Shooting Studio — Ambiance & Lumière à Thiès Médina Fall 📸",
    views: "14.5K",
    likes: "2.8K",
    coverUrl: "/portfolio/studio1.png",
    duration: "0:25",
  },
  {
    id: "2",
    url: "https://www.tiktok.com/@bmw_photographe221",
    title: "👰 Cérémonie Mariage Chic & Élégant au Sénégal — Souvenirs Inoubliables",
    views: "28.9K",
    likes: "5.1K",
    coverUrl: "/portfolio/exterior1.png",
    duration: "0:42",
  },
  {
    id: "3",
    url: "https://www.tiktok.com/@bmw_photographe221",
    title: "🔥 Portrait Extérieur — Direction Artistique & Retouche Signature BMW Photo",
    views: "19.2K",
    likes: "3.4K",
    coverUrl: "/portfolio/studio2.png",
    duration: "0:30",
  },
  {
    id: "4",
    url: "https://www.tiktok.com/@bmw_photographe221",
    title: "🎬 Pack Tak Diaka & Shooting Anniversaire — Reservez votre créneau !",
    views: "35.1K",
    likes: "7.9K",
    coverUrl: "/portfolio/exterior2.png",
    duration: "0:55",
  },
];

export default function TikTokFeed() {
  return (
    <section className="px-4 py-20 sm:px-6 md:px-10 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Soft Gold Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[--brand] opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">
              <Music className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Flux Vidéo TikTok Live
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Suivez nos tournages sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-400 to-[--brand]">TikTok</span>
            </h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl">
              Découvrez les coulisses des séances, nos plus beaux shootings studio et les vidéos exclusives de @bmw_photographe221.
            </p>
          </div>

          <a
            href="https://www.tiktok.com/@bmw_photographe221"
            target="_blank"
            rel="noreferrer"
            className="py-3 px-6 bg-gradient-to-r from-pink-600 via-rose-600 to-[--brand] hover:brightness-110 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-900/30 transition-all active:scale-95 shrink-0"
          >
            <Music className="w-4 h-4" /> Suivre @bmw_photographe221 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Video Grid Feed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIKTOK_VIDEOS.map((vid) => (
            <a
              key={vid.id}
              href={vid.url}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[--brand]/50 hover:shadow-[0_12px_40px_-10px_rgba(244,145,45,0.3)] flex flex-col justify-between p-4"
            >
              {/* Cover Image Background */}
              <Image
                src={vid.coverUrl}
                alt={vid.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 pointer-events-none"></div>

              {/* Top Header info */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1.5 border border-slate-800">
                  <Music className="w-3 h-3 text-pink-400" /> TikTok
                </span>
                <span className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-300">
                  {vid.duration}
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="relative z-10 self-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[--brand] group-hover:border-[--brand] transition-all duration-300 shadow-lg">
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </div>

              {/* Bottom Caption & Metrics */}
              <div className="relative z-10 space-y-2.5">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                  {vid.title}
                </p>

                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-300 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> {vid.views}
                  </span>
                  <span className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {vid.likes}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
