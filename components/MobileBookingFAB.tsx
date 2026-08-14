"use client";

import { useEffect, useState } from "react";
import MaterialIcon from "./MaterialIcon";

export default function MobileBookingFAB() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScrollVisibility = () => {
      // Afficher le FAB après avoir scrollé de 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScrollVisibility);
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("reservation");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <button
        onClick={handleClick}
        className="flex items-center gap-2.5 px-6 py-4 bg-[--brand] text-white rounded-full shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all duration-300 border border-white/10"
      >
        <MaterialIcon name="event" className="text-lg text-white" />
        <span className="text-[12px] uppercase tracking-wider font-extrabold">Réserver</span>
      </button>
    </div>
  );
}
