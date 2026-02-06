"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SpotlightCard, BentoGrid, BentoGridItem, GlowingCard } from "@/components/aceternity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  color: string;
  emoji: string | null;
  pointsBalance: number;
}

interface Recipe {
  id: string;
  name: string;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
}

interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  recipe: Recipe;
}

interface Chore {
  id: string;
  name: string;
  points: number;
  assignedTo: User | null;
  isClaimable: boolean;
  daysOfWeek: number[];
  completions: { id: string; user: User }[];
}

interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  section: string | null;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [todaysMeal, setTodaysMeal] = useState<MealPlan | null>(null);
  const [todaysChores, setTodaysChores] = useState<Chore[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const [usersRes, mealsRes, choresRes, groceryRes] = await Promise.all([
        fetch("/api/users"),
        fetch(`/api/meal-plans?startDate=${today}&endDate=${today}`),
        fetch("/api/chores"),
        fetch("/api/grocery"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      
      if (mealsRes.ok) {
        const meals = await mealsRes.json();
        const dinner = meals.find((m: MealPlan) => m.mealType === "dinner");
        setTodaysMeal(dinner || null);
      }
      
      if (choresRes.ok) {
        const allChores = await choresRes.json();
        const dayOfWeek = new Date().getDay();
        setTodaysChores(
          allChores.filter((c: Chore) => c.daysOfWeek.includes(dayOfWeek))
        );
      }
      
      if (groceryRes.ok) setGroceryItems(await groceryRes.json());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completedChores = todaysChores.filter((c) => c.completions.length > 0).length;
  const uncheckedGrocery = groceryItems.filter((i) => !i.checked).length;
  const totalPoints = users.reduce((sum, u) => sum + u.pointsBalance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting()}! 👋
          </h1>
          <p className="text-slate-400 mt-1">{dateString}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-white">{timeString}</div>
        </div>
      </header>

      {/* Main Grid */}
      <BentoGrid className="max-w-7xl mx-auto">
        {/* Tonight's Dinner */}
        <BentoGridItem
          className="md:col-span-2 bg-gradient-to-br from-orange-950 to-red-950 border-orange-800"
          title={<span className="text-2xl">Tonight&apos;s Dinner 🍽️</span>}
          description={
            todaysMeal ? (
              <div className="mt-2">
                <div className="text-3xl font-bold text-white mb-2">
                  {todaysMeal.recipe.name}
                </div>
                <div className="flex gap-4 text-slate-300">
                  {todaysMeal.recipe.prepTime && (
                    <span>🔪 {todaysMeal.recipe.prepTime}m prep</span>
                  )}
                  {todaysMeal.recipe.cookTime && (
                    <span>🍳 {todaysMeal.recipe.cookTime}m cook</span>
                  )}
                  {todaysMeal.recipe.servings && (
                    <span>👨‍👩‍👧‍👦 {todaysMeal.recipe.servings} servings</span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/cook/${todaysMeal.recipe.id}`}>
                    <Button className="bg-orange-600 hover:bg-orange-500">
                      👨‍🍳 Start Cooking
                    </Button>
                  </Link>
                  <Link href="/meals">
                    <Button variant="outline" className="border-orange-600 text-orange-300">
                      Change Meal
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xl text-slate-400 mb-4">No dinner planned</div>
                <Link href="/meals">
                  <Button className="bg-orange-600 hover:bg-orange-500">
                    Plan Tonight&apos;s Meal
                  </Button>
                </Link>
              </div>
            )
          }
        />

        {/* Today's Chores */}
        <SpotlightCard
          className="bg-slate-900 border-slate-800"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">✅ Today&apos;s Chores</h2>
            <Badge
              variant="secondary"
              className={
                completedChores === todaysChores.length && todaysChores.length > 0
                  ? "bg-emerald-900 text-emerald-300"
                  : "bg-slate-700"
              }
            >
              {completedChores}/{todaysChores.length}
            </Badge>
          </div>
          {todaysChores.length === 0 ? (
            <p className="text-slate-400">No chores scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todaysChores.slice(0, 4).map((chore) => {
                const isCompleted = chore.completions.length > 0;
                const completedBy = chore.completions[0]?.user;
                return (
                  <div
                    key={chore.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      isCompleted ? "bg-emerald-900/20" : "bg-slate-800/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCompleted ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                    />
                    <span
                      className={`flex-1 ${
                        isCompleted ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {chore.name}
                    </span>
                    {isCompleted && completedBy ? (
                      <span
                        className="text-sm"
                        style={{ color: completedBy.color }}
                      >
                        {completedBy.emoji || "✓"} {completedBy.name}
                      </span>
                    ) : chore.assignedTo ? (
                      <span
                        className="text-sm"
                        style={{ color: chore.assignedTo.color }}
                      >
                        {chore.assignedTo.emoji || "👤"} {chore.assignedTo.name}
                      </span>
                    ) : (
                      <span className="text-sm text-purple-400">Anyone</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/chores">
            <Button className="w-full mt-4" variant="outline">
              View All Chores →
            </Button>
          </Link>
        </SpotlightCard>

        {/* Grocery List */}
        <GlowingCard className="bg-slate-900" glowColor="rgba(59, 130, 246, 0.3)">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">🛒 Grocery List</h2>
            {uncheckedGrocery > 0 ? (
              <Badge className="bg-yellow-900 text-yellow-300">
                {uncheckedGrocery} items
              </Badge>
            ) : (
              <Badge className="bg-emerald-900 text-emerald-300">All done!</Badge>
            )}
          </div>
          {groceryItems.length === 0 ? (
            <p className="text-slate-400 mb-4">List is empty</p>
          ) : (
            <div className="space-y-1 mb-4">
              {groceryItems
                .filter((i) => !i.checked)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="text-sm text-slate-300 flex items-center gap-2"
                  >
                    <span className="text-slate-500">○</span>
                    {item.name}
                  </div>
                ))}
              {uncheckedGrocery > 5 && (
                <div className="text-sm text-slate-500">
                  +{uncheckedGrocery - 5} more items
                </div>
              )}
            </div>
          )}
          <Link href="/grocery">
            <Button className="w-full">Open Shopping List</Button>
          </Link>
        </GlowingCard>

        {/* Family Points */}
        <SpotlightCard
          className="bg-slate-900 border-slate-800"
          spotlightColor="rgba(234, 179, 8, 0.1)"
        >
          <h2 className="text-xl font-semibold mb-4">🏆 Family Points</h2>
          {users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-2">No family members yet</p>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  Add Family
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {users
                  .sort((a, b) => b.pointsBalance - a.pointsBalance)
                  .map((user, idx) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
                    >
                      <span className="text-lg">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : user.emoji || "👤"}
                      </span>
                      <span className="flex-1" style={{ color: user.color }}>
                        {user.name}
                      </span>
                      <span className="font-bold">{user.pointsBalance} pts</span>
                    </div>
                  ))}
              </div>
              <div className="text-center text-slate-400 text-sm">
                Total: {totalPoints} pts · ${Math.floor(totalPoints / 10)}.00 earned
              </div>
            </>
          )}
        </SpotlightCard>

        {/* Quick Actions */}
        <BentoGridItem
          className="bg-slate-900 border-slate-800"
          title="Quick Actions"
          description={
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link href="/meals">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <span className="text-xl mb-1">🍽️</span>
                  <span className="text-xs">Plan Meals</span>
                </Button>
              </Link>
              <Link href="/chores">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <span className="text-xl mb-1">✅</span>
                  <span className="text-xs">Do Chores</span>
                </Button>
              </Link>
              <Link href="/grocery">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <span className="text-xl mb-1">🛒</span>
                  <span className="text-xs">Shop</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <span className="text-xl mb-1">⚙️</span>
                  <span className="text-xs">Settings</span>
                </Button>
              </Link>
            </div>
          }
        />
      </BentoGrid>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Link href="/" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/meals"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs">Meals</span>
          </Link>
          <Link
            href="/chores"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">✅</span>
            <span className="text-xs">Chores</span>
          </Link>
          <Link
            href="/grocery"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">🛒</span>
            <span className="text-xs">Grocery</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
