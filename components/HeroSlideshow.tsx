"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface HeroSlideshowProps {
  images: { src: string; alt: string }[];
}

export default function HeroSlideshow({ images }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = images.slice(0, 5); // Use the first 5 images as featured slideshow

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) {
    return (
      <div className="relative h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
        Aucun cliché disponible
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-950">
      {featured.map((img, index) => {
        const active = index === currentIndex;
        return (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              active ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <Image
              src={img.src}
              alt={img.alt || "BMW Photographe"}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[4000ms] ease-out"
            />
            {/* Soft dark vignette gradient at the bottom for high-end look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Elegant indicator dots at the bottom center */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {featured.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-[--brand]" : "w-1.5 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Aller au cliché ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
