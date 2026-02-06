import { describe, expect, test, beforeEach } from "bun:test";
import { mockPrisma } from "@/test/setup";
import { createMockRequest } from "@/test/helpers";
import { GET, POST, DELETE } from "../route";

describe("GET /api/grocery", () => {
  beforeEach(() => {
    mockPrisma.groceryItem.findMany.mockReset();
  });

  test("returns ordered grocery items", async () => {
    const items = [
      { id: "1", name: "Milk", checked: false, section: "Dairy" },
      { id: "2", name: "Bread", checked: true, section: "Bakery" },
    ];
    mockPrisma.groceryItem.findMany.mockResolvedValueOnce(items);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

describe("POST /api/grocery", () => {
  beforeEach(() => {
    mockPrisma.groceryItem.create.mockReset();
  });

  test("returns 400 if name missing", async () => {
    const req = createMockRequest("POST", { section: "Dairy" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 201 and creates item with default section", async () => {
    const item = {
      id: "1",
      name: "Apples",
      section: "Other",
      checked: false,
    };
    mockPrisma.groceryItem.create.mockResolvedValueOnce(item);

    const req = createMockRequest("POST", { name: "Apples" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.section).toBe("Other");
  });

  test("returns 201 with specified section", async () => {
    const item = {
      id: "2",
      name: "Milk",
      section: "Dairy",
      checked: false,
    };
    mockPrisma.groceryItem.create.mockResolvedValueOnce(item);

    const req = createMockRequest("POST", {
      name: "Milk",
      section: "Dairy",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.section).toBe("Dairy");
  });
});

describe("DELETE /api/grocery", () => {
  beforeEach(() => {
    mockPrisma.groceryItem.deleteMany.mockReset();
  });

  test("deletes only checked items when checkedOnly=true", async () => {
    mockPrisma.groceryItem.deleteMany.mockResolvedValueOnce({ count: 3 });

    const req = createMockRequest("DELETE", undefined, {
      searchParams: { checkedOnly: "true" },
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.groceryItem.deleteMany).toHaveBeenCalledWith({
      where: { checked: true },
    });
  });

  test("deletes all items when checkedOnly is not set", async () => {
    mockPrisma.groceryItem.deleteMany.mockResolvedValueOnce({ count: 5 });

    const req = createMockRequest("DELETE", undefined, {});
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.groceryItem.deleteMany).toHaveBeenCalledWith({});
  });
});
