import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PWARegistration from "../components/PWARegistration";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BMW Photographe | Studio Photo à Thiès — Disponible partout au Sénégal",
  description: "Séances photo studio, extérieur et cérémonies. Photographe professionnel basé à Thiès Médina Fall, disponible partout au Sénégal (Dakar, Mbour, Saint-Louis, Ziguinchor).",
  keywords: [
    "BMW Photographe",
    "Photographe Thiès",
    "Photographe Sénégal",
    "Disponible partout au Sénégal",
    "Shooting photo professionnel",
    "Médina Fall",
    "Thiès photo",
    "Studio photo Sénégal",
    "Photographe Mariage Sénégal"
  ],
  authors: [{ name: "BMW Photographe" }],
  openGraph: {
    title: "BMW Photographe | Studio Photo Professionnel à Thiès",
    description: "Réservez votre séance photo exclusive (Studio & Extérieur). Disponible partout au Sénégal (Thiès, Dakar, Mbour...).",
    url: "https://bmwphotographe.vercel.app",
    siteName: "BMW Photographe",
    images: [
      {
        url: "/camera-hero.png",
        width: 1200,
        height: 630,
        alt: "BMW Photographe Studio Thiès",
      },
    ],
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BMW Photographe | Studio & Extérieur à Thiès",
    description: "Immortalisez vos plus beaux moments avec BMW Photographe à Thiès Médina Fall.",
    images: ["/camera-hero.png"],
  },
  icons: {
    icon: "/logo-square.png",
    shortcut: "/logo-square.png",
    apple: "/logo-square.png",
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#FAFAF9] text-[#1C1917] relative min-h-screen`}>

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
