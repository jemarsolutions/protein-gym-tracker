"use client";

import { useState, useTransition, useOptimistic } from "react";
import { Plus, Minus, Beef, Egg, Milk, Loader2, Pencil, Check, Lock } from "lucide-react";
import { logProtein, updateDailyProteinGoal } from "@/actions/tracking";

interface Props {
  initialProtein: number;
  goal: number;
  isPremium: boolean;
}

export default function ProteinTracker({ initialProtein, goal: initialGoal, isPremium }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(initialGoal));
  const [goal, setGoal] = useState(initialGoal);
  const [showLockHint, setShowLockHint] = useState(false);

  const [optimisticProtein, addOptimisticProtein] = useOptimistic(
    initialProtein,
    (state, amount: number) => Math.max(0, state + amount)
  );

  const percentage = Math.min((optimisticProtein / goal) * 100, 100);

  const handleAddProtein = (amount: number, source: string) => {
    startTransition(async () => {
      addOptimisticProtein(amount);
      await logProtein(source, amount);
    });
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (!isNaN(newGoal) && newGoal >= 50 && newGoal <= 600) {
      setGoal(newGoal);
      setIsEditingGoal(false);
      startTransition(async () => {
        await updateDailyProteinGoal(newGoal);
      });
    } else {
      setGoalInput(String(goal));
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-[2rem] bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            Daily Protein
            {isPending && <Loader2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-spin" />}
          </h2>

          {/* Goal badge — editable for premium, locked for free */}
          <div className="relative">
            {isEditingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                  autoFocus
                  className="w-20 text-sm font-bold text-center bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 rounded-xl px-2 py-1 text-slate-950 dark:text-white outline-none"
                />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">g</span>
                <button onClick={handleSaveGoal} className="p-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (isPremium) setIsEditingGoal(true);
                  else setShowLockHint((v) => !v);
                }}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors group"
              >
                Goal: {goal}g
                {isPremium ? (
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                )}
              </button>
            )}
            {/* Lock tooltip */}
            {showLockHint && !isPremium && (
              <div className="absolute right-0 top-9 z-20 w-52 bg-white dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-500/40 rounded-2xl p-3 shadow-xl text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                🔒 <strong>Premium feature.</strong> Upgrade to set a custom daily protein goal (50–600g).
              </div>
            )}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-end gap-2 mb-4">
            <span className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-none">{optimisticProtein}</span>
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-1">/ {goal}g</span>
          </div>
          
          <div className="h-5 w-full bg-slate-100 dark:bg-slate-950/50 rounded-full overflow-hidden shadow-inner p-1">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium flex items-center gap-2">
            {optimisticProtein >= goal ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="text-lg">🎉</span> Goal crushed! Incredible work.
              </span>
            ) : (
              <span>{goal - optimisticProtein}g remaining today</span>
            )}
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            onClick={() => handleAddProtein(25, "Meat")}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-700/30 transition-all hover:scale-105 active:scale-95 group shadow-sm dark:shadow-none"
          >
            <div className="p-3 bg-emerald-500/10 rounded-2xl mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <Beef className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">+25g</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Meat</span>
          </button>
          
          <button 
            onClick={() => handleAddProtein(10, "Eggs")}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-700/30 transition-all hover:scale-105 active:scale-95 group shadow-sm dark:shadow-none"
          >
            <div className="p-3 bg-blue-500/10 rounded-2xl mb-3 group-hover:bg-blue-500/20 transition-colors">
              <Egg className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">+10g</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Eggs</span>
          </button>
          
          <button 
            onClick={() => handleAddProtein(30, "Shake")}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-700/30 transition-all hover:scale-105 active:scale-95 group shadow-sm dark:shadow-none"
          >
            <div className="p-3 bg-purple-500/10 rounded-2xl mb-3 group-hover:bg-purple-500/20 transition-colors">
              <Milk className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">+30g</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Shake</span>
          </button>
        </div>

        {/* Manual Input */}
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-950/40 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 shadow-inner">
          <button 
            onClick={() => handleAddProtein(-5, "Adjust")}
            className="p-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent rounded-2xl text-slate-700 dark:text-slate-300 transition-all active:scale-90 shadow-sm"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide uppercase">
            Adjust (5g)
          </div>
          <button 
            onClick={() => handleAddProtein(5, "Adjust")}
            className="p-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent rounded-2xl text-slate-700 dark:text-slate-300 transition-all active:scale-90 shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
