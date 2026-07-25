import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { HOTEL } from "@/lib/config";

export const dynamic = "force-dynamic";

const promoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  roomType: z.string().optional(),
  rate: z.string().optional(),
  stayStart: z.string().optional(),
  stayEnd: z.string().optional(),
  bookingStart: z.string().optional(),
  bookingEnd: z.string().optional(),
  endDate: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "active", "expired", "archived"]),
  priority: z.coerce.number().int().default(0),
});

async function createPromotion(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const parsed = promoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const [row] = await db
    .insert(schema.promotions)
    .values({ ...parsed.data, bookingUrl: HOTEL.directBookingUrl })
    .returning();
  await logAudit({
    adminUser: session.username,
    action: "promotion_create",
    entity: "promotion",
    entityId: String(row.id),
    after: parsed.data,
  });
  revalidatePath("/admin/promotions");
}

async function setStatus(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["draft", "active", "expired", "archived"].includes(status)) return;
  const [before] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
  await db
    .update(schema.promotions)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.promotions.id, id));
  await logAudit({
    adminUser: session.username,
    action: "promotion_status_update",
    entity: "promotion",
    entityId: String(id),
    before: { status: before?.status },
    after: { status },
  });
  revalidatePath("/admin/promotions");
}

export default async function PromotionsPage() {
  const promos = await db
    .select()
    .from(schema.promotions)
    .orderBy(desc(schema.promotions.priority), desc(schema.promotions.updatedAt));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Promotions</h1>

      <div className="mb-8 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Create Promotion</h2>
        <form action={createPromotion} className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <input name="name" placeholder="Promotion Name *" required className="rounded border px-2 py-1" />
          <input name="rate" placeholder="Rate เช่น 888 บาท/คืน" className="rounded border px-2 py-1" />
          <input name="roomType" placeholder="Room Type (deluxe / all)" className="rounded border px-2 py-1" />
          <input name="priority" type="number" placeholder="Priority" defaultValue={0} className="rounded border px-2 py-1" />
          <input name="stayStart" type="date" title="Stay start" className="rounded border px-2 py-1" />
          <input name="stayEnd" type="date" title="Stay end" className="rounded border px-2 py-1" />
          <input name="bookingEnd" type="date" title="Booking deadline" className="rounded border px-2 py-1" />
          <input name="endDate" type="date" title="Promotion end date (auto-expire)" className="rounded border px-2 py-1" />
          <textarea name="description" placeholder="Description *" required className="col-span-2 rounded border px-2 py-1" />
          <textarea name="terms" placeholder="Terms & conditions" className="col-span-2 rounded border px-2 py-1" />
          <select name="status" defaultValue="draft" className="rounded border px-2 py-1">
            <option value="draft">draft</option>
            <option value="active">active</option>
          </select>
          <button className="rounded bg-brand px-3 py-1 text-white">Create</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              {["Name", "Rate", "Room", "Stay", "Book by", "Ends", "Priority", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.rate ?? "-"}</td>
                <td className="px-3 py-2">{p.roomType ?? "all"}</td>
                <td className="px-3 py-2 text-xs">{p.stayStart ?? "-"} → {p.stayEnd ?? "-"}</td>
                <td className="px-3 py-2 text-xs">{p.bookingEnd ?? "-"}</td>
                <td className="px-3 py-2 text-xs">{p.endDate ?? "-"}</td>
                <td className="px-3 py-2">{p.priority}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : p.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {["active", "expired", "archived"].map((s) => (
                      <form key={s} action={setStatus}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="rounded border px-2 py-0.5 text-xs hover:bg-slate-50">{s}</button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-400">No promotions</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
