import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["active", "resolved", "handoff"].includes(status)) return;
  await db
    .update(schema.conversations)
    .set({
      status,
      humanHandoff: status === "handoff",
      updatedAt: new Date(),
    })
    .where(eq(schema.conversations.id, id));
  revalidatePath("/admin/conversations");
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const conversations = await db
    .select()
    .from(schema.conversations)
    .orderBy(desc(schema.conversations.updatedAt))
    .limit(100);

  const selectedId = searchParams.id ? Number(searchParams.id) : conversations[0]?.id;
  const msgs = selectedId
    ? await db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, selectedId))
        .orderBy(schema.messages.createdAt)
        .limit(200)
    : [];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 max-h-[75vh] overflow-y-auto rounded-xl border bg-white shadow-sm">
        {conversations.map((c) => (
          <a
            key={c.id}
            href={`/admin/conversations?id=${c.id}`}
            className={`block border-b px-3 py-2 text-sm hover:bg-slate-50 ${
              c.id === selectedId ? "bg-slate-100" : ""
            }`}
          >
            <div className="flex justify-between">
              <span className="font-mono text-xs">{c.lineUserId.slice(0, 14)}…</span>
              <span
                className={`rounded px-1.5 text-xs ${
                  c.humanHandoff
                    ? "bg-red-100 text-red-700"
                    : c.status === "resolved"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {c.humanHandoff ? "handoff" : c.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">intent: {c.lastIntent ?? "-"}</p>
          </a>
        ))}
        {conversations.length === 0 && (
          <p className="p-6 text-center text-slate-400">No conversations</p>
        )}
      </div>

      <div className="col-span-2 rounded-xl border bg-white p-4 shadow-sm">
        {selectedId ? (
          <>
            <div className="mb-3 flex gap-2">
              {["active", "handoff", "resolved"].map((s) => (
                <form key={s} action={setStatus}>
                  <input type="hidden" name="id" value={selectedId} />
                  <input type="hidden" name="status" value={s} />
                  <button className="rounded border px-2 py-0.5 text-xs hover:bg-slate-50">
                    Mark {s}
                  </button>
                </form>
              ))}
            </div>
            <div className="max-h-[65vh] space-y-2 overflow-y-auto">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-slate-100"
                      : "ml-auto bg-brand text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-slate-400" : "text-slate-200"}`}>
                    {m.intent ?? ""} · {m.createdAt.toISOString().slice(11, 16)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-slate-400">Select a conversation</p>
        )}
      </div>
    </div>
  );
}
