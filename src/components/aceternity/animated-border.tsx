"use client";
import { cn } from "@/lib/utils";
import React from "react";

export function AnimatedBorderCard({
  children,
  className,
  containerClassName,
  borderColor = "from-blue-500 via-purple-500 to-pink-500",
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderColor?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("relative p-[1px] overflow-hidden rounded-2xl group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-75 blur-sm",
          borderColor,
          animate && "animate-spin-slow group-hover:opacity-100 transition-opacity"
        )}
        style={{
          backgroundSize: "400% 400%",
          animation: animate ? "gradient 3s ease infinite" : undefined,
        }}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          borderColor
        )}
        style={{
          backgroundSize: "400% 400%",
          animation: animate ? "gradient 3s ease infinite" : undefined,
        }}
      />
      <div
        className={cn(
          "relative bg-slate-900 rounded-2xl p-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function GlowingCard({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.5)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-slate-900 border border-slate-800 p-6 transition-all duration-300",
        "hover:border-slate-700",
        className
      )}
      style={{
        boxShadow: `0 0 0 0 ${glowColor}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px 0 ${glowColor}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${glowColor}`;
      }}
    >
      {children}
    </div>
  );
}
