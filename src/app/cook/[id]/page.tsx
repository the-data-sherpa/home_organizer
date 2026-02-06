"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlowingCard } from "@/components/aceternity";

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
}

export default function CookingModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecipe(data);
        }
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  function toggleIngredient(index: number) {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  }

  function nextStep() {
    if (recipe && currentStep < recipe.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <div className="text-slate-400 text-xl mb-4">Recipe not found</div>
          <Link href="/meals">
            <Button>Back to Meals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/meals"
            className="text-3xl hover:opacity-70 transition-opacity"
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">👨‍🍳 Cooking Mode</h1>
            <p className="text-slate-400">{recipe.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          {recipe.prepTime && <span>🔪 {recipe.prepTime}m prep</span>}
          {recipe.cookTime && <span>🍳 {recipe.cookTime}m cook</span>}
          {recipe.servings && <span>👨‍👩‍👧‍👦 {recipe.servings} servings</span>}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Ingredients Panel */}
        <div className="col-span-4">
          <GlowingCard
            className="bg-slate-900 sticky top-6"
            glowColor="rgba(34, 197, 94, 0.2)"
          >
            <h2 className="text-xl font-semibold mb-4">📋 Ingredients</h2>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleIngredient(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    checkedIngredients.has(idx)
                      ? "bg-emerald-900/30 text-emerald-400 line-through"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  <span className="mr-2">
                    {checkedIngredients.has(idx) ? "✓" : "○"}
                  </span>
                  {ing.quantity && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.name}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-400">
              {checkedIngredients.size} / {recipe.ingredients.length} ready
            </div>
          </GlowingCard>
        </div>

        {/* Steps Panel */}
        <div className="col-span-8">
          <GlowingCard
            className="bg-slate-900"
            glowColor="rgba(59, 130, 246, 0.2)"
          >
            {/* Step Progress */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Step {currentStep + 1} of {recipe.steps.length}
              </h2>
              <div className="flex gap-1">
                {recipe.steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentStep
                        ? "bg-blue-500 scale-125"
                        : idx < currentStep
                        ? "bg-emerald-500"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Step - Large Display */}
            <div className="min-h-[300px] flex items-center justify-center p-8 bg-slate-800 rounded-2xl mb-6">
              <p className="text-2xl leading-relaxed text-center">
                {recipe.steps[currentStep]}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex-1 h-16 text-xl"
              >
                ← Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStep === recipe.steps.length - 1}
                className="flex-1 h-16 text-xl bg-blue-600 hover:bg-blue-500"
              >
                {currentStep === recipe.steps.length - 1
                  ? "🎉 Done!"
                  : "Next →"}
              </Button>
            </div>

            {/* All Steps Preview */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                All Steps
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recipe.steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                      idx === currentStep
                        ? "bg-blue-600 text-white"
                        : idx < currentStep
                        ? "bg-emerald-900/30 text-emerald-400"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <span className="font-medium mr-2">
                      {idx < currentStep ? "✓" : `${idx + 1}.`}
                    </span>
                    {step.length > 80 ? step.substring(0, 80) + "..." : step}
                  </button>
                ))}
              </div>
            </div>
          </GlowingCard>
        </div>
      </div>
    </div>
  );
}
