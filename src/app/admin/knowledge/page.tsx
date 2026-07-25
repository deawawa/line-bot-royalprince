import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Hotel Information", "Rooms", "Facilities", "Breakfast", "Promotions", "Policies",
  "Booking", "Cancellation", "Payment", "Check-in", "Check-out", "Full 24-Hour Stay",
  "Long Stay", "Corporate", "Group Booking", "Transportation", "Nearby Attractions",
  "FAQ", "Contact",
] as const;

const kbSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(CATEGORIES),
  language: z.enum(["th", "en"]).default("th"),
  priority: z.coerce.number().int().default(0),
});

async function createEntry(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const parsed = kbSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const [row] = await db.insert(schema.knowledgeBase).values(parsed.data).returning();
  await logAudit({
    adminUser: session.username,
    action: "kb_create",
    entity: "knowledge_base",
    entityId: String(row.id),
    after: parsed.data,
  });
  revalidatePath("/admin/knowledge");
}

async function togglePublish(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const id = Number(formData.get("id"));
  const [row] = await db.select().from(schema.knowledgeBase).where(eq(schema.knowledgeBase.id, id));
  if (!row) return;
  const status = row.status === "published" ? "draft" : "published";
  await db
    .update(schema.knowledgeBase)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.knowledgeBase.id, id));
  await logAudit({
    adminUser: session.username,
    action: "kb_status_update",
    entity: "knowledge_base",
    entityId: String(id),
    before: { status: row.status },
    after: { status },
  });
  revalidatePath("/admin/knowledge");
}

export default async function KnowledgePage() {
  const entries = await db
    .select()
    .from(schema.knowledgeBase)
    .orderBy(desc(schema.knowledgeBase.priority), desc(schema.knowledgeBase.updatedAt))
    .limit(300);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Knowledge Base</h1>

      <div className="mb-8 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Add Entry</h2>
        <form action={createEntry} className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <input name="title" placeholder="Title *" required className="col-span-2 rounded border px-2 py-1" />
          <select name="category" className="rounded border px-2 py-1">
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select name="language" className="rounded border px-2 py-1">
            <option value="th">th</option>
            <option value="en">en</option>
          </select>
          <textarea
            name="content"
            placeholder="Content * (ข้อมูลที่ AI จะใช้ตอบลูกค้า)"
            required
            rows={3}
            className="col-span-3 rounded border px-2 py-1"
          />
          <div className="flex flex-col gap-2">
            <input name="priority" type="number" placeholder="Priority" defaultValue={0} className="rounded border px-2 py-1" />
            <button className="rounded bg-brand px-3 py-1 text-white">Add</button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{e.title}</span>
                <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {e.category}
                </span>
                <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {e.language}
                </span>
                <span
                  className={`ml-1 rounded px-2 py-0.5 text-xs font-bold ${
                    e.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {e.status}
                </span>
              </div>
              <form action={togglePublish}>
                <input type="hidden" name="id" value={e.id} />
                <button className="rounded border px-2 py-0.5 text-xs hover:bg-slate-50">
                  {e.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{e.content}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-slate-400">No entries</p>}
      </div>
    </div>
  );
}
