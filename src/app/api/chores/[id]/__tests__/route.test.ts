import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest, createMockParams } from "@/test/helpers";
import { GET, PATCH, DELETE } from "../route";

describe("GET /api/chores/[id]", () => {
  beforeEach(() => {
    mockPrisma.chore.findUnique.mockReset();
  });

  test("returns 404 if chore not found", async () => {
    mockPrisma.chore.findUnique.mockResolvedValueOnce(null);
    const req = createMockRequest("GET");
    const res = await GET(req, createMockParams({ id: "missing" }));
    expect(res.status).toBe(404);
  });

  test("returns chore with assignments", async () => {
    const chore = {
      id: "chore1",
      name: "Dishes",
      assignments: [
        { userId: "user1", user: { id: "user1", name: "Alice" } },
      ],
      completions: [],
    };
    mockPrisma.chore.findUnique.mockResolvedValueOnce(chore);

    const req = createMockRequest("GET");
    const res = await GET(req, createMockParams({ id: "chore1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.assignments).toHaveLength(1);
    expect(body.assignments[0].userId).toBe("user1");
  });
});

describe("PATCH /api/chores/[id]", () => {
  beforeEach(() => {
    mockPrisma.chore.update.mockReset();
    mockPrisma.choreAssignment.deleteMany.mockReset();
    mockPrisma.choreAssignment.create.mockReset();
    mockPrisma.$transaction.mockReset();
    mockPrisma.$transaction.mockImplementation((args: unknown) => {
      if (typeof args === "function")
        return (args as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
      if (Array.isArray(args)) return Promise.resolve(args);
      return Promise.resolve([]);
    });
  });

  test("updates chore name without changing assignments", async () => {
    const chore = { id: "chore1", name: "Clean Dishes", assignments: [] };
    mockPrisma.chore.update.mockResolvedValueOnce(chore);

    const req = createMockRequest("PATCH", { name: "Clean Dishes" });
    const res = await PATCH(req, createMockParams({ id: "chore1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Clean Dishes");
  });

  test("replaces assignments when assignedUserIds provided", async () => {
    const chore = {
      id: "chore1",
      name: "Dishes",
      assignments: [
        { userId: "user1", user: { id: "user1", name: "Alice" } },
        { userId: "user2", user: { id: "user2", name: "Bob" } },
      ],
    };
    mockPrisma.choreAssignment.deleteMany.mockResolvedValueOnce({ count: 1 });
    mockPrisma.choreAssignment.create.mockResolvedValue({});
    mockPrisma.chore.update.mockResolvedValueOnce(chore);

    const req = createMockRequest("PATCH", {
      assignedUserIds: ["user1", "user2"],
    });
    const res = await PATCH(req, createMockParams({ id: "chore1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.assignments).toHaveLength(2);
  });

  test("clears assignments when empty array provided", async () => {
    const chore = { id: "chore1", name: "Dishes", assignments: [] };
    mockPrisma.choreAssignment.deleteMany.mockResolvedValueOnce({ count: 2 });
    mockPrisma.chore.update.mockResolvedValueOnce(chore);

    const req = createMockRequest("PATCH", { assignedUserIds: [] });
    const res = await PATCH(req, createMockParams({ id: "chore1" }));
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/chores/[id]", () => {
  beforeEach(() => {
    mockPrisma.chore.delete.mockReset();
  });

  test("deletes chore and returns success", async () => {
    mockPrisma.chore.delete.mockResolvedValueOnce({});

    const req = createMockRequest("DELETE");
    const res = await DELETE(req, createMockParams({ id: "chore1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
