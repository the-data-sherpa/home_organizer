import { describe, expect, test, beforeEach, mock } from "bun:test";
import { createMockRequest } from "@/test/helpers";

/** Mock @/lib/auth so createSession doesn't touch real cookies */
mock.module("@/lib/auth", () => ({
  verifyPin: (pin: string) => pin === "123456",
  createSession: mock(() => Promise.resolve()),
  hashPin: (pin: string) => {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(pin).digest("hex");
  },
}));

/** Import after mocking */
const { POST } = await import("../route");

describe("POST /api/auth/login", () => {
  test("returns 400 for missing PIN", async () => {
    const req = createMockRequest("POST", {});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 for short PIN", async () => {
    const req = createMockRequest("POST", { pin: "123" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 for long PIN", async () => {
    const req = createMockRequest("POST", { pin: "1234567890" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 401 for incorrect PIN", async () => {
    const req = createMockRequest("POST", { pin: "000000" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test("returns 200 with success for correct PIN", async () => {
    const req = createMockRequest("POST", { pin: "123456" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("returns 400 for non-JSON body", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(req);
    const res = await POST(nextReq);
    expect(res.status).toBe(400);
  });

  test("returns 400 for non-string PIN", async () => {
    const req = createMockRequest("POST", { pin: 123456 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
