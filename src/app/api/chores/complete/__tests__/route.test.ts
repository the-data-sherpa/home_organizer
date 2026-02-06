import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { POST, DELETE } from "../route";

describe("POST /api/chores/complete", () => {
  beforeEach(() => {
    mockPrisma.chore.findUnique.mockReset();
    mockPrisma.choreCompletion.upsert.mockReset();
    mockPrisma.user.update.mockReset();
  });

  test("returns 400 if choreId missing", async () => {
    const req = createMockRequest("POST", { userId: "user1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if userId missing", async () => {
    const req = createMockRequest("POST", { choreId: "chore1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if chore not found", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce(null);
    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  test("returns 201 and creates completion", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce({
      id: "chore1",
      points: 5,
    });
    mockPrisma.choreCompletion.upsert.mockResolvedValueOnce({
      id: "comp1",
      choreId: "chore1",
      completedBy: "user1",
      pointsEarned: 5,
    });
    mockPrisma.user.update.mockResolvedValueOnce({});

    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/chores/complete", () => {
  beforeEach(() => {
    mockPrisma.choreCompletion.findUnique.mockReset();
    mockPrisma.choreCompletion.delete.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.$transaction.mockReset();
    mockPrisma.$transaction.mockImplementation((args: unknown) => {
      if (Array.isArray(args)) return Promise.resolve(args);
      return Promise.resolve([]);
    });
  });

  test("returns 400 if choreId missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { userId: "user1" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if userId missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if completion not found", async () => {
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce(null);
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1", userId: "user1" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });

  test("returns 200 and deletes completion", async () => {
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce({
      id: "comp1",
      choreId: "chore1",
      completedBy: "user1",
      pointsEarned: 5,
    });

    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1", userId: "user1" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
