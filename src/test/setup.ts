import { mock } from "bun:test";
import { hashPin } from "@/lib/auth";

/** Set env var so verifyPin works in tests */
process.env.FAMILY_PIN_HASH = hashPin("123456");

/** Mock Prisma client — individual tests configure return values via mockResolvedValueOnce */
function createModelMock() {
  return {
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
    findFirst: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({})),
    update: mock(() => Promise.resolve({})),
    upsert: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
    deleteMany: mock(() => Promise.resolve({ count: 0 })),
  };
}

const mockPrisma = {
  user: createModelMock(),
  chore: createModelMock(),
  choreAssignment: createModelMock(),
  choreCompletion: createModelMock(),
  recipe: createModelMock(),
  mealPlan: createModelMock(),
  groceryItem: createModelMock(),
  pantryItem: createModelMock(),
  $transaction: mock((args: unknown) => {
    if (Array.isArray(args)) return Promise.resolve(args);
    if (typeof args === "function") return (args as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
    return Promise.resolve([]);
  }),
};

mock.module("@/lib/db", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

export { mockPrisma };
