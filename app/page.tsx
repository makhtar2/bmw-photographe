import Image from "next/image";
import Navbar from "../components/Navbar";
import MaterialIcon from "../components/MaterialIcon";
import HeroSlideshow from "../components/HeroSlideshow";
import Portfolio from "../components/Portfolio";
import BookingForm from "../components/BookingForm";
import { getDb } from "../lib/db";

export default async function Home() {
  const { settings, portfolio } = await getDb();

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ════════ FLOATING RDV BUTTON (Mobile only) ════════ */}
      <a
        href="#reservation"
        className="fixed bottom-6 right-6 z-50 md:hidden flex items-center gap-2 bg-[--brand] text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_-4px_rgba(244,145,45,0.5)] hover:brightness-105 active:scale-95 transition-all duration-200 text-[13px] font-extrabold uppercase tracking-wide"
        aria-label="Réserver une séance"
      >
        <MaterialIcon name="calendar_month" className="text-lg" />
        Réserver
      </a>

      {/* ════════ ACCUEIL SECTION ════════ */}
      <div id="accueil">
        {/* Hero Banner */}
        <header className="px-4 py-10 sm:px-6 md:px-10 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            
            <div className="order-2 space-y-6 lg:order-1">
              <div className="relative w-80 sm:w-96 h-28 sm:h-32 mx-auto lg:mx-0">
                <Image 
                  src="/logo.png" 
                  alt="BMW Photographe Logo" 
                  fill 
                  className="object-contain object-center lg:object-left" 
                  priority 
                />
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <MaterialIcon name="photo_camera" className="text-[--brand] text-base" /> Photographe à Thiès
              </div>
              
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Votre histoire,<br />
                <span className="text-[--brand]">en lumière.</span>
              </h1>
              
              <p className="max-w-xl text-base font-semibold leading-relaxed text-slate-600">
                Des portraits sensibles et affirmés, pensés pour révéler votre présence — en studio, en extérieur et lors de vos grands moments à Thiès.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#reservation" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-extrabold text-white transition-colors hover:bg-[--brand]">
                  <MaterialIcon name="calendar_month" className="text-lg" /> Réserver une séance
                </a>
                <a href="#portfolio" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-extrabold text-slate-900 transition-colors hover:border-slate-900">
                  Voir le portfolio
                </a>
              </div>
            </div>

            <div className="order-1 relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:order-2">
              <HeroSlideshow images={portfolio} />
            </div>

          </div>
        </header>

        {/* Philosophy Block */}
        <section className="px-4 py-16 bg-white border-t border-b border-slate-200/60 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Philosophie</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Une image n’est pas seulement belle.<br />
              <span className="text-[--brand]">Elle garde intact ce que le temps emporte.</span>
            </h2>
            <p className="text-slate-600 text-sm font-semibold max-w-xl mx-auto leading-relaxed">
              Direction artistique, lumière maîtrisée et retouche soignée pour créer des images qui vous ressemblent vraiment.
            </p>
          </div>
        </section>
      </div>

      {/* ════════ SERVICES SECTION (Prestations) ════════ */}
      <div id="prestations">
        <section className="px-4 py-20 sm:px-6 md:px-10 bg-slate-950 text-slate-100 border-t border-b border-slate-900 relative z-10">
          <div className="mx-auto max-w-5xl">
            
            {/* Section Header */}
            <div className="mb-16">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand] mb-3">Ce que nous créons</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Des images pour<br />
                <span className="text-[--brand] italic font-serif">chaque histoire.</span>
              </h2>
            </div>

            {/* List of services in row style */}
            <div className="divide-y divide-slate-800/80 border-t border-b border-slate-800/80">
              {[
                {
                  num: "01",
                  title: "Studio",
                  desc: "Portrait, beauté, anniversaire ou image professionnelle dans une lumière façonnée pour vous."
                },
                {
                  num: "02",
                  title: "Extérieur",
                  desc: "Une séance vivante dans le décor de votre choix, avec déplacement et direction artistique."
                },
                {
                  num: "03",
                  title: "Mariage & baptême",
                  desc: "Un reportage attentif qui saisit les gestes, les liens et les instants que vous voudrez revivre."
                },
                {
                  num: "04",
                  title: "Événements",
                  desc: "Anniversaire, cérémonie ou soirée privée : une couverture vivante, élégante et fidèle à l’ambiance."
                }
              ].map((srv, idx) => (
                <div 
                  key={idx}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group hover:bg-slate-900/40 transition-colors duration-300 px-2 rounded-lg"
                >
                  {/* Number */}
                  <div className="md:col-span-1 text-[13px] font-bold text-[--brand] tracking-wider font-mono">
                    {srv.num}
                  </div>
                  
                  {/* Title */}
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-extrabold text-white group-hover:text-[--brand] transition-colors duration-300 uppercase tracking-wide">
                      {srv.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-7">
                    <p className="text-slate-400 font-semibold text-[14px] leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>

      {/* ════════ TARIFS SECTION ════════ */}
      <div id="tarifs" className="scroll-mt-24">
        <section className="px-4 py-20 sm:px-6 md:px-10 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-5xl">

            {/* Heading */}
            <div className="mb-14">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand] mb-3">Tarifs</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                Choisissez votre<br />
                <span className="italic font-serif text-slate-600">format.</span>
              </h2>
              <p className="text-slate-500 text-sm font-semibold max-w-xl leading-relaxed">
                Chaque formule comprend la prise de vue, la direction pendant la séance et la retouche professionnelle des images sélectionnées.
              </p>
            </div>

            {/* Studio + Extérieur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* En studio */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide mb-5">En studio</h3>
                <div className="space-y-3">
                  {[
                    { label: "5 photos",  price: settings.studio_5 },
                    { label: "7 photos",  price: settings.studio_7 },
                    { label: "10 photos", price: settings.studio_10 },
                    { label: "15 photos", price: settings.studio_15 },
                    { label: "20 photos", price: settings.studio_20 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-semibold text-slate-600">{row.label}</span>
                      <strong className="text-sm font-extrabold text-slate-900">
                        {row.price.toLocaleString("fr-FR")} <small className="font-bold text-slate-400 text-[11px]">FCFA</small>
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* En extérieur */}
              <div className="rounded-2xl border border-[--brand]/30 bg-[--brand]/5 p-6">
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide mb-5">En extérieur</h3>
                <div className="space-y-3">
                  {[
                    { label: "5 photos",  price: settings.exterieur_5 },
                    { label: "10 photos", price: settings.exterieur_10 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-semibold text-slate-600">{row.label}</span>
                      <strong className="text-sm font-extrabold text-slate-900">
                        {row.price.toLocaleString("fr-FR")} <small className="font-bold text-slate-400 text-[11px]">FCFA</small>
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reportage cérémonie */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 sm:p-8">
              <div className="mb-5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[--brand]">Reportage cérémonie</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Mariage &amp; baptême</h3>
                <p className="text-slate-400 text-sm font-semibold mt-1">Fichiers retouchés, livrés après votre événement.</p>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: "80 photos",                 price: settings.ceremonie_80 },
                  { label: "100 photos",                price: settings.ceremonie_100 },
                  { label: "120 photos",                price: settings.ceremonie_120 },
                  { label: "Pack Tak Diaka · 60 photos", price: settings.ceremonie_tak_diaka },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-semibold text-slate-300">{row.label}</span>
                    <strong className="text-sm font-extrabold text-white">
                      {row.price.toLocaleString("fr-FR")} <small className="font-bold text-slate-500 text-[11px]">FCFA</small>
                    </strong>
                  </div>
                ))}
              </div>
              {/* Option vidéo */}
              <div className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Option</span>
                  <p className="text-sm font-extrabold text-white">Vidéo cinématique</p>
                </div>
                <p className="text-sm font-extrabold text-white">
                  {settings.option_video.toLocaleString("fr-FR")} <small className="font-bold text-slate-500 text-[11px]">FCFA</small>
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ════════ PORTFOLIO SECTION ════════ */}
      <div id="portfolio" className="scroll-mt-24">
        <Portfolio images={portfolio} />
      </div>

      {/* ════════ RESERVATION SECTION ════════ */}
      <div id="reservation" className="scroll-mt-24">
        <BookingForm settings={settings} />
      </div>
    </main>
  );
}
