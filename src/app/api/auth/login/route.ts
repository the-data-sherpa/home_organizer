import { NextRequest, NextResponse } from "next/server";
import { verifyPin, createSession } from "@/lib/auth";

// Rate limiting: track failed attempts (in production, use Redis or similar)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function isRateLimited(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  
  const timeSinceLastAttempt = Date.now() - record.lastAttempt;
  if (timeSinceLastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(ip);
    return false;
  }
  
  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  record.count += 1;
  record.lastAttempt = Date.now();
  failedAttempts.set(ip, record);
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  // Check rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please wait 5 minutes." },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    const { pin } = body;
    
    if (!pin || typeof pin !== "string" || pin.length !== 6) {
      return NextResponse.json(
        { error: "Invalid PIN format" },
        { status: 400 }
      );
    }
    
    if (verifyPin(pin)) {
      clearFailedAttempts(ip);
      await createSession();
      return NextResponse.json({ success: true });
    } else {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Incorrect PIN" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
