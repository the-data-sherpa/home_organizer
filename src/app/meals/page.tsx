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
import { getWeekDates, formatDate } from "@/lib/helpers";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  macros: Macros | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
}

interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  recipe: Recipe;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MealsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("dinner");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [recipeForm, setRecipeForm] = useState({
    name: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [{ name: "", quantity: "", unit: "" }],
    steps: [""],
    macros: { calories: "", protein: "", carbs: "", fat: "" },
  });

  const weekDates = getWeekDates(weekOffset);

  async function fetchRecipes() {
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    }
  }

  async function fetchMealPlans() {
    try {
      const dates = getWeekDates(weekOffset);
      const startDate = formatDate(dates[0]);
      const endDate = formatDate(dates[6]);
      const res = await fetch(
        `/api/meal-plans?startDate=${startDate}&endDate=${endDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setMealPlans(data);
      }
    } catch (error) {
      console.error("Failed to fetch meal plans:", error);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      const [recipesRes, mealsRes] = await Promise.all([
        fetch("/api/recipes"),
        fetch(`/api/meal-plans?startDate=${formatDate(getWeekDates(weekOffset)[0])}&endDate=${formatDate(getWeekDates(weekOffset)[6])}`)
      ]);
      
      if (mounted) {
        if (recipesRes.ok) {
          setRecipes(await recipesRes.json());
        }
        if (mealsRes.ok) {
          setMealPlans(await mealsRes.json());
        }
        setLoading(false);
      }
    }
    
    loadData();
    
    return () => { mounted = false; };
  }, [weekOffset]);

  async function handleSaveRecipe() {
    try {
      const payload = {
        name: recipeForm.name,
        description: recipeForm.description || null,
        prepTime: recipeForm.prepTime ? parseInt(recipeForm.prepTime) : null,
        cookTime: recipeForm.cookTime ? parseInt(recipeForm.cookTime) : null,
        servings: recipeForm.servings ? parseInt(recipeForm.servings) : null,
        ingredients: recipeForm.ingredients.filter((i) => i.name),
        steps: recipeForm.steps.filter((s) => s),
        macros:
          recipeForm.macros.calories ||
          recipeForm.macros.protein ||
          recipeForm.macros.carbs ||
          recipeForm.macros.fat
            ? {
                calories: parseInt(recipeForm.macros.calories) || 0,
                protein: parseInt(recipeForm.macros.protein) || 0,
                carbs: parseInt(recipeForm.macros.carbs) || 0,
                fat: parseInt(recipeForm.macros.fat) || 0,
              }
            : null,
      };

      const url = editingRecipe
        ? `/api/recipes/${editingRecipe.id}`
        : "/api/recipes";
      const method = editingRecipe ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchRecipes();
        closeRecipeDialog();
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  }

  async function handleDeleteRecipe(id: string) {
    if (!confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecipes();
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  }

  async function handleImportRecipe() {
    if (!importUrl) return;
    setImportLoading(true);
    try {
      const res = await fetch("/api/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });
      if (res.ok) {
        fetchRecipes();
        setImportDialogOpen(false);
        setImportUrl("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to import recipe");
      }
    } catch (error) {
      console.error("Failed to import recipe:", error);
      alert("Failed to import recipe");
    } finally {
      setImportLoading(false);
    }
  }

  async function handleToggleFavorite(recipe: Recipe) {
    try {
      await fetch(`/api/recipes/${recipe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !recipe.isFavorite }),
      });
      fetchRecipes();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  async function handleAssignMeal(recipeId: string) {
    if (!selectedDate) return;
    try {
      await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formatDate(selectedDate),
          mealType: selectedMealType,
          recipeId,
        }),
      });
      fetchMealPlans();
      setMealDialogOpen(false);
    } catch (error) {
      console.error("Failed to assign meal:", error);
    }
  }

  async function handleRemoveMeal(date: Date, mealType: string) {
    try {
      await fetch(
        `/api/meal-plans?date=${formatDate(date)}&mealType=${mealType}`,
        { method: "DELETE" }
      );
      fetchMealPlans();
    } catch (error) {
      console.error("Failed to remove meal:", error);
    }
  }

  function openRecipeDialog(recipe?: Recipe) {
    if (recipe) {
      setEditingRecipe(recipe);
      setRecipeForm({
        name: recipe.name,
        description: recipe.description || "",
        prepTime: recipe.prepTime?.toString() || "",
        cookTime: recipe.cookTime?.toString() || "",
        servings: recipe.servings?.toString() || "",
        ingredients:
          recipe.ingredients.length > 0
            ? recipe.ingredients
            : [{ name: "", quantity: "", unit: "" }],
        steps: recipe.steps.length > 0 ? recipe.steps : [""],
        macros: recipe.macros
          ? {
              calories: recipe.macros.calories.toString(),
              protein: recipe.macros.protein.toString(),
              carbs: recipe.macros.carbs.toString(),
              fat: recipe.macros.fat.toString(),
            }
          : { calories: "", protein: "", carbs: "", fat: "" },
      });
    } else {
      setEditingRecipe(null);
      setRecipeForm({
        name: "",
        description: "",
        prepTime: "",
        cookTime: "",
        servings: "",
        ingredients: [{ name: "", quantity: "", unit: "" }],
        steps: [""],
        macros: { calories: "", protein: "", carbs: "", fat: "" },
      });
    }
    setRecipeDialogOpen(true);
  }

  function closeRecipeDialog() {
    setRecipeDialogOpen(false);
    setEditingRecipe(null);
  }

  function openMealDialog(date: Date, mealType: string) {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setMealDialogOpen(true);
  }

  function getMealForDateAndType(
    date: Date,
    mealType: string
  ): MealPlan | undefined {
    return mealPlans.find(
      (mp) =>
        formatDate(new Date(mp.date)) === formatDate(date) &&
        mp.mealType === mealType
    );
  }

  const isToday = (date: Date) => formatDate(date) === formatDate(new Date());

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">🍽️ Meal Planning</h1>
          <p className="text-slate-400 mt-1">
            Week of {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
            {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            ← Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
          >
            Today
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            Next →
          </Button>
        </div>
      </header>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="calendar">📅 Calendar</TabsTrigger>
          <TabsTrigger value="recipes">📖 Recipes</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {weekDates.map((date, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={`text-center p-2 rounded-xl ${
                      isToday(date)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="text-sm font-medium">{DAYS_OF_WEEK[date.getDay()]}</div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                  </div>

                  {/* Dinner slot (main focus) */}
                  {(() => {
                    const meal = getMealForDateAndType(date, "dinner");
                    return meal ? (
                      <GlowingCard
                        className="p-3 cursor-pointer"
                        glowColor="rgba(249, 115, 22, 0.3)"
                      >
                        <div className="text-xs text-orange-400 mb-1">Dinner</div>
                        <div className="font-medium text-sm truncate">
                          {meal.recipe.name}
                        </div>
                        {meal.recipe.cookTime && (
                          <div className="text-xs text-slate-400 mt-1">
                            ⏱️ {meal.recipe.cookTime}m
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 h-7 text-xs text-red-400 hover:text-red-300"
                          onClick={() => handleRemoveMeal(date, "dinner")}
                        >
                          Remove
                        </Button>
                      </GlowingCard>
                    ) : (
                      <button
                        onClick={() => openMealDialog(date, "dinner")}
                        className="w-full p-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-colors"
                      >
                        <div className="text-xs mb-1">Dinner</div>
                        <div className="text-lg">+</div>
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Recipes</h2>
            <div className="flex gap-2">
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    🔗 Import from URL
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Import Recipe from URL</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-slate-400">
                      Paste a recipe URL from AllRecipes, Food Network, Tasty, or most recipe sites.
                    </p>
                    <Input
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.allrecipes.com/recipe/..."
                      className="bg-slate-800 border-slate-700"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleImportRecipe}
                        disabled={!importUrl || importLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500"
                      >
                        {importLoading ? "Importing..." : "Import Recipe"}
                      </Button>
                      <Button
                        onClick={() => setImportDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => openRecipeDialog()}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    + Add Recipe
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecipe ? "Edit Recipe" : "Add Recipe"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Recipe Name *
                    </label>
                    <Input
                      value={recipeForm.name}
                      onChange={(e) =>
                        setRecipeForm({ ...recipeForm, name: e.target.value })
                      }
                      placeholder="e.g., Honey Garlic Chicken"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Description
                    </label>
                    <Input
                      value={recipeForm.description}
                      onChange={(e) =>
                        setRecipeForm({
                          ...recipeForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Prep (min)
                      </label>
                      <Input
                        type="number"
                        value={recipeForm.prepTime}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            prepTime: e.target.value,
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Cook (min)
                      </label>
                      <Input
                        type="number"
                        value={recipeForm.cookTime}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            cookTime: e.target.value,
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Servings
                      </label>
                      <Input
                        type="number"
                        value={recipeForm.servings}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            servings: e.target.value,
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Macros */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Nutrition (per serving)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="number"
                        placeholder="Cal"
                        value={recipeForm.macros.calories}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            macros: { ...recipeForm.macros, calories: e.target.value },
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                      <Input
                        type="number"
                        placeholder="Protein"
                        value={recipeForm.macros.protein}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            macros: { ...recipeForm.macros, protein: e.target.value },
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                      <Input
                        type="number"
                        placeholder="Carbs"
                        value={recipeForm.macros.carbs}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            macros: { ...recipeForm.macros, carbs: e.target.value },
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                      <Input
                        type="number"
                        placeholder="Fat"
                        value={recipeForm.macros.fat}
                        onChange={(e) =>
                          setRecipeForm({
                            ...recipeForm,
                            macros: { ...recipeForm.macros, fat: e.target.value },
                          })
                        }
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveRecipe}
                      disabled={!recipeForm.name}
                      className="flex-1 bg-blue-600 hover:bg-blue-500"
                    >
                      {editingRecipe ? "Save Changes" : "Add Recipe"}
                    </Button>
                    <Button
                      onClick={closeRecipeDialog}
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
          </div>

          {recipes.length === 0 ? (
            <SpotlightCard className="bg-slate-900 border-slate-800 text-center py-12">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-slate-400 mb-4">No recipes yet</p>
              <Button onClick={() => openRecipeDialog()} variant="outline">
                Add your first recipe
              </Button>
            </SpotlightCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <SpotlightCard
                  key={recipe.id}
                  className="bg-slate-900 border-slate-800"
                  spotlightColor="rgba(59, 130, 246, 0.1)"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{recipe.name}</h3>
                    <button
                      onClick={() => handleToggleFavorite(recipe)}
                      className="text-xl"
                    >
                      {recipe.isFavorite ? "⭐" : "☆"}
                    </button>
                  </div>
                  {recipe.description && (
                    <p className="text-slate-400 text-sm mb-3">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recipe.prepTime && (
                      <Badge variant="secondary">🔪 {recipe.prepTime}m prep</Badge>
                    )}
                    {recipe.cookTime && (
                      <Badge variant="secondary">🍳 {recipe.cookTime}m cook</Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary">👨‍👩‍👧‍👦 {recipe.servings}</Badge>
                    )}
                  </div>
                  {recipe.macros && (
                    <div className="text-xs text-slate-400 mb-3">
                      {recipe.macros.calories} cal · {recipe.macros.protein}g protein
                    </div>
                  )}
                  <div className="flex gap-2">
                    {recipe.steps.length > 0 && (
                      <Link href={`/cook/${recipe.id}`}>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500"
                        >
                          👨‍🍳 Cook
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRecipeDialog(recipe)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meal Selection Dialog */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>
              Select Meal for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              {MEAL_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedMealType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMealType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>

            {recipes.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                No recipes available. Add some first!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleAssignMeal(recipe.id)}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors"
                  >
                    <div className="font-medium">{recipe.name}</div>
                    {recipe.cookTime && (
                      <div className="text-sm text-slate-400">
                        ⏱️ {(recipe.prepTime || 0) + recipe.cookTime} min total
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-4">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">📅</span>
            <span className="text-xs">Calendar</span>
          </Link>
          <Link href="/chores" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">✅</span>
            <span className="text-xs">Chores</span>
          </Link>
          <Link href="/meals" className="flex flex-col items-center gap-1 text-white">
            <span className="text-2xl">🍽️</span>
            <span className="text-xs font-medium">Meals</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
