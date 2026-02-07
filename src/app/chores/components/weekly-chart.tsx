"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/helpers";

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
  completedAt: string;
  user: User;
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

interface WeeklyChartProps {
  chores: Chore[];
  users: User[];
  weekDates: Date[];
  selectedUser: string | null;
  onComplete: (choreId: string, userId: string, date: string) => void;
  onUncomplete: (choreId: string, userId: string, date: string) => void;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Touch-friendly weekly chart: chores as rows, days as columns, assignee sub-rows. */
export function WeeklyChart({
  chores,
  users,
  weekDates,
  selectedUser,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: WeeklyChartProps) {
  const [claimDialog, setClaimDialog] = useState<{
    choreId: string;
    date: string;
  } | null>(null);

  const todayStr = formatDate(new Date());

  /** Check if a completion exists for a given chore, user, and date. */
  function isCompleted(chore: Chore, userId: string, dateStr: string): boolean {
    return chore.completions.some(
      (c) =>
        c.completedBy === userId &&
        c.completionDate.startsWith(dateStr),
    );
  }

  /** Check if a chore is scheduled for a given day of the week. */
  function isScheduled(chore: Chore, dayOfWeek: number): boolean {
    return chore.daysOfWeek.includes(dayOfWeek);
  }

  /** Handle tapping a completion cell. */
  function handleCellTap(chore: Chore, userId: string, dateStr: string) {
    if (isCompleted(chore, userId, dateStr)) {
      onUncomplete(chore.id, userId, dateStr);
    } else {
      onComplete(chore.id, userId, dateStr);
    }
  }

  /** Get the rows to display for a chore — assigned users, or a single claimable row. */
  function getChoreRows(chore: Chore): { userId: string | null; user: User | null }[] {
    if (chore.assignments.length > 0) {
      const rows = chore.assignments.map((a) => ({ userId: a.userId, user: a.user }));
      if (selectedUser) {
        return rows.filter((r) => r.userId === selectedUser);
      }
      return rows;
    }
    // Claimable chore with no specific assignments
    return [{ userId: null, user: null }];
  }

  const filteredChores = chores.filter((chore) => {
    if (!selectedUser) return true;
    if (chore.isClaimable) return true;
    return chore.assignments.some((a) => a.userId === selectedUser);
  });

  return (
    <div className="space-y-1">
      {/* Day header row */}
      <div className="grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))] gap-1 mb-2 sticky top-0 bg-slate-950 z-10 pb-1">
        <div />
        {weekDates.map((date, i) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={i}
              className={`text-center text-xs font-medium py-2 rounded-lg ${
                isToday
                  ? "bg-blue-600/30 text-blue-300"
                  : "text-slate-400"
              }`}
            >
              <div>{DAY_LABELS[i]}</div>
              <div className="text-[10px]">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Chore rows */}
      {filteredChores.map((chore) => {
        const rows = getChoreRows(chore);

        return (
          <div
            key={chore.id}
            className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            {/* Chore header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">{chore.name}</span>
                <Badge className="bg-yellow-900 text-yellow-300 text-xs shrink-0">
                  {chore.points}pt{chore.points !== 1 ? "s" : ""}
                </Badge>
                {chore.isClaimable && chore.assignments.length === 0 && (
                  <span className="text-purple-400 text-xs shrink-0">{"\u{1F64B}"}</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(chore)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(chore.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                >
                  Del
                </button>
              </div>
            </div>

            {/* Assignee sub-rows */}
            {rows.map((row, rowIdx) => (
              <div
                key={row.userId ?? "claimable"}
                className={`grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))] gap-1 px-3 py-1 ${
                  rowIdx < rows.length - 1 ? "border-b border-slate-800/50" : ""
                }`}
              >
                {/* User label */}
                <div className="flex items-center gap-1 text-sm truncate">
                  {row.user ? (
                    <>
                      <span>{row.user.emoji || "\u{1F464}"}</span>
                      <span style={{ color: row.user.color }} className="truncate text-xs">
                        {row.user.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 italic">tap to claim</span>
                  )}
                </div>

                {/* Day cells */}
                {weekDates.map((date, dayIdx) => {
                  const dateStr = formatDate(date);
                  const scheduled = isScheduled(chore, dayIdx);
                  const isToday = dateStr === todayStr;
                  const isFuture = dateStr > todayStr;

                  if (!scheduled) {
                    return (
                      <div
                        key={dayIdx}
                        className={`flex items-center justify-center min-h-[48px] rounded-lg ${
                          isToday ? "bg-blue-600/10" : "bg-slate-800/30"
                        }`}
                      >
                        <span className="text-slate-700 text-xs">-</span>
                      </div>
                    );
                  }

                  // Claimable row without a specific user
                  if (!row.userId) {
                    // Check if anyone has completed it for this date
                    const completionsForDate = chore.completions.filter(
                      (c) => c.completionDate.startsWith(dateStr),
                    );

                    if (completionsForDate.length > 0) {
                      const completer = completionsForDate[0].user;
                      return (
                        <button
                          key={dayIdx}
                          onClick={() =>
                            onUncomplete(chore.id, completer.id, dateStr)
                          }
                          className={`flex items-center justify-center min-h-[48px] rounded-lg transition-all ${
                            isToday ? "bg-blue-600/10" : ""
                          }`}
                          style={{ backgroundColor: completer.color + "30" }}
                        >
                          <span className="text-lg">{completer.emoji || "\u{2705}"}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={dayIdx}
                        onClick={() =>
                          setClaimDialog({ choreId: chore.id, date: dateStr })
                        }
                        className={`flex items-center justify-center min-h-[48px] rounded-lg transition-all hover:bg-slate-700 active:bg-slate-600 ${
                          isToday ? "bg-blue-600/10" : "bg-slate-800/50"
                        } ${isFuture ? "opacity-50" : ""}`}
                      >
                        <span className="text-slate-600 text-lg">{"\u{25CB}"}</span>
                      </button>
                    );
                  }

                  // Normal assigned user cell
                  const completed = isCompleted(chore, row.userId, dateStr);

                  return (
                    <button
                      key={dayIdx}
                      onClick={() =>
                        handleCellTap(chore, row.userId!, dateStr)
                      }
                      className={`flex items-center justify-center min-h-[48px] rounded-lg transition-all active:scale-95 ${
                        isToday && !completed ? "bg-blue-600/10" : ""
                      } ${isFuture && !completed ? "opacity-50" : ""} ${
                        !completed ? "hover:bg-slate-700" : ""
                      }`}
                      style={
                        completed
                          ? { backgroundColor: row.user!.color + "30" }
                          : undefined
                      }
                    >
                      {completed ? (
                        <span className="text-lg" style={{ color: row.user!.color }}>
                          {"\u{2713}"}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-lg">{"\u{25CB}"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      {filteredChores.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No chores to display
        </div>
      )}

      {/* Claim dialog — pick who's completing a claimable chore */}
      <Dialog open={!!claimDialog} onOpenChange={() => setClaimDialog(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-xs">
          <DialogHeader>
            <DialogTitle>Who completed this?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            {users.map((user) => (
              <Button
                key={user.id}
                onClick={() => {
                  if (claimDialog) {
                    onComplete(claimDialog.choreId, user.id, claimDialog.date);
                    setClaimDialog(null);
                  }
                }}
                className="w-full justify-start gap-2"
                style={{ backgroundColor: user.color }}
              >
                {user.emoji || "\u{1F464}"} {user.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
