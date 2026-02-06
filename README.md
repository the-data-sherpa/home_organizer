# 🏠 Hearthboard

Your family's digital hearth — meals, chores, and schedules in one place. Designed for touchscreen displays and mobile PWA.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)

## Features

- **🍽️ Meal Planning** — Weekly meal calendar with recipe management, nutrition tracking, and kid meal suggestions
- **✅ Chores** — Assigned and claimable chores with points/rewards system
- **🛒 Smart Grocery** — Auto-generated shopping lists from meal plans with mobile sync
- **📅 Calendar** — Family schedule at a glance
- **📱 Multi-device** — Touchscreen display + mobile PWA

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui + Aceternity UI
- **Language:** TypeScript
- **Database:** SQLite (via Prisma)
- **Auth:** 6-digit household PIN

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- bun

### Installation

```bash
# Clone the repo
git clone https://github.com/the-data-sherpa/hearthboard.git
cd hearthboard

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Configure Your PIN

Generate a PIN hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_6_DIGIT_PIN').digest('hex'))"
```

Add the hash to `.env.local`:

```
FAMILY_PIN_HASH=your_generated_hash_here
```

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default dev PIN:** `123456`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/     # PIN authentication
│   │   ├── users/          # Family members CRUD
│   │   ├── recipes/        # Recipes CRUD + import
│   │   ├── meal-plans/     # Meal calendar
│   │   └── chores/         # Chores CRUD + complete
│   ├── login/              # PIN entry page
│   ├── meals/              # Meal planning page
│   ├── chores/             # Chores page
│   ├── cook/[id]/          # Cooking mode
│   ├── settings/           # Family management
│   └── page.tsx            # Dashboard
├── components/
│   ├── aceternity/         # Aceternity UI (spotlight, bento, glow)
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── db.ts               # Prisma client
│   ├── helpers.ts          # Shared pure helper functions
│   └── utils.ts            # Helpers
├── test/
│   ├── setup.ts            # Global test setup (env vars, Prisma mock)
│   └── helpers.ts          # Test utilities (createMockRequest, etc.)
├── middleware.ts           # Route protection
└── prisma/
    └── schema.prisma       # Database models
```

## Testing

The project uses [`bun:test`](https://bun.sh/docs/cli/test) — Bun's native test runner with a jest-compatible API. No extra test dependencies are needed.

### Running Tests

```bash
# Run all tests
bun test

# Watch mode (re-runs on file changes)
bun test --watch

# Run a specific test file
bun test src/lib/__tests__/helpers.test.ts
```

### Test Structure

Tests live in `__tests__/` directories next to the code they cover:

```
src/
├── __tests__/middleware.test.ts
├── lib/__tests__/
│   ├── helpers.test.ts          # Pure helper functions (greeting, earnings, dates, etc.)
│   └── auth.test.ts             # hashPin, verifyPin
├── app/api/
│   ├── auth/login/__tests__/    # Login route + rate limiting
│   ├── chores/__tests__/        # Chores CRUD
│   ├── chores/complete/__tests__/ # Chore completion + points
│   ├── users/__tests__/         # Users CRUD
│   ├── recipes/__tests__/       # Recipes CRUD
│   ├── recipes/import/__tests__/ # Recipe import parsers (parseDuration, parseInstructions, etc.)
│   ├── grocery/__tests__/       # Grocery CRUD + delete modes
│   ├── grocery/generate/__tests__/ # categorizeIngredient
│   ├── meal-plans/__tests__/    # Meal plans CRUD
│   └── weather/__tests__/       # getWeatherIcon
```

### How It Works

**Setup (`src/test/setup.ts`):** Loaded automatically before every test run via `bunfig.toml`. It:
- Sets `FAMILY_PIN_HASH` to a known value so auth tests are deterministic
- Mocks `@/lib/db` with a fake Prisma client where every model method is a mock function

**Test helpers (`src/test/helpers.ts`):** Provides `createMockRequest(method, body?, opts?)` to build `NextRequest` objects for route handler tests.

**Prisma mocking:** API route tests import `mockPrisma` from `src/test/setup` and configure return values per-test:

```ts
import { mockPrisma } from "@/test/setup";

beforeEach(() => {
  mockPrisma.user.findMany.mockReset();
});

test("returns user list", async () => {
  mockPrisma.user.findMany.mockResolvedValueOnce([{ id: "1", name: "Alice" }]);
  const res = await GET();
  expect(res.status).toBe(200);
});
```

### Writing New Tests

1. Create a `__tests__/` directory next to the file you're testing
2. Name the test file `<module>.test.ts`
3. For pure functions — import and test directly
4. For API routes — use `createMockRequest` and configure `mockPrisma` stubs
5. Reset mocks in `beforeEach` to isolate tests

### What's Not Tested

- React component rendering (client-side UI)
- shadcn/ui and Aceternity UI primitives
- `cn()` utility (trivial Tailwind merge wrapper)

## Roadmap

- [x] Project scaffolding
- [x] PIN authentication
- [x] Database setup (Prisma + SQLite)
- [x] Family member management
- [x] Meal planning + calendar
- [x] Recipe CRUD + URL import
- [x] Cooking mode (pin to screen)
- [x] Chores with points system
- [x] Leaderboard + earnings
- [x] Grocery list + pantry tracking
- [x] Generate list from meal plans
- [x] PWA setup (installable)
- [x] Weather widget
- [ ] Calendar integration (future)

## Contributing

This is a personal project, but PRs are welcome!

## License

MIT

---

Built with ❤️ for busy families
