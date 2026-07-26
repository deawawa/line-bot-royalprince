import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "rprp_admin_session";
const SESSION_HOURS = 12;

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
    if (!secret) throw new Error("ADMIN_SECRET is not set");
  return new TextEncoder().encode(secret.padEnd(32, "0"));
}

export async function createSession(username: string): Promise<void> {
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function getSession(): Promise<{ username: string } | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { username: String(payload.username) };
  } catch {
    return null;
  }
}

export function destroySession(): void {
  cookies().delete(COOKIE_NAME);
}

/** Constant-time-ish credential check against env-configured admin. */
export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}
