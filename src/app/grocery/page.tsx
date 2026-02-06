"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard, GlowingCard } from "@/components/aceternity";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroceryItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  section: string | null;
  store: string | null;
  checked: boolean;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  expiresAt: string | null;
}

const SECTIONS = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Frozen",
  "Canned",
  "Pantry",
  "Other",
];

export default function GroceryPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemSection, setNewItemSection] = useState("Other");
  const [pantryDialogOpen, setPantryDialogOpen] = useState(false);
  const [newPantryName, setNewPantryName] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [groceryRes, pantryRes] = await Promise.all([
        fetch("/api/grocery"),
        fetch("/api/pantry"),
      ]);
      if (groceryRes.ok) setGroceryItems(await groceryRes.json());
      if (pantryRes.ok) setPantryItems(await pantryRes.json());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem() {
    if (!newItemName.trim()) return;
    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          section: newItemSection,
        }),
      });
      if (res.ok) {
        setNewItemName("");
        loadData();
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  }

  async function handleToggleItem(item: GroceryItem) {
    try {
      await fetch(`/api/grocery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !item.checked }),
      });
      loadData();
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await fetch(`/api/grocery/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  }

  async function handleClearChecked() {
    if (!confirm("Remove all checked items?")) return;
    try {
      await fetch("/api/grocery?checkedOnly=true", { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Failed to clear checked:", error);
    }
  }

  async function handleGenerateFromMeals() {
    setGenerating(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

      const res = await fetch("/api/grocery/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: today.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Added ${data.added} items from meal plans!`);
        loadData();
      }
    } catch (error) {
      console.error("Failed to generate list:", error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddPantryItem() {
    if (!newPantryName.trim()) return;
    try {
      const res = await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPantryName }),
      });
      if (res.ok) {
        setNewPantryName("");
        setPantryDialogOpen(false);
        loadData();
      }
    } catch (error) {
      console.error("Failed to add pantry item:", error);
    }
  }

  async function handleDeletePantryItem(id: string) {
    try {
      await fetch(`/api/pantry/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Failed to delete pantry item:", error);
    }
  }

  async function handleMoveToPantry(item: GroceryItem) {
    try {
      // Add to pantry
      await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        }),
      });
      // Remove from grocery list
      await fetch(`/api/grocery/${item.id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Failed to move to pantry:", error);
    }
  }

  // Group items by section
  const itemsBySection = SECTIONS.reduce((acc, section) => {
    acc[section] = groceryItems.filter((i) => i.section === section);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const uncheckedCount = groceryItems.filter((i) => !i.checked).length;
  const checkedCount = groceryItems.filter((i) => i.checked).length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">🛒 Grocery List</h1>
          <p className="text-slate-400 mt-1">
            {uncheckedCount} items to get
            {checkedCount > 0 && ` · ${checkedCount} checked`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateFromMeals}
            disabled={generating}
            variant="outline"
          >
            {generating ? "Generating..." : "📅 From Meals"}
          </Button>
          {checkedCount > 0 && (
            <Button onClick={handleClearChecked} variant="outline">
              🗑️ Clear Checked
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="list">🛒 Shopping List</TabsTrigger>
          <TabsTrigger value="pantry">🏠 Pantry ({pantryItems.length})</TabsTrigger>
        </TabsList>

        {/* Shopping List Tab */}
        <TabsContent value="list">
          {/* Quick Add */}
          <div className="flex gap-2 mb-6">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add item..."
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              className="bg-slate-800 border-slate-700 flex-1"
            />
            <select
              value={newItemSection}
              onChange={(e) => setNewItemSection(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 text-white"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-500">
              Add
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : groceryItems.length === 0 ? (
            <SpotlightCard className="bg-slate-900 border-slate-800 text-center py-12">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-slate-400 mb-4">Your list is empty</p>
              <Button onClick={handleGenerateFromMeals} variant="outline">
                Generate from meal plans
              </Button>
            </SpotlightCard>
          ) : (
            <div className="space-y-6">
              {SECTIONS.map((section) => {
                const items = itemsBySection[section];
                if (items.length === 0) return null;

                return (
                  <section key={section}>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {getSectionEmoji(section)} {section}
                      <Badge variant="secondary">{items.length}</Badge>
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            item.checked
                              ? "bg-slate-800/50 opacity-60"
                              : "bg-slate-800"
                          }`}
                        >
                          <button
                            onClick={() => handleToggleItem(item)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            {item.checked && "✓"}
                          </button>
                          <span
                            className={`flex-1 ${
                              item.checked ? "line-through text-slate-500" : ""
                            }`}
                          >
                            {item.quantity && `${item.quantity} `}
                            {item.unit && `${item.unit} `}
                            {item.name}
                          </span>
                          {item.checked && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveToPantry(item)}
                              className="text-emerald-400 text-xs"
                            >
                              → Pantry
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Pantry Tab */}
        <TabsContent value="pantry">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-400">
              Items you have on hand (excluded from generated lists)
            </p>
            <Dialog open={pantryDialogOpen} onOpenChange={setPantryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500">
                  + Add to Pantry
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Add Pantry Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    value={newPantryName}
                    onChange={(e) => setNewPantryName(e.target.value)}
                    placeholder="Item name..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddPantryItem()}
                    className="bg-slate-800 border-slate-700"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddPantryItem}
                      disabled={!newPantryName.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-500"
                    >
                      Add to Pantry
                    </Button>
                    <Button
                      onClick={() => setPantryDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {pantryItems.length === 0 ? (
            <SpotlightCard className="bg-slate-900 border-slate-800 text-center py-12">
              <div className="text-5xl mb-4">🏠</div>
              <p className="text-slate-400 mb-4">Pantry is empty</p>
              <p className="text-sm text-slate-500">
                Add items you have at home to avoid adding them to grocery lists
              </p>
            </SpotlightCard>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pantryItems.map((item) => (
                <GlowingCard
                  key={item.id}
                  className="bg-slate-900 p-4"
                  glowColor="rgba(34, 197, 94, 0.2)"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.quantity && (
                        <div className="text-sm text-slate-400">
                          {item.quantity} {item.unit}
                        </div>
                      )}
                      {item.expiresAt && (
                        <div className="text-xs text-yellow-400 mt-1">
                          Exp: {new Date(item.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePantryItem(item.id)}
                      className="text-red-400 hover:text-red-300 -mr-2 -mt-1"
                    >
                      ×
                    </Button>
                  </div>
                </GlowingCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
          <Link
            href="/chores"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">✅</span>
            <span className="text-xs">Chores</span>
          </Link>
          <Link
            href="/meals"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs">Meals</span>
          </Link>
          <Link href="/grocery" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">🛒</span>
            <span className="text-xs font-medium">Grocery</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function getSectionEmoji(section: string): string {
  switch (section) {
    case "Produce":
      return "🥬";
    case "Meat":
      return "🥩";
    case "Dairy":
      return "🧀";
    case "Bakery":
      return "🍞";
    case "Frozen":
      return "🧊";
    case "Canned":
      return "🥫";
    case "Pantry":
      return "🫙";
    default:
      return "📦";
  }
}
