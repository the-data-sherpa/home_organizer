"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface Chore {
  id: string;
  name: string;
  description: string | null;
  points: number;
  isClaimable: boolean;
  isRecurring: boolean;
  daysOfWeek: number[];
  assignments: ChoreAssignment[];
}

interface ChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chore: Chore | null;
  users: User[];
  onSave: (data: ChoreFormData) => void;
}

export interface ChoreFormData {
  name: string;
  description: string | null;
  points: number;
  isClaimable: boolean;
  daysOfWeek: number[];
  assignedUserIds: string[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Dialog for adding or editing a chore with multi-assignee support. */
export function ChoreDialog({ open, onOpenChange, chore, users, onSave }: ChoreDialogProps) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("1");
  const [isClaimable, setIsClaimable] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (chore) {
      setName(chore.name);
      setPoints(chore.points.toString());
      setIsClaimable(chore.isClaimable);
      setDaysOfWeek(chore.daysOfWeek);
      setSelectedUserIds(chore.assignments.map((a) => a.userId));
    } else {
      setName("");
      setPoints("1");
      setIsClaimable(false);
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setSelectedUserIds([]);
    }
  }, [chore, open]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function toggleUser(userId: string) {
    setIsClaimable(false);
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  function handleClaimable() {
    setIsClaimable(true);
    setSelectedUserIds([]);
  }

  function handleSave() {
    onSave({
      name,
      description: null,
      points: parseInt(points) || 1,
      isClaimable,
      daysOfWeek,
      assignedUserIds: selectedUserIds,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle>{chore ? "Edit Chore" : "Add Chore"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Chore Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Empty dishwasher"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Points</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              className="bg-slate-800 border-slate-700 w-24"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Assigned To</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleClaimable}
                className={`px-3 py-2 rounded-lg transition-all ${
                  isClaimable ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                Anyone (Claimable)
              </button>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    selectedUserIds.includes(user.id) ? "ring-2 ring-white" : ""
                  }`}
                  style={{
                    backgroundColor: selectedUserIds.includes(user.id)
                      ? user.color
                      : user.color + "40",
                  }}
                >
                  {user.emoji || "\u{1F464}"} {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Days</label>
            <div className="flex gap-1">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    daysOfWeek.includes(idx)
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
              onClick={handleSave}
              disabled={!name}
              className="flex-1 bg-blue-600 hover:bg-blue-500"
            >
              {chore ? "Save Changes" : "Add Chore"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
