import { db, schema } from "@/db/client";
import { count, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function metric(q: Promise<Array<{ value: number }>>): Promise<number> {
  try {
    const rows = await q;
    return rows[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

export default async function Dashboard() {
  const [
    totalConversations,
    activeConversations,
    newLeads,
    hotLeads,
    warmLeads,
    bookingRequests,
    bookingClicks,
    handoffs,
    aiErrors,
  ] = await Promise.all([
    metric(db.select({ value: count() }).from(schema.conversations)),
    metric(
      db
        .select({ value: count() })
        .from(schema.conversations)
        .where(eq(schema.conversations.status, "active")),
    ),
    metric(
      db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.status, "New")),
    ),
    metric(
      db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.leadScore, "HOT")),
    ),
    metric(
      db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.leadScore, "WARM")),
    ),
    metric(db.select({ value: count() }).from(schema.bookingRequests)),
    metric(
      db
        .select({ value: count() })
        .from(schema.events)
        .where(eq(schema.events.name, "booking_link_clicked")),
    ),
    metric(
      db
        .select({ value: count() })
        .from(schema.events)
        .where(eq(schema.events.name, "human_handoff")),
    ),
    metric(
      db.select({ value: count() }).from(schema.events).where(eq(schema.events.name, "ai_error")),
    ),
  ]);

  const conversionRate =
    totalConversations > 0 ? ((bookingClicks / totalConversations) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Total Conversations", value: totalConversations },
    { label: "Active Conversations", value: activeConversations },
    { label: "New Leads", value: newLeads },
    { label: "HOT Leads", value: hotLeads },
    { label: "WARM Leads", value: warmLeads },
    { label: "Booking Requests", value: bookingRequests },
    { label: "Booking Link Clicks", value: bookingClicks },
    { label: "Human Handoff", value: handoffs },
    { label: "Conversion Rate", value: `${conversionRate}%` },
    { label: "Error Count", value: aiErrors },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
