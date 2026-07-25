import crypto from "crypto";

/**
 * Verifies the X-Line-Signature header against the raw request body.
 * Every webhook request MUST pass this check - otherwise reject with 401.
 * Env fallback: accepts legacy var name "Channelsecret" as well.
 */
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.LINE_CHANNEL_SECRET ?? process.env.Channelsecret;
    if (!secret || !signature) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
    try {
          return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
          return false;
    }
}
