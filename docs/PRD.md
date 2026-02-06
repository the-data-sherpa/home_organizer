# Home Organizer — Product Requirements Document

**Version:** 0.1  
**Date:** February 5, 2026  
**Status:** Planning

---

## Overview

A family command center designed for a touchscreen display, with mobile companion access. Helps manage meals, chores, grocery shopping, and family calendar.

**Target Users:** Family of 4 (2 adults, 2 kids)  
**Primary Interface:** Touchscreen display (wall-mounted or countertop)  
**Secondary Interface:** Mobile web (PWA)

---

## Authentication

- **6-digit household PIN**
- Single shared PIN for the entire family
- PIN hash stored in environment variable
- Session cookie (30 days) keeps touchscreen logged in
- Mobile requires PIN entry (with "remember device" option)
- Rate limiting: 5 failed attempts = 5 minute lockout

---

## Core Features

### 1. 🍽️ Meal Planning

**Functionality:**
- Weekly meal calendar (7-day view)
- Full recipe storage (ingredients, steps, cook time, prep time)
- **Pin recipe to screen** while cooking (large text, step-by-step mode)
- Macro/nutrition tracking per meal (calories, protein, carbs, fat)
- Recipe import from popular sites (AllRecipes, Food Network, etc.)
- Manual recipe entry

**Kid Suggestions Flow:**
- Kids can browse saved recipes or search
- Tap "Suggest This!" sends to parent queue
- Parents see suggestions, approve/deny
- Approved meals go on calendar

**Recipe Sources:**
- Manual entry
- URL import (using recipe-scrapers library)
- Favorites library (family go-to meals)

**Nutrition Data:**
- USDA FoodData API (free) for ingredient nutrition
- Calculate meal totals from ingredients
- Display macros on meal cards

---

### 2. ✅ Chores

**Functionality:**
- Weekly chore schedule (resets Sunday)
- Color-coded by family member
- Tap to mark complete on touchscreen
- Two types of chores:
  - **Assigned:** Pre-assigned to specific person/day
  - **Claimable:** Pool of available chores anyone can claim

**Points/Rewards System:**
- Each chore has a point value
- Conversion rate: 10 points = $1 base
- Tiered: Every 10 points after = additional $1
- Example: 30 points = $3
- Weekly summary shows earnings per person
- Optional: Streak bonuses, hard chore multipliers (future)

**Chore Properties:**
- Name
- Assigned to (person or "anyone")
- Day(s) of week
- Point value
- Recurring (yes/no)
- Completion status

---

### 3. 🛒 Grocery & Shopping

**MVP Scope:**
- Generate shopping list from meal plan ingredients
- Manual list additions
- Organize by store section (Produce, Dairy, Meat, etc.)
- Sync list to mobile
- Check off items on phone while shopping
- Manual pantry tracking (mark what you have)

**NOT in MVP (Future Feature):**
- ~~Automatic price comparison~~
- ~~Store deal hunting~~
- ~~Multi-store optimization~~

**Pantry Tracking:**
- Start empty, user builds over time
- "Mark as bought" option adds to pantry
- Manual add/remove items
- Optional expiration dates (future)

**Stores:**
- User adds preferred stores in settings
- Currently for organization only (which store to shop at)
- Future: Price comparison when data sources available

**Local Stores (Chris's area):**
- Food Lion
- Ingles
- Publix
- Aldi

---

### 4. 📅 Calendar

**Functionality:**
- Family calendar view (day/week/month)
- Color-coded by family member
- Event types: Appointments, Activities, Reminders
- Quick add from touchscreen
- Sync with Google Calendar (future enhancement)

**Display:**
- Today's events prominent on dashboard
- Countdown to upcoming events
- Visual timeline view

---

## User Interface

### Display Mode (Touchscreen)
- Optimized for 10"+ touchscreen
- Large touch targets (min 60px)
- Always-on dashboard view
- Dark theme (reduces burn-in, looks good)
- Quick glance info: time, weather, today's meals/chores

### Mobile Mode (Phone Browser - PWA)
- Responsive design
- Focus on grocery list checkout
- Quick chore check-off
- Meal suggestions (for kids)
- Install as PWA for app-like experience

---

## Technical Architecture

**Stack:**
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Vercel Postgres or Supabase)
- **Hosting:** Vercel
- **Auth:** Custom PIN-based (middleware)
- **APIs:** 
  - USDA FoodData (nutrition)
  - Recipe scrapers (imports)

**Data Models:**

```
User (family member)
- id, name, color, pin (optional future), points_balance

Recipe
- id, name, ingredients[], steps[], prep_time, cook_time, servings, macros{}, source_url

MealPlan
- id, date, meal_type (breakfast/lunch/dinner), recipe_id

Chore
- id, name, assigned_to, days[], points, is_claimable, is_recurring

ChoreCompletion
- id, chore_id, completed_by, completed_at, week_of

GroceryItem
- id, name, quantity, unit, section, meal_plan_id (nullable), checked, store

PantryItem
- id, name, quantity, unit, expires_at (nullable)

MealSuggestion
- id, suggested_by, recipe_id, status (pending/approved/denied), suggested_at
```

---

## Screens

1. **Dashboard** — Overview: time, weather, today's schedule, chores, tonight's dinner
2. **Meal Planning** — Week view, recipe details, cooking mode
3. **Chores** — Weekly grid, mark complete, claim available, points tracker
4. **Grocery** — Shopping list, pantry view, check off mode
5. **Calendar** — Full calendar view (future)
6. **Settings** — Family members, stores, PIN management
7. **Recipe Detail** — Full recipe with pin-to-screen cooking mode
8. **Cooking Mode** — Large text, step-by-step, timers

---

## MVP Milestones

### Phase 1: Foundation ✅
- [x] Project setup (Next.js, Tailwind, DB)
- [x] PIN authentication
- [x] Basic layout and navigation
- [x] Family member management

### Phase 2: Meals ✅
- [x] Recipe CRUD (manual entry)
- [x] Meal calendar
- [x] Recipe import (URL scraping)
- [x] Cooking mode (pin to screen)
- [x] Macro tracking

### Phase 3: Chores ✅
- [x] Chore CRUD
- [x] Weekly schedule view
- [x] Mark complete
- [x] Points system
- [x] Claimable chores

### Phase 4: Grocery ✅
- [x] Auto-generate list from meals
- [x] Manual list management
- [x] Section organization
- [ ] Mobile sync (PWA in Phase 5)
- [x] Check-off functionality
- [x] Basic pantry tracking

### Phase 5: Polish
- [ ] PWA setup
- [ ] Weather widget
- [ ] Kid meal suggestions
- [ ] Dashboard refinements
- [ ] Mobile responsive polish

---

## Future Enhancements (Post-MVP)

- [ ] Price comparison (when data sources available)
- [ ] Google Calendar sync
- [ ] Voice commands
- [ ] Per-user PINs
- [ ] Chore streak bonuses
- [ ] Pantry expiration alerts
- [ ] Kid reward redemption store
- [ ] Photo slideshow (idle mode)
- [ ] Package tracking
- [ ] School calendar integration

---

## Open Questions

1. ~~Price comparison data source~~ → Deferred to future
2. Recipe database licensing (if we want built-in suggestions)
3. Offline support needed?
4. Specific touchscreen hardware recommendation?

---

*Document maintained by Owen*
