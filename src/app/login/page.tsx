"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/aceternity";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 6) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pin, router]);

  const handleKeyPress = useCallback((digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError("");
    }
  }, [pin]);

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  const handleClear = useCallback(() => {
    setPin("");
    setError("");
  }, []);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin, handleSubmit]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleBackspace, handleClear]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <SpotlightCard 
        className="w-full max-w-md bg-slate-900 border-slate-800"
        spotlightColor="rgba(59, 130, 246, 0.15)"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-white">Home Organizer</h1>
          <p className="text-slate-400 mt-2">Enter your family PIN</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                pin.length > i
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-slate-700 bg-slate-800"
              }`}
            >
              {pin.length > i && "●"}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-400 mb-4 animate-pulse">
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "⌫"].map(
            (key) => (
              <Button
                key={key}
                variant="outline"
                disabled={loading}
                className={`h-16 text-2xl font-medium transition-all ${
                  key === "CLR" || key === "⌫"
                    ? "text-slate-400 hover:text-white"
                    : "hover:bg-blue-600 hover:border-blue-600"
                }`}
                onClick={() => {
                  if (key === "⌫") handleBackspace();
                  else if (key === "CLR") handleClear();
                  else handleKeyPress(key);
                }}
              >
                {key}
              </Button>
            )
          )}
        </div>

        {loading && (
          <div className="text-center text-slate-400 mt-6">
            Verifying...
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
