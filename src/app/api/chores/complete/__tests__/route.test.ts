import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { POST, DELETE } from "../route";

describe("POST /api/chores/complete", () => {
  beforeEach(() => {
    mockPrisma.chore.findUnique.mockReset();
    mockPrisma.choreCompletion.findUnique.mockReset();
    mockPrisma.choreCompletion.create.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.$transaction.mockReset();
    mockPrisma.$transaction.mockImplementation((args: unknown) => {
      if (typeof args === "function")
        return (args as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
      if (Array.isArray(args)) return Promise.resolve(args);
      return Promise.resolve([]);
    });
  });

  test("returns 400 if choreId missing", async () => {
    const req = createMockRequest("POST", { userId: "user1", date: "2024-06-15" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if userId missing", async () => {
    const req = createMockRequest("POST", { choreId: "chore1", date: "2024-06-15" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if date missing", async () => {
    const req = createMockRequest("POST", { choreId: "chore1", userId: "user1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if chore not found", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce(null);
    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
      date: "2024-06-15",
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  test("returns 403 if user not assigned and chore not claimable", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce({
      id: "chore1",
      points: 5,
      isClaimable: false,
      assignments: [{ userId: "user2" }],
    });
    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
      date: "2024-06-15",
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  test("returns 201 for assigned user", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce({
      id: "chore1",
      points: 5,
      isClaimable: false,
      assignments: [{ userId: "user1" }],
    });
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce(null);
    mockPrisma.choreCompletion.create.mockResolvedValueOnce({
      id: "comp1",
      choreId: "chore1",
      completedBy: "user1",
      pointsEarned: 5,
    });
    mockPrisma.user.update.mockResolvedValueOnce({});

    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
      date: "2024-06-15",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  test("returns 201 for claimable chore by any user", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce({
      id: "chore1",
      points: 3,
      isClaimable: true,
      assignments: [],
    });
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce(null);
    mockPrisma.choreCompletion.create.mockResolvedValueOnce({
      id: "comp1",
      choreId: "chore1",
      completedBy: "user1",
      pointsEarned: 3,
    });
    mockPrisma.user.update.mockResolvedValueOnce({});

    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
      date: "2024-06-15",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  test("does not double-count points when completion already exists", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce({
      id: "chore1",
      points: 5,
      isClaimable: false,
      assignments: [{ userId: "user1" }],
    });
    // Existing completion found — should not create or increment
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce({
      id: "existing",
      choreId: "chore1",
      completedBy: "user1",
      pointsEarned: 5,
    });

    const req = createMockRequest("POST", {
      choreId: "chore1",
      userId: "user1",
      date: "2024-06-15",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    // create should NOT have been called since completion already exists
    expect(mockPrisma.choreCompletion.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
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
      searchParams: { userId: "user1", date: "2024-06-15" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if userId missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1", date: "2024-06-15" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if date missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1", userId: "user1" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if completion not found", async () => {
    mockPrisma.choreCompletion.findUnique.mockResolvedValueOnce(null);
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { choreId: "chore1", userId: "user1", date: "2024-06-15" },
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
      searchParams: { choreId: "chore1", userId: "user1", date: "2024-06-15" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
