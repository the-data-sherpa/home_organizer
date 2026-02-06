import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "home_organizer_session";
const SESSION_DURATION_DAYS = 30;

export function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

export function verifyPin(pin: string): boolean {
  const storedHash = process.env.FAMILY_PIN_HASH;
  if (!storedHash) {
    console.error("FAMILY_PIN_HASH not configured");
    return false;
  }
  return hashPin(pin) === storedHash;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashPin(sessionToken);
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
    path: "/",
  });
  
  // In a real app, you'd store hashedToken in a database
  // For now, we just set a simple session cookie
  cookieStore.set(`${SESSION_COOKIE_NAME}_valid`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionValid = cookieStore.get(`${SESSION_COOKIE_NAME}_valid`);
  return sessionValid?.value === "true";
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(`${SESSION_COOKIE_NAME}_valid`);
}
