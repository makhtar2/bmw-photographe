import { cookies } from "next/headers";
import { getDb } from "../../../lib/db";
import AdminDashboard from "../../../components/AdminDashboard";
import AdminLogin from "../../../components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminTarifsPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("bmw_admin_session")?.value;
  const isAuthenticated = sessionToken === "authenticated";

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const db = await getDb();

  return (
    <AdminDashboard
      initialSettings={db.settings}
      initialLabels={db.labels}
      initialBookings={db.bookings}
      initialPortfolio={db.portfolio}
      initialPromo={db.promo}
      currentRoute="/admin/tarifs"
    />
  );
}
