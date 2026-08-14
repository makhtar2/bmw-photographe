"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("accueil");

  const navItems = [
    { label: "Accueil", path: "/#accueil", key: "accueil", icon: "home" },
    { label: "Portfolio", path: "/#portfolio", key: "portfolio", icon: "photo_camera" },
    { label: "Réservation", path: "/#reservation", key: "reservation", icon: "calendar_month" },
  ];

  // Scroll spy to detect active section dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 160; // offset for navbar height + buffer

      const sections = navItems.map(item => ({
        key: item.key,
        element: document.getElementById(item.key)
      }));

      // Find the lowest section that has crossed scrollPos
      let current = "accueil";
      for (const section of sections) {
        if (section.element && scrollPos >= section.element.offsetTop) {
          current = section.key;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, key: string, path: string) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", path);
        setActiveSection(key);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 hidden md:block bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-10 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-24">
        
        {/* Logo */}
        <Link href="/#accueil" onClick={(e) => handleNavClick(e, "accueil", "/#accueil")} className="relative w-64 h-16 shrink-0 transition-transform hover:scale-[1.01]">
          <Image 
            src="/logo.png" 
            alt="BMW Photographe" 
            fill 
            className="object-contain object-left" 
            priority 
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="flex items-center gap-10 text-[14px] font-bold text-slate-700 tracking-wide">
          {navItems.map((item) => {
            const active = activeSection === item.key;
            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.key, item.path)}
                className={`transition-colors ${active ? "text-[--brand]" : "hover:text-[--brand]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/#reservation"
          onClick={(e) => handleNavClick(e, "reservation", "/#reservation")}
          className="inline-flex items-center justify-center bg-[--brand] text-white text-[13px] font-extrabold px-6 py-3 rounded-full hover:brightness-105 transition-all shadow-sm"
        >
          Réserver une séance
        </Link>

      </div>
    </nav>
  );
}
