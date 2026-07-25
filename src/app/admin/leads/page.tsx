import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Booking Link Sent",
  "Booking Confirmed",
  "Lost",
  "Closed",
] as const;

async function updateStatus(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;
  const [before] = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
  await db
    .update(schema.leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.leads.id, id));
  await logAudit({
    adminUser: session.username,
    action: "lead_status_update",
    entity: "lead",
    entityId: String(id),
    before: { status: before?.status },
    after: { status },
  });
  revalidatePath("/admin/leads");
}

export default async function LeadsPage() {
  const leads = await db
    .select()
    .from(schema.leads)
    .orderBy(desc(schema.leads.updatedAt))
    .limit(200);

  const scoreColor = (s: string) =>
    s === "HOT" ? "bg-red-100 text-red-700" : s === "WARM" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Leads</h1>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              {["Customer", "LINE ID", "Intent", "Check-in", "Check-out", "Room", "Score", "Status", "Booking Click", "Updated"].map((h) => (
                <th key={h} className="px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.displayName ?? "-"}</td>
                <td className="px-3 py-2 font-mono text-xs">{l.lineUserId.slice(0, 12)}…</td>
                <td className="px-3 py-2">{l.intent ?? "-"}</td>
                <td className="px-3 py-2">{l.checkIn ?? "-"}</td>
                <td className="px-3 py-2">{l.checkOut ?? "-"}</td>
                <td className="px-3 py-2">{l.roomType ?? "-"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${scoreColor(l.leadScore)}`}>
                    {l.leadScore}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <form action={updateStatus} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={l.id} />
                    <select name="status" defaultValue={l.status} className="rounded border px-1 py-0.5 text-xs">
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button className="rounded bg-brand px-2 py-0.5 text-xs text-white">Save</button>
                  </form>
                </td>
                <td className="px-3 py-2">{l.bookingLinkClicked ? "✅" : "-"}</td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {l.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-slate-400">
                  No leads yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
