"use client";

import Image from "next/image";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 px-5 md:px-10 pt-16 pb-28 md:pb-16 relative z-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="relative w-72 h-24 brightness-0 invert opacity-90 mx-auto md:mx-0">
            <Image 
              src="/logo.png" 
              alt="BMW Photographe" 
              fill 
              className="object-contain object-center md:object-left" 
            />
          </div>
          <p className="text-[14px] text-slate-400 font-bold leading-relaxed max-w-sm">
            Créateur d&apos;émotions et de souvenirs impérissables à Thiès. Des portraits professionnels au studio à domicile, nous capturons votre authenticité.
          </p>
          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/221762588808" 
              target="_blank" 
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-[--brand] hover:text-white flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <MaterialIcon name="chat" className="text-lg" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-[--brand] hover:text-white flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <MaterialIcon name="photo_camera" className="text-lg" />
            </a>
            <a 
              href="tel:+221762588808"
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-[--brand] hover:text-white flex items-center justify-center transition-colors"
              aria-label="Appeler"
            >
              <MaterialIcon name="call" className="text-lg" />
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="text-white text-[12px] font-extrabold uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-3 text-[13px] font-extrabold uppercase tracking-wide">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
            </li>
            <li>
              <Link href="/reservation" className="hover:text-white transition-colors">Réservation</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="md:col-span-4 space-y-4">
          <h3 className="text-white text-[12px] font-extrabold uppercase tracking-widest">Contact & Accès</h3>
          <div className="space-y-3.5 text-[14px]">
            <div className="flex items-start gap-3">
              <MaterialIcon name="place" className="text-[--brand] text-lg mt-0.5" />
              <div>
                <p className="text-white font-extrabold">Studio BMW</p>
                <p className="text-slate-400 font-semibold">Thiès, Quartier Médina Fall</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MaterialIcon name="call" className="text-[--brand] text-lg" />
              <a href="tel:+221762588808" className="hover:text-white transition-colors font-extrabold">
                +221 76 258 88 08
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MaterialIcon name="schedule" className="text-[--brand] text-lg" />
              <p className="text-slate-400 font-semibold">Tous les jours sur rendez-vous</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
        <p>© 2026 BMW Photographe. Tous droits réservés.</p>
        <a
          href="https://almuxtaardev.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Fait par <span className="text-[--brand] ml-1">almuxtaardev</span>
        </a>
      </div>
    </footer>
  );
}
