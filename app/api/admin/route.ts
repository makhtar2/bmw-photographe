import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  // Vérifier l'authentification
  const session = cookies().get("bmw_admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = await getDb();

  return NextResponse.json({
    bookings: db.bookings,
    settings: db.settings,
    labels: db.labels,
    portfolio: db.portfolio,
    promo: db.promo,
  });
}
