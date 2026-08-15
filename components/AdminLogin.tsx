"use client";

import { useState } from "react";
import { loginAdmin } from "../app/actions";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        window.location.reload(); // Recharger pour appliquer la session côté serveur
      } else {
        setError(res.message || "Mot de passe incorrect.");
      }
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[--brand]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden z-10 anim-rise">
        {/* Ligne d'accentuation supérieure */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[--brand] via-amber-500 to-[--brand]"></div>

        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo */}
          <div className="relative w-52 h-14 mb-4">
            <Image
              src="/logo.png"
              alt="BMW Photographe Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[--brand]" /> Espace Studio Sécurisé
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Connexion Administrateur</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Entrez votre clé d’accès pour gérer le studio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl font-bold flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="pass" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              Mot de passe administrateur
            </label>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              
              <input
                type={showPassword ? "text" : "password"}
                id="pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 focus:border-[--brand] focus:bg-white focus:ring-4 focus:ring-[--brand]/10 rounded-2xl text-sm text-slate-900 font-extrabold transition-all focus:outline-none"
                placeholder="Entrez votre mot de passe"
              />

              {/* Bouton Œil pour masquer / afficher le mot de passe */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[--brand] transition-colors focus:outline-none"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[--brand]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white hover:bg-[--brand] transition-all duration-300 py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Se connecter au studio"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          BMW Photographe © 2026 • Gestion Studio
        </div>
      </div>
    </div>
  );
}

