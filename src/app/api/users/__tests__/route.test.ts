import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { GET, POST } from "../route";

describe("GET /api/users", () => {
  beforeEach(() => {
    mockPrisma.user.findMany.mockReset();
  });

  test("returns user list", async () => {
    const users = [
      { id: "1", name: "Alice", color: "#ff0000", pointsBalance: 10 },
      { id: "2", name: "Bob", color: "#0000ff", pointsBalance: 5 },
    ];
    mockPrisma.user.findMany.mockResolvedValueOnce(users);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Alice");
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    mockPrisma.user.create.mockReset();
  });

  test("returns 400 if name missing", async () => {
    const req = createMockRequest("POST", { color: "#ff0000" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if color missing", async () => {
    const req = createMockRequest("POST", { name: "Alice" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and creates user", async () => {
    const user = {
      id: "1",
      name: "Alice",
      color: "#ff0000",
      emoji: null,
      pointsBalance: 0,
    };
    mockPrisma.user.create.mockResolvedValueOnce(user);

    const req = createMockRequest("POST", {
      name: "Alice",
      color: "#ff0000",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Alice");
  });

  test("returns 201 with emoji", async () => {
    const user = {
      id: "2",
      name: "Bob",
      color: "#0000ff",
      emoji: "🎮",
      pointsBalance: 0,
    };
    mockPrisma.user.create.mockResolvedValueOnce(user);

    const req = createMockRequest("POST", {
      name: "Bob",
      color: "#0000ff",
      emoji: "🎮",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.emoji).toBe("🎮");
  });
});
