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
      { id: "1", name: "Dishes", points: 3, completions: [] },
      { id: "2", name: "Vacuum", points: 5, completions: [] },
    ];
    mockPrisma.chore.findMany.mockResolvedValueOnce(chores);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
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

  test("returns 201 and creates chore", async () => {
    const chore = {
      id: "1",
      name: "Dishes",
      points: 3,
      isClaimable: false,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
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
    };
    mockPrisma.chore.create.mockResolvedValueOnce(chore);

    const req = createMockRequest("POST", { name: "Sweep" });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  test("returns 201 with assignedToId", async () => {
    const chore = {
      id: "3",
      name: "Laundry",
      points: 5,
      assignedToId: "user1",
      assignedTo: { id: "user1", name: "Alice" },
    };
    mockPrisma.chore.create.mockResolvedValueOnce(chore);

    const req = createMockRequest("POST", {
      name: "Laundry",
      points: 5,
      assignedToId: "user1",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
