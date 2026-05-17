"use client";

import { useState, useTransition } from "react";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { logGymCheckIn } from "@/actions/tracking";

export default function GymCheckIn({ initialCompleted }: { initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleCheckIn = () => {
    if (completed) return;
    
    // Optimistic UI update
    setCompleted(true);
    
    startTransition(async () => {
      try {
        await logGymCheckIn("Checked in via Dashboard");
      } catch (error) {
        // Revert on failure
        setCompleted(false);
        alert("Failed to log gym check-in. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <button
        onClick={handleCheckIn}
        disabled={completed || isPending}
        className={`group relative flex flex-col items-center justify-center w-40 h-40 rounded-[2.5rem] transition-all duration-500 shadow-xl border-4 ${
          completed
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 cursor-default"
            : "bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 active:scale-95"
        }`}
      >
        {/* Glow effect */}
        {!completed && (
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 rounded-[2.5rem] transition-colors duration-500" />
        )}

        {completed ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="font-bold text-lg">Crushed it!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Dumbbell className="w-16 h-16 mb-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-bold text-lg">Check In</span>
          </div>
        )}
      </button>

      <p className="mt-6 text-sm font-medium text-slate-500">
        {completed
          ? "You've already logged your workout for today."
          : "Tap the dumbbell to log your workout."}
      </p>
    </div>
  );
}
