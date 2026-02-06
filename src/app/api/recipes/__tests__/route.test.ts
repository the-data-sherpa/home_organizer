import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { GET, POST } from "../route";

describe("GET /api/recipes", () => {
  beforeEach(() => {
    mockPrisma.recipe.findMany.mockReset();
  });

  test("returns recipes list", async () => {
    const recipes = [
      { id: "1", name: "Pasta", isFavorite: false },
      { id: "2", name: "Salad", isFavorite: true },
    ];
    mockPrisma.recipe.findMany.mockResolvedValueOnce(recipes);

    const req = createMockRequest("GET", undefined, {});
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  test("passes favorites filter to Prisma", async () => {
    mockPrisma.recipe.findMany.mockResolvedValueOnce([]);

    const req = createMockRequest("GET", undefined, {
      searchParams: { favorites: "true" },
    });
    await GET(req);

    expect(mockPrisma.recipe.findMany).toHaveBeenCalledTimes(1);
  });

  test("passes search filter to Prisma", async () => {
    mockPrisma.recipe.findMany.mockResolvedValueOnce([]);

    const req = createMockRequest("GET", undefined, {
      searchParams: { search: "chicken" },
    });
    await GET(req);

    expect(mockPrisma.recipe.findMany).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/recipes", () => {
  beforeEach(() => {
    mockPrisma.recipe.create.mockReset();
  });

  test("returns 400 if name missing", async () => {
    const req = createMockRequest("POST", { description: "tasty" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and creates recipe", async () => {
    const recipe = { id: "1", name: "Pasta", ingredients: [], steps: [] };
    mockPrisma.recipe.create.mockResolvedValueOnce(recipe);

    const req = createMockRequest("POST", { name: "Pasta" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Pasta");
  });
});
