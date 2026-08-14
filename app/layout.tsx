import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegistration from "../components/PWARegistration";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BMW Photographe | Photographe Professionnel à Thiès Médina Fall",
  description: "Séances photo et vidéos exclusives pour tous vos événements à Thiès. Immortalisez vos plus beaux moments avec des clichés de qualité premium.",
  keywords: [
    "BMW Photographe",
    "Photographe Thiès",
    "Shooting photo professionnel",
    "Médina Fall",
    "Thiès photo",
    "Studio photo Sénégal",
    "Réservation shooting photo"
  ],
  authors: [{ name: "BMW Photographe" }],
  openGraph: {
    title: "BMW Photographe | Photographe de Mode & Lifestyle à Thiès",
    description: "Réservez votre séance photo exclusive. Studio et extérieur à Thiès Médina Fall.",
    url: "https://bmw-photographe.vercel.app",
    siteName: "BMW Photographe",
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BMW Photographe | Studio & Extérieur",
    description: "Immortalisez vos plus beaux moments avec BMW Photographe à Thiès Médina Fall.",
  },
  robots: "index, follow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BMW Photo",
  },
};

export const viewport = {
  themeColor: "#F4912D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC] text-[#0F172A] relative min-h-screen`}>
        
        {/* Aura Background Spots for premium, modern UX/UI */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top-Left Spot (Brand Orange) */}
          <div className="absolute -top-48 -left-48 w-[400px] h-[400px] rounded-full bg-[#F4912D]/10 blur-[100px]"></div>
          {/* Bottom-Right Spot (Teal/Emerald) */}
          <div className="absolute -bottom-48 -right-48 w-[400px] h-[400px] rounded-full bg-[#10B981]/10 blur-[100px]"></div>
          {/* Middle-Right Spot (Soft Rose/Crimson) */}
          <div className="absolute top-[30%] -right-24 w-80 h-80 rounded-full bg-[#F43F5E]/6 blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <PWARegistration />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
