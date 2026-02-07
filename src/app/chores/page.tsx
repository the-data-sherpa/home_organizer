"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlowingCard } from "@/components/aceternity";
import { SpotlightCard } from "@/components/aceternity";
import { calculateEarnings, getWeekDates, formatDate } from "@/lib/helpers";
import { WeeklyChart } from "./components/weekly-chart";
import { ChoreDialog, type ChoreFormData } from "./components/chore-dialog";

interface User {
  id: string;
  name: string;
  color: string;
  emoji: string | null;
  pointsBalance: number;
}

interface ChoreAssignment {
  userId: string;
  user: User;
}

interface ChoreCompletion {
  id: string;
  completedBy: string;
  completionDate: string;
  user: User;
  completedAt: string;
  pointsEarned: number;
}

interface Chore {
  id: string;
  name: string;
  description: string | null;
  points: number;
  isClaimable: boolean;
  isRecurring: boolean;
  daysOfWeek: number[];
  assignments: ChoreAssignment[];
  completions: ChoreCompletion[];
}

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);

  const loadData = useCallback(async () => {
    try {
      const [choresRes, usersRes] = await Promise.all([
        fetch(`/api/chores?weekOffset=${weekOffset}`),
        fetch("/api/users"),
      ]);
      if (choresRes.ok) setChores(await choresRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveChore(data: ChoreFormData) {
    try {
      const url = editingChore ? `/api/chores/${editingChore.id}` : "/api/chores";
      const method = editingChore ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        loadData();
        setDialogOpen(false);
        setEditingChore(null);
      }
    } catch (error) {
      console.error("Failed to save chore:", error);
    }
  }

  async function handleDeleteChore(id: string) {
    if (!confirm("Delete this chore?")) return;
    try {
      const res = await fetch(`/api/chores/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (error) {
      console.error("Failed to delete chore:", error);
    }
  }

  async function handleCompleteChore(choreId: string, userId: string, date: string) {
    try {
      const res = await fetch("/api/chores/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choreId, userId, date }),
      });
      if (res.ok) loadData();
    } catch (error) {
      console.error("Failed to complete chore:", error);
    }
  }

  async function handleUncompleteChore(choreId: string, userId: string, date: string) {
    try {
      const res = await fetch(
        `/api/chores/complete?choreId=${choreId}&userId=${userId}&date=${date}`,
        { method: "DELETE" },
      );
      if (res.ok) loadData();
    } catch (error) {
      console.error("Failed to undo completion:", error);
    }
  }

  function openDialog(chore?: Chore) {
    setEditingChore(chore ?? null);
    setDialogOpen(true);
  }

  const totalPoints = users.reduce((sum, u) => sum + u.pointsBalance, 0);
  const weeklyCompletions = chores.reduce((sum, c) => sum + c.completions.length, 0);

  const weekLabel = weekDates[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{"\u2705"} Chores</h1>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="text-slate-400 hover:text-white text-lg px-1"
            >
              {"\u2190"}
            </button>
            <p className="text-slate-400">Week of {weekLabel}</p>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="text-slate-400 hover:text-white text-lg px-1"
            >
              {"\u2192"}
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-xs text-blue-400 hover:text-blue-300 ml-1"
              >
                Today
              </button>
            )}
          </div>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-blue-600 hover:bg-blue-500"
        >
          + Add Chore
        </Button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlowingCard className="bg-slate-900 p-4 text-center" glowColor="rgba(34, 197, 94, 0.2)">
          <div className="text-3xl font-bold text-emerald-400">{weeklyCompletions}</div>
          <div className="text-sm text-slate-400">Done this week</div>
        </GlowingCard>
        <GlowingCard className="bg-slate-900 p-4 text-center" glowColor="rgba(234, 179, 8, 0.2)">
          <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
          <div className="text-sm text-slate-400">Total points</div>
        </GlowingCard>
        <GlowingCard className="bg-slate-900 p-4 text-center" glowColor="rgba(59, 130, 246, 0.2)">
          <div className="text-3xl font-bold text-blue-400">
            {calculateEarnings(totalPoints)}
          </div>
          <div className="text-sm text-slate-400">Earned</div>
        </GlowingCard>
      </div>

      {/* User Filter */}
      {users.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={selectedUser === null ? "default" : "outline"}
            onClick={() => setSelectedUser(null)}
          >
            All
          </Button>
          {users.map((user) => (
            <Button
              key={user.id}
              variant={selectedUser === user.id ? "default" : "outline"}
              onClick={() => setSelectedUser(user.id)}
              style={{
                backgroundColor: selectedUser === user.id ? user.color : undefined,
              }}
            >
              {user.emoji || "\u{1F464}"} {user.name}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : chores.length === 0 ? (
        <SpotlightCard className="bg-slate-900 border-slate-800 text-center py-12">
          <div className="text-5xl mb-4">{"\u2705"}</div>
          <p className="text-slate-400 mb-4">No chores yet</p>
          <Button onClick={() => openDialog()} variant="outline">
            Add your first chore
          </Button>
        </SpotlightCard>
      ) : (
        <WeeklyChart
          chores={chores}
          users={users}
          weekDates={weekDates}
          selectedUser={selectedUser}
          onComplete={handleCompleteChore}
          onUncomplete={handleUncompleteChore}
          onEdit={(chore) => openDialog(chore)}
          onDelete={handleDeleteChore}
        />
      )}

      {/* Leaderboard */}
      {users.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{"\u{1F3C6}"} Leaderboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {users
              .sort((a, b) => b.pointsBalance - a.pointsBalance)
              .map((user, idx) => (
                <GlowingCard
                  key={user.id}
                  className="bg-slate-900 p-4 text-center"
                  glowColor={user.color + "40"}
                >
                  <div className="text-3xl mb-2">
                    {idx === 0
                      ? "\u{1F947}"
                      : idx === 1
                        ? "\u{1F948}"
                        : idx === 2
                          ? "\u{1F949}"
                          : user.emoji || "\u{1F464}"}
                  </div>
                  <div className="font-semibold" style={{ color: user.color }}>
                    {user.name}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {user.pointsBalance} pts
                  </div>
                  <div className="text-sm text-slate-400">
                    {calculateEarnings(user.pointsBalance)}
                  </div>
                </GlowingCard>
              ))}
          </div>
        </section>
      )}

      {/* Chore Dialog */}
      <ChoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chore={editingChore}
        users={users}
        onSave={handleSaveChore}
      />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">{"\u{1F3E0}"}</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/calendar"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">{"\u{1F4C5}"}</span>
            <span className="text-xs">Calendar</span>
          </Link>
          <Link href="/chores" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">{"\u2705"}</span>
            <span className="text-xs font-medium">Chores</span>
          </Link>
          <Link
            href="/meals"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">{"\u{1F37D}\u{FE0F}"}</span>
            <span className="text-xs">Meals</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">{"\u2699\u{FE0F}"}</span>
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
