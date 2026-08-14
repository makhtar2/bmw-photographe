"use client";

import { useState } from "react";
import { loginAdmin } from "../app/actions";
import { Lock, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
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
        setError(res.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        {/* Accentuation supérieure dorée */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F4912D]"></div>

        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo */}
          <div className="relative w-48 h-12 mb-6">
            <Image
              src="/logo.png"
              alt="BMW Photographe Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="font-serif text-2xl text-[#1A1A1A] font-light">Espace Administration</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Accès Sécurisé</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="pass" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Mot de passe administrateur
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                id="pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-[#F4912D] focus:ring-4 focus:ring-[#F4912D]/10 rounded-xl text-sm text-[#1A1A1A] transition-all focus:outline-none"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#F4912D] transition-colors duration-300 py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-gray-400">
          BMW Photographe © 2026. Accès restreint au personnel autorisé.
        </div>
      </div>
    </div>
  );
}
