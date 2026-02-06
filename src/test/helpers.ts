import { NextRequest } from "next/server";

/** Build a NextRequest for use in route handler tests. */
export function createMockRequest(
  method: string,
  body?: Record<string, unknown>,
  opts?: {
    searchParams?: Record<string, string>;
    headers?: Record<string, string>;
  },
): NextRequest {
  const url = new URL("http://localhost:3000/api/test");

  if (opts?.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(opts?.headers ?? {}),
  });

  const init: { method: string; headers: Headers; body?: string } = {
    method,
    headers,
  };

  if (body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(body);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(url, init as any);
}

/** Build NextRequest params object for dynamic route segments. */
export function createMockParams(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}
