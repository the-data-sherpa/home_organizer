import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

function createRequest(pathname: string, cookies?: Record<string, string>): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  const req = new NextRequest(url);
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe("proxy", () => {
  test("allows /login without session", () => {
    const req = createRequest("/login");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  test("allows /api/auth/login without session", () => {
    const req = createRequest("/api/auth/login");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  test("allows /_next/static paths", () => {
    const req = createRequest("/_next/static/chunk.js");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  test("allows paths with file extensions", () => {
    const req = createRequest("/manifest.json");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  test("redirects to /login when no session cookie", () => {
    const req = createRequest("/");
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  test("passes through when session cookie is valid", () => {
    const req = createRequest("/", {
      hearthboard_session_valid: "true",
    });
    const res = proxy(req);
    expect(res.status).toBe(200);
  });
});
