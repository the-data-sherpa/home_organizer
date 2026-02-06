"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard, GlowingCard } from "@/components/aceternity";
import { calculateEarnings } from "@/lib/helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  color: string;
  emoji: string | null;
  pointsBalance: number;
}

interface ChoreCompletion {
  id: string;
  completedBy: string;
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
  assignedTo: User | null;
  assignedToId: string | null;
  completions: ChoreCompletion[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [choreForm, setChoreForm] = useState({
    name: "",
    description: "",
    points: "1",
    isClaimable: false,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6] as number[],
    assignedToId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [choresRes, usersRes] = await Promise.all([
        fetch("/api/chores"),
        fetch("/api/users"),
      ]);
      if (choresRes.ok) setChores(await choresRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChore() {
    try {
      const payload = {
        name: choreForm.name,
        description: choreForm.description || null,
        points: parseInt(choreForm.points) || 1,
        isClaimable: choreForm.isClaimable,
        daysOfWeek: choreForm.daysOfWeek,
        assignedToId: choreForm.assignedToId || null,
      };

      const url = editingChore
        ? `/api/chores/${editingChore.id}`
        : "/api/chores";
      const method = editingChore ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        loadData();
        closeDialog();
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

  async function handleCompleteChore(chore: Chore, userId: string) {
    try {
      const res = await fetch("/api/chores/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choreId: chore.id, userId }),
      });
      if (res.ok) loadData();
    } catch (error) {
      console.error("Failed to complete chore:", error);
    }
  }

  async function handleUncompleteChore(chore: Chore, userId: string) {
    try {
      const res = await fetch(
        `/api/chores/complete?choreId=${chore.id}&userId=${userId}`,
        { method: "DELETE" }
      );
      if (res.ok) loadData();
    } catch (error) {
      console.error("Failed to undo completion:", error);
    }
  }

  function openDialog(chore?: Chore) {
    if (chore) {
      setEditingChore(chore);
      setChoreForm({
        name: chore.name,
        description: chore.description || "",
        points: chore.points.toString(),
        isClaimable: chore.isClaimable,
        daysOfWeek: chore.daysOfWeek,
        assignedToId: chore.assignedToId || "",
      });
    } else {
      setEditingChore(null);
      setChoreForm({
        name: "",
        description: "",
        points: "1",
        isClaimable: false,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        assignedToId: "",
      });
    }
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingChore(null);
  }

  function toggleDay(day: number) {
    const newDays = choreForm.daysOfWeek.includes(day)
      ? choreForm.daysOfWeek.filter((d) => d !== day)
      : [...choreForm.daysOfWeek, day];
    setChoreForm({ ...choreForm, daysOfWeek: newDays });
  }

  function isChoreCompletedBy(chore: Chore, userId: string): boolean {
    return chore.completions.some((c) => c.completedBy === userId);
  }

  function getCompletionForUser(chore: Chore, userId: string): ChoreCompletion | undefined {
    return chore.completions.find((c) => c.completedBy === userId);
  }

  const today = new Date().getDay();
  const todaysChores = chores.filter((c) => c.daysOfWeek.includes(today));
  const totalPoints = users.reduce((sum, u) => sum + u.pointsBalance, 0);
  const weeklyCompletions = chores.reduce(
    (sum, c) => sum + c.completions.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">✅ Chores</h1>
          <p className="text-slate-400 mt-1">
            Week of{" "}
            {new Date(
              Date.now() - new Date().getDay() * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              className="bg-blue-600 hover:bg-blue-500"
            >
              + Add Chore
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChore ? "Edit Chore" : "Add Chore"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Chore Name *
                </label>
                <Input
                  value={choreForm.name}
                  onChange={(e) =>
                    setChoreForm({ ...choreForm, name: e.target.value })
                  }
                  placeholder="e.g., Empty dishwasher"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Points
                </label>
                <Input
                  type="number"
                  value={choreForm.points}
                  onChange={(e) =>
                    setChoreForm({ ...choreForm, points: e.target.value })
                  }
                  min="1"
                  className="bg-slate-800 border-slate-700 w-24"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Assigned To
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setChoreForm({ ...choreForm, assignedToId: "", isClaimable: true })
                    }
                    className={`px-3 py-2 rounded-lg transition-all ${
                      choreForm.isClaimable
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Anyone (Claimable)
                  </button>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() =>
                        setChoreForm({
                          ...choreForm,
                          assignedToId: user.id,
                          isClaimable: false,
                        })
                      }
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        choreForm.assignedToId === user.id
                          ? "ring-2 ring-white"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          choreForm.assignedToId === user.id
                            ? user.color
                            : user.color + "40",
                      }}
                    >
                      {user.emoji || "👤"} {user.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Days
                </label>
                <div className="flex gap-1">
                  {DAYS.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(idx)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        choreForm.daysOfWeek.includes(idx)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveChore}
                  disabled={!choreForm.name}
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
                >
                  {editingChore ? "Save Changes" : "Add Chore"}
                </Button>
                <Button onClick={closeDialog} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
          <div className="text-3xl font-bold text-blue-400">{calculateEarnings(totalPoints)}</div>
          <div className="text-sm text-slate-400">Earned</div>
        </GlowingCard>
      </div>

      {/* User Filter */}
      {users.length > 0 && (
        <div className="flex gap-2 mb-6">
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
              {user.emoji || "👤"} {user.name}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : chores.length === 0 ? (
        <SpotlightCard className="bg-slate-900 border-slate-800 text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-slate-400 mb-4">No chores yet</p>
          <Button onClick={() => openDialog()} variant="outline">
            Add your first chore
          </Button>
        </SpotlightCard>
      ) : (
        <div className="space-y-6">
          {/* Today's Chores */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Today ({DAYS[today]})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysChores
                .filter(
                  (c) =>
                    selectedUser === null ||
                    c.assignedToId === selectedUser ||
                    c.isClaimable
                )
                .map((chore) => {
                  const isCompleted =
                    selectedUser !== null
                      ? isChoreCompletedBy(chore, selectedUser)
                      : chore.completions.length > 0;
                  const completedByUser = selectedUser
                    ? getCompletionForUser(chore, selectedUser)?.user
                    : chore.completions[0]?.user;

                  return (
                    <SpotlightCard
                      key={chore.id}
                      className={`bg-slate-900 border-slate-800 ${
                        isCompleted ? "opacity-60" : ""
                      }`}
                      spotlightColor={
                        isCompleted
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(59, 130, 246, 0.1)"
                      }
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className={`font-semibold text-lg ${
                              isCompleted ? "line-through text-slate-500" : ""
                            }`}
                          >
                            {chore.name}
                          </h3>
                          {chore.assignedTo && (
                            <div
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: chore.assignedTo.color }}
                            >
                              {chore.assignedTo.emoji || "👤"}{" "}
                              {chore.assignedTo.name}
                            </div>
                          )}
                          {chore.isClaimable && !chore.assignedTo && (
                            <div className="text-sm mt-1 text-purple-400">
                              🙋 Anyone can claim
                            </div>
                          )}
                        </div>
                        <Badge className="bg-yellow-900 text-yellow-300">
                          {chore.points} pts
                        </Badge>
                      </div>

                      {isCompleted && completedByUser && (
                        <div className="text-sm text-emerald-400 mb-3">
                          ✓ Done by {completedByUser.emoji || "👤"}{" "}
                          {completedByUser.name}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {!isCompleted ? (
                          users.map((user) => (
                            <Button
                              key={user.id}
                              size="sm"
                              onClick={() => handleCompleteChore(chore, user.id)}
                              style={{ backgroundColor: user.color }}
                            >
                              {user.emoji || "✓"} Done
                            </Button>
                          ))
                        ) : selectedUser && isChoreCompletedBy(chore, selectedUser) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400"
                            onClick={() => handleUncompleteChore(chore, selectedUser)}
                          >
                            Undo
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(chore)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400"
                          onClick={() => handleDeleteChore(chore.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </SpotlightCard>
                  );
                })}
            </div>
          </section>

          {/* All Chores */}
          {chores.filter((c) => !c.daysOfWeek.includes(today)).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Other Days</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chores
                  .filter((c) => !c.daysOfWeek.includes(today))
                  .map((chore) => (
                    <SpotlightCard
                      key={chore.id}
                      className="bg-slate-900 border-slate-800 opacity-60"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{chore.name}</h3>
                        <Badge variant="secondary">{chore.points} pts</Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        {chore.daysOfWeek.map((d) => DAYS[d]).join(", ")}
                      </div>
                    </SpotlightCard>
                  ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Points Summary by User */}
      {users.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>
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
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : user.emoji || "👤"}
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

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/calendar"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">📅</span>
            <span className="text-xs">Calendar</span>
          </Link>
          <Link href="/chores" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">✅</span>
            <span className="text-xs font-medium">Chores</span>
          </Link>
          <Link
            href="/meals"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs">Meals</span>
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
