"use client";

import { SpotlightCard, BentoGrid, BentoGridItem, GlowingCard } from "@/components/aceternity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting()}, Family! 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-white">{currentTime}</div>
          <div className="text-slate-400 flex items-center justify-end gap-2 mt-1">
            <span>☀️</span>
            <span>54°F · Clear</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <BentoGrid className="max-w-7xl mx-auto">
        {/* Tonight's Dinner - Large */}
        <BentoGridItem
          className="md:col-span-2 bg-gradient-to-br from-orange-950 to-red-950 border-orange-800"
          title={
            <span className="text-2xl">Tonight&apos;s Dinner 🍽️</span>
          }
          description={
            <div className="mt-2">
              <div className="text-3xl font-bold text-white mb-2">Honey Garlic Chicken</div>
              <div className="flex gap-4 text-slate-300">
                <span>⏱️ 40 min</span>
                <span>👨‍👩‍👧‍👦 4 servings</span>
                <span>🔥 420 cal</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="bg-orange-600 hover:bg-orange-500">View Recipe</Button>
                <Button variant="outline" className="border-orange-600 text-orange-300">Change Meal</Button>
              </div>
            </div>
          }
        />

        {/* Chores Summary */}
        <SpotlightCard className="bg-slate-900 border-slate-800" spotlightColor="rgba(34, 197, 94, 0.1)">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">✅ Chores</h2>
            <Badge variant="secondary" className="bg-emerald-900 text-emerald-300">3/7 done</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="flex-1">Empty dishwasher</span>
              <span className="text-emerald-400 text-sm">✓ Liam</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="flex-1">Take out trash</span>
              <span className="text-blue-400 text-sm">Chris</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="flex-1">Fold laundry</span>
              <span className="text-pink-400 text-sm">Sarah</span>
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline">View All Chores →</Button>
        </SpotlightCard>

        {/* Grocery List */}
        <GlowingCard className="bg-slate-900" glowColor="rgba(59, 130, 246, 0.3)">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">🛒 Grocery List</h2>
            <Badge className="bg-yellow-900 text-yellow-300">12 items</Badge>
          </div>
          <div className="text-slate-400 text-sm mb-4">
            Ready for shopping
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">Chicken</Badge>
            <Badge variant="outline">Broccoli</Badge>
            <Badge variant="outline">Rice</Badge>
            <Badge variant="outline">+9 more</Badge>
          </div>
          <Button className="w-full">Open Shopping List</Button>
        </GlowingCard>

        {/* Calendar */}
        <SpotlightCard className="md:col-span-2 bg-slate-900 border-slate-800" spotlightColor="rgba(147, 51, 234, 0.1)">
          <h2 className="text-xl font-semibold mb-4">📅 Today&apos;s Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Pediatrician — Emma</div>
                <div className="text-slate-400 text-sm">10:00 AM · Dr. Wilson&apos;s Office</div>
              </div>
              <div className="text-slate-500">2h 30m</div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-1 h-12 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Soccer Practice — Liam</div>
                <div className="text-slate-400 text-sm">4:00 PM · Recreation Field</div>
              </div>
              <div className="text-slate-500">6h</div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-1 h-12 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">🚒 Fire Dept Meeting</div>
                <div className="text-slate-400 text-sm">7:00 PM · Station 4</div>
              </div>
              <div className="text-slate-500">9h 30m</div>
            </div>
          </div>
        </SpotlightCard>

        {/* Quick Actions */}
        <BentoGridItem
          className="bg-slate-900 border-slate-800"
          title="Quick Actions"
          description={
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" className="h-16 flex-col">
                <span className="text-xl mb-1">📝</span>
                <span className="text-xs">Add Note</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <span className="text-xl mb-1">⏰</span>
                <span className="text-xs">Set Timer</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <span className="text-xl mb-1">🍽️</span>
                <span className="text-xs">Suggest Meal</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <span className="text-xl mb-1">⚙️</span>
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          }
        />
      </BentoGrid>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Button variant="ghost" className="flex-col h-auto py-2 text-white">
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2 text-slate-400">
            <span className="text-2xl mb-1">📅</span>
            <span className="text-xs">Calendar</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2 text-slate-400">
            <span className="text-2xl mb-1">✅</span>
            <span className="text-xs">Chores</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2 text-slate-400">
            <span className="text-2xl mb-1">🍽️</span>
            <span className="text-xs">Meals</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2 text-slate-400">
            <span className="text-2xl mb-1">🛒</span>
            <span className="text-xs">Grocery</span>
          </Button>
        </div>
      </nav>

      <div className="h-24"></div>
    </div>
  );
}
