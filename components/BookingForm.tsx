"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingInput, TIME_SLOTS } from "../lib/schema";
import { submitBooking, getBookedSlots } from "../app/actions";
import MaterialIcon from "./MaterialIcon";
import { PricesSettings, PricePackage } from "../lib/db";

interface BookingFormProps {
  settings: PricesSettings;
  id?: string;
}

export default function BookingForm({ settings, id = "reservation" }: BookingFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { location: "Studio" },
  });

  const loc = watch("location");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  // Recharge les créneaux déjà pris à chaque changement de date, pour ne pas
  // proposer un horaire déjà réservé par un autre client.
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }
    let cancelled = false;
    getBookedSlots(selectedDate).then((slots) => {
      if (!cancelled) setBookedSlots(slots);
    });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const formulaOption = (pkg: PricePackage) => {
    const text = `${pkg.label} — ${pkg.price.toLocaleString("fr-FR")} FCFA`;
    return { value: text, label: text };
  };

  const packages = loc === "Studio" ? settings.studio : loc === "Domicile" ? settings.exterieur : settings.ceremonie;
  const formulas = packages.map(formulaOption);

  const onSubmit = async (data: BookingInput) => {
    setPending(true);
    setError(null);
    try {
      const res = await submitBooking(data);
      if (res.success && res.redirectUrl) {
        setDone(true);
        setTimeout(() => { window.location.href = res.redirectUrl!; }, 1200);
      } else if (res.errors) {
        const key = Object.keys(res.errors)[0];
        setError(res.errors[key]?.[0] || "Vérifiez vos informations.");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setPending(false);
    }
  };

  const inputStyle = (err?: boolean) =>
    `w-full pl-12 pr-4 py-3.5 rounded-2xl border text-[14px] bg-slate-50 text-[--ink] transition-all outline-none placeholder:text-slate-400 font-bold ${
      err
        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-white"
        : "border-slate-200 focus:border-slate-800 focus:ring-4 focus:ring-slate-900/5 focus:bg-white"
    }`;

  return (
    <section id={id} className="w-full overflow-hidden px-3 sm:px-5 md:px-10 py-8 sm:py-12 md:py-24 relative bg-slate-50 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-[500px] mx-auto relative z-10">
        
        {/* Card wrapper */}
        <div className="min-w-0 bg-white border border-slate-200 p-5 sm:p-8 md:p-10 rounded-2xl shadow-sm">
          
          <div className="text-center mb-8">
            <p className="text-[13px] text-[--brand] font-extrabold uppercase tracking-wider mb-2">Votre séance commence ici</p>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              Prêt·e à passer devant l’objectif ?
            </h2>
            <p className="text-slate-500 text-[13px] mt-2 font-bold leading-relaxed">
              Indiquez votre souhait. Votre demande s’ouvre ensuite directement dans WhatsApp pour confirmer les détails.
            </p>
          </div>

          {done ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-100">
                <MaterialIcon name="check_circle" className="text-3xl text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Votre demande a été envoyée !</h3>
              <p className="text-[13px] text-slate-500 font-bold">Redirection vers WhatsApp en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl font-bold">
                  {error}
                </div>
              )}

              {/* Nom complet */}
              <div className="relative">
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Nom Complet</label>
                <div className="relative">
                  <MaterialIcon name="person" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Ex: Fatou Diop"
                    className={inputStyle(!!errors.name)}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[11px] mt-1.5 pl-2 font-bold">{errors.name.message}</p>}
              </div>

              {/* Téléphone */}
              <div className="relative">
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Numéro WhatsApp</label>
                <div className="relative">
                  <MaterialIcon name="phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="Ex: 77 123 45 67"
                    className={inputStyle(!!errors.phone)}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[11px] mt-1.5 pl-2 font-bold">{errors.phone.message}</p>}
              </div>

              {/* Lieu — toggle rounded */}
              <div>
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Lieu du shooting</label>
                <div className="flex min-w-0 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
                  {(["Studio", "Domicile", "Mariage"] as const).map((l) => (
                    <label
                      key={l}
                      className={`min-w-0 flex-1 text-center py-3 rounded-xl text-[10px] sm:text-[13px] font-extrabold tracking-wide uppercase cursor-pointer transition-all ${
                        loc === l
                          ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <input type="radio" value={l} {...register("location")} className="sr-only" />
                      <span className="inline-flex max-w-full items-center justify-center gap-1 sm:gap-1.5 px-1 truncate">
                        <MaterialIcon name={l === "Studio" ? "photo_camera" : l === "Domicile" ? "home" : "favorite"} className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">{l === "Studio" ? "Studio" : l === "Domicile" ? "Extérieur" : "Mariage"}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Formule */}
              <div className="relative">
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Formule choisie</label>
                <div className="relative">
                  <MaterialIcon name="layers" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select 
                    {...register("formula")} 
                    className={inputStyle(!!errors.formula) + " cursor-pointer appearance-none bg-slate-50"}
                  >
                    <option value="">Sélectionnez un pack</option>
                    {formulas.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <MaterialIcon name="keyboard_arrow_down" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
                </div>
                {errors.formula && <p className="text-red-500 text-[11px] mt-1.5 pl-2 font-bold">{errors.formula.message}</p>}
              </div>

              {/* Date souhaitée */}
              <div className="relative">
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Date souhaitée</label>
                <div className="relative">
                  <MaterialIcon name="calendar_month" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    {...register("date")}
                    className={inputStyle(!!errors.date)}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-[11px] mt-1.5 pl-2 font-bold">{errors.date.message}</p>}
              </div>

              {/* Heure souhaitée — créneaux cliquables */}
              <div>
                <label className="block text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 pl-1">Heure souhaitée</label>
                <input type="hidden" {...register("time")} />
                {!selectedDate ? (
                  <p className="text-[12px] text-slate-400 font-bold px-1 py-2">Sélectionnez d&apos;abord une date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((t) => {
                      const isBusy = bookedSlots.includes(t);
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue("time", t, { shouldValidate: true })}
                          title={isBusy ? "Déjà demandé par un autre client, mais vous pouvez quand même le choisir" : undefined}
                          className={`relative py-2.5 rounded-xl text-[13px] font-extrabold border transition-all ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {t}
                          {isBusy && !isSelected && (
                            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.time && <p className="text-red-500 text-[11px] mt-1.5 pl-2 font-bold">{errors.time.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-[--brand] text-white py-4 rounded-2xl text-[13px] tracking-wider uppercase font-extrabold hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {pending ? "Envoi..." : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.14 4.162 4.175-1.095z"/>
                    </svg>
                    Confirmer
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center tracking-wider mt-2 uppercase font-extrabold">
                Paiement Wave / OM accepté
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
