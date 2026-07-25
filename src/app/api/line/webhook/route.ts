import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLineSignature } from "@/lib/line/verify";
import { replyMessage, getProfile, type LineMessage } from "@/lib/line/client";
import { textWithQuickReply } from "@/lib/line/quickReply";
import { bookingCtaFlex, promotionCardFlex, contactCardFlex } from "@/lib/line/flex";
import { runEngine } from "@/lib/ai/engine";
import { trackEvent } from "@/lib/events";
import { upsertLead } from "@/lib/leads";
import { isRateLimited } from "@/lib/rateLimit";
import { ERROR_MESSAGE_TH, FIRST_MESSAGE_TH } from "@/lib/config";
import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const lineEventSchema = z.object({
  type: z.string(),
  replyToken: z.string().optional(),
  source: z.object({ userId: z.string().optional() }).optional(),
  message: z
    .object({ type: z.string(), text: z.string().optional() })
    .optional(),
  postback: z.object({ data: z.string() }).optional(),
});

const webhookSchema = z.object({ events: z.array(lineEventSchema).default([]) });

async function getOrCreateConversation(lineUserId: string) {
  const existing = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.lineUserId, lineUserId))
    .orderBy(desc(schema.conversations.createdAt))
    .limit(1);
  if (existing.length > 0 && existing[0].status !== "resolved") return existing[0];
  const [row] = await db.insert(schema.conversations).values({ lineUserId }).returning();
  await trackEvent("conversation_started", lineUserId);
  return row;
}

async function getHistory(conversationId: number) {
  const rows = await db
    .select({ role: schema.messages.role, content: schema.messages.content })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(10);
  return rows
    .reverse()
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));
}

async function handleTextMessage(lineUserId: string, replyToken: string, text: string) {
  await trackEvent("message_received", lineUserId);

  if (isRateLimited(lineUserId)) {
    await replyMessage(replyToken, [textWithQuickReply(ERROR_MESSAGE_TH)]);
    return;
  }

  const conversation = await getOrCreateConversation(lineUserId);

  // If the conversation is in human-handoff mode, stay silent so staff can reply.
  if (conversation.humanHandoff) return;

  const history = await getHistory(conversation.id);

  let output;
  try {
    output = await runEngine({ message: text, history });
  } catch (err) {
    console.error("AI engine error", err);
    await trackEvent("ai_error", lineUserId, { error: String(err) });
    await replyMessage(replyToken, [textWithQuickReply(ERROR_MESSAGE_TH)]);
    return;
  }

  // Persist messages
  await db.insert(schema.messages).values([
    { conversationId: conversation.id, role: "user", content: text, intent: output.intent },
    { conversationId: conversation.id, role: "assistant", content: output.text, intent: output.intent },
  ]);
  await db
    .update(schema.conversations)
    .set({ lastIntent: output.intent, humanHandoff: output.humanHandoff, updatedAt: new Date() })
    .where(eq(schema.conversations.id, conversation.id));

  // Lead capture
  const profile = await getProfile(lineUserId);
  await upsertLead(lineUserId, {
    displayName: profile?.displayName,
    language: output.language,
    intent: output.intent,
    leadScore: output.leadScore,
    humanHandoff: output.humanHandoff,
  });

  // Analytics
  if (output.intent === "room_info" || output.intent === "room_price")
    await trackEvent("room_inquiry", lineUserId);
  if (output.intent === "promotion") await trackEvent("promotion_view", lineUserId);
  if (output.intent === "availability") await trackEvent("availability_request", lineUserId);
  if (["booking_intent", "booking_request", "direct_booking"].includes(output.intent)) {
    await trackEvent("booking_intent", lineUserId);
    await db.insert(schema.bookingRequests).values({ lineUserId });
  }
  if (output.humanHandoff) await trackEvent("human_handoff", lineUserId);

  // Build reply bundle (max 5 LINE messages)
  const messages: LineMessage[] = [textWithQuickReply(output.text)];
  for (const promo of output.promotions.slice(0, 2)) {
    messages.push(promotionCardFlex(promo));
  }
  if (output.showBookingCta) {
    messages.push(bookingCtaFlex());
    await upsertLead(lineUserId, { intent: output.intent });
    await trackEvent("booking_link_clicked", lineUserId, { stage: "cta_sent", intent: output.intent });
  }
  if (output.showContactCard) messages.push(contactCardFlex());

  await replyMessage(replyToken, messages.slice(0, 5));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = webhookSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  await Promise.all(
    parsed.events.map(async (event) => {
      const lineUserId = event.source?.userId;
      try {
        if (event.type === "follow" && event.replyToken) {
          await replyMessage(event.replyToken, [textWithQuickReply(FIRST_MESSAGE_TH)]);
          return;
        }
        if (
          event.type === "message" &&
          event.message?.type === "text" &&
          event.message.text &&
          event.replyToken &&
          lineUserId
        ) {
          await handleTextMessage(lineUserId, event.replyToken, event.message.text);
          return;
        }
        if (event.type === "postback" && event.replyToken && lineUserId) {
          await handleTextMessage(lineUserId, event.replyToken, event.postback?.data ?? "");
        }
      } catch (err) {
        console.error("webhook event error", err);
        if (event.replyToken) {
          try {
            await replyMessage(event.replyToken, [textWithQuickReply(ERROR_MESSAGE_TH)]);
          } catch {
            /* already logged */
          }
        }
      }
    }),
  );

  return NextResponse.json({ ok: true });
}
