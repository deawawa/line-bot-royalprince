import { NextResponse } from "next/server";
import { expirePromotions } from "@/lib/promotions";

export const dynamic = "force-dynamic";

/** Daily cron (vercel.json). Flips active → expired when end_date has passed. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const expired = await expirePromotions();
  return NextResponse.json({ ok: true, expired });
}
