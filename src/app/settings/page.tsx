"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpotlightCard } from "@/components/aceternity";
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

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

const PRESET_EMOJIS = ["👨", "👩", "👦", "👧", "🧑", "👴", "👵", "🐶", "🐱"];

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: PRESET_COLORS[0],
    emoji: "👤",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchUsers();
        }
      } else {
        // Create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchUsers();
        }
      }
      closeDialog();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this family member?")) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  function openDialog(user?: User) {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        color: user.color,
        emoji: user.emoji || "👤",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        color: PRESET_COLORS[users.length % PRESET_COLORS.length],
        emoji: PRESET_EMOJIS[users.length % PRESET_EMOJIS.length],
      });
    }
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({ name: "", color: PRESET_COLORS[0], emoji: "👤" });
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <a href="/" className="text-2xl hover:opacity-70 transition-opacity">←</a>
          <div>
            <h1 className="text-3xl font-bold text-white">⚙️ Settings</h1>
            <p className="text-slate-400 mt-1">Manage your family</p>
          </div>
        </div>
      </header>

      {/* Family Members Section */}
      <section className="max-w-4xl mx-auto">
        <SpotlightCard className="bg-slate-900 border-slate-800" spotlightColor="rgba(59, 130, 246, 0.1)">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">👨‍👩‍👧‍👦 Family Members</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-500">
                  + Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit Family Member" : "Add Family Member"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  {/* Emoji */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setFormData({ ...formData, emoji })}
                          className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                            formData.emoji === emoji
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-slate-700 bg-slate-800 hover:border-slate-600"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-10 h-10 rounded-xl border-2 transition-all ${
                            formData.color === color
                              ? "border-white scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-400 mb-2">Preview</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: formData.color + "30", borderColor: formData.color, borderWidth: 2 }}
                      >
                        {formData.emoji}
                      </div>
                      <span className="text-lg font-medium">{formData.name || "Name"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.name}
                      className="flex-1 bg-blue-600 hover:bg-blue-500"
                    >
                      {editingUser ? "Save Changes" : "Add Member"}
                    </Button>
                    <Button onClick={closeDialog} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* User List */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
              <p className="text-slate-400 mb-4">No family members yet</p>
              <Button onClick={() => openDialog()} variant="outline">
                Add your first family member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: user.color + "30", borderColor: user.color, borderWidth: 2 }}
                  >
                    {user.emoji || "👤"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-slate-400 text-sm">
                      {user.pointsBalance} points
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openDialog(user)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:border-red-400"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <a href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">🏠</span>
            <span className="text-xs">Home</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">📅</span>
            <span className="text-xs">Calendar</span>
          </a>
          <a href="/chores" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">✅</span>
            <span className="text-xs">Chores</span>
          </a>
          <a href="/meals" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">🍽️</span>
            <span className="text-xs">Meals</span>
          </a>
          <a href="/settings" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-medium">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
