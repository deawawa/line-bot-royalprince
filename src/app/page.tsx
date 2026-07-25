import Link from "next/link";
import { HOTEL } from "@/lib/config";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-brand">{HOTEL.name}</h1>
      <p className="text-slate-600">LINE AI Reservation &amp; Sales Assistant</p>
      <div className="flex gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-brand px-4 py-2 text-white hover:opacity-90"
        >
          Admin Console
        </Link>
        <a
          href={HOTEL.directBookingUrl}
          className="rounded-lg border border-brand px-4 py-2 text-brand hover:bg-slate-100"
        >
          Direct Booking
        </a>
      </div>
    </main>
  );
}
