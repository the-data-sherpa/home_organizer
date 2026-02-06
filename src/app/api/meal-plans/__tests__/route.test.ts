import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { GET, POST, DELETE } from "../route";

describe("GET /api/meal-plans", () => {
  beforeEach(() => {
    mockPrisma.mealPlan.findMany.mockReset();
  });

  test("returns meal plans without date range", async () => {
    const plans = [{ id: "1", date: "2024-06-15", mealType: "dinner" }];
    mockPrisma.mealPlan.findMany.mockResolvedValueOnce(plans);

    const req = createMockRequest("GET", undefined, {});
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  test("returns meal plans with date range", async () => {
    mockPrisma.mealPlan.findMany.mockResolvedValueOnce([]);

    const req = createMockRequest("GET", undefined, {
      searchParams: {
        startDate: "2024-06-10",
        endDate: "2024-06-16",
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/meal-plans", () => {
  beforeEach(() => {
    mockPrisma.mealPlan.upsert.mockReset();
  });

  test("returns 400 if required fields missing", async () => {
    const req = createMockRequest("POST", { date: "2024-06-15" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if recipeId missing", async () => {
    const req = createMockRequest("POST", {
      date: "2024-06-15",
      mealType: "dinner",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and upserts meal plan", async () => {
    const plan = {
      id: "1",
      date: "2024-06-15",
      mealType: "dinner",
      recipeId: "r1",
      recipe: { id: "r1", name: "Pasta" },
    };
    mockPrisma.mealPlan.upsert.mockResolvedValueOnce(plan);

    const req = createMockRequest("POST", {
      date: "2024-06-15",
      mealType: "dinner",
      recipeId: "r1",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/meal-plans", () => {
  beforeEach(() => {
    mockPrisma.mealPlan.delete.mockReset();
  });

  test("returns 400 if date missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { mealType: "dinner" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if mealType missing", async () => {
    const req = createMockRequest("DELETE", undefined, {
      searchParams: { date: "2024-06-15" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  test("returns 200 on successful delete", async () => {
    mockPrisma.mealPlan.delete.mockResolvedValueOnce({});

    const req = createMockRequest("DELETE", undefined, {
      searchParams: { date: "2024-06-15", mealType: "dinner" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
