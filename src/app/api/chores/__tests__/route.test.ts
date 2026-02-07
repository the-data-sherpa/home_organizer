import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { GET, POST } from "../route";

describe("GET /api/chores", () => {
  beforeEach(() => {
    mockPrisma.chore.findMany.mockReset();
  });

  test("returns chores list", async () => {
    const chores = [
      { id: "1", name: "Dishes", points: 3, assignments: [], completions: [] },
      { id: "2", name: "Vacuum", points: 5, assignments: [], completions: [] },
    ];
    mockPrisma.chore.findMany.mockResolvedValueOnce(chores);

    const req = createMockRequest("GET");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  test("passes weekOffset to query", async () => {
    mockPrisma.chore.findMany.mockResolvedValueOnce([]);

    const req = createMockRequest("GET", undefined, {
      searchParams: { weekOffset: "-1" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/chores", () => {
  beforeEach(() => {
    mockPrisma.chore.create.mockReset();
  });

  test("returns 400 if name missing", async () => {
    const req = createMockRequest("POST", { points: 3 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and creates chore with defaults", async () => {
    const chore = {
      id: "1",
      name: "Dishes",
      points: 3,
      isClaimable: false,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      assignments: [],
    };
    mockPrisma.chore.create.mockResolvedValueOnce(chore);

    const req = createMockRequest("POST", { name: "Dishes", points: 3 });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Dishes");
  });

  test("returns 201 with default points when not specified", async () => {
    const chore = {
      id: "2",
      name: "Sweep",
      points: 1,
      isClaimable: false,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      assignments: [],
    };
    mockPrisma.chore.create.mockResolvedValueOnce(chore);

    const req = createMockRequest("POST", { name: "Sweep" });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  test("returns 201 with assignedUserIds", async () => {
    const chore = {
      id: "3",
      name: "Laundry",
      points: 5,
      assignments: [
        { userId: "user1", user: { id: "user1", name: "Alice" } },
        { userId: "user2", user: { id: "user2", name: "Bob" } },
      ],
    };
    mockPrisma.chore.create.mockResolvedValueOnce(chore);

    const req = createMockRequest("POST", {
      name: "Laundry",
      points: 5,
      assignedUserIds: ["user1", "user2"],
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.assignments).toHaveLength(2);
  });
});
