import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - BMW Photographe",
  description: "Espace Administration & Gestion des Réservations",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BMW Photo Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
