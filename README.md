# 🏠 Home Organizer

A modern family command center designed for touchscreen displays. Manage meals, chores, grocery lists, and family calendars from a central hub.

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
- **Database:** Vercel Postgres (coming soon)
- **Auth:** 6-digit household PIN

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/the-data-sherpa/home_organizer.git
cd home_organizer

# Install dependencies
npm install

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
npm run dev
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
│   └── utils.ts            # Helpers
├── middleware.ts           # Route protection
└── prisma/
    └── schema.prisma       # Database models
```

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
- [ ] Grocery list generation
- [ ] Mobile PWA
- [ ] Calendar integration

## Contributing

This is a personal project, but PRs are welcome!

## License

MIT

---

Built with ❤️ for busy families
