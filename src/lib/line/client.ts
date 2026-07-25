const LINE_API = "https://api.line.me/v2/bot";

function accessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? process.env.lineTK;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  return token;
}

async function lineFetch(path: string, body: unknown): Promise<Response> {
  const res = await fetch(`${LINE_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`LINE API error ${res.status}: ${text}`);
  }
  return res;
}

export type LineMessage = Record<string, unknown>;

export async function replyMessage(replyToken: string, messages: LineMessage[]): Promise<void> {
  await lineFetch("/message/reply", { replyToken, messages: messages.slice(0, 5) });
}

export async function pushMessage(to: string, messages: LineMessage[]): Promise<void> {
  await lineFetch("/message/push", { to, messages: messages.slice(0, 5) });
}

export async function getProfile(
  userId: string,
): Promise<{ displayName?: string; language?: string } | null> {
  try {
    const res = await fetch(`${LINE_API}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken()}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as { displayName?: string; language?: string };
  } catch {
    return null;
  }
}
