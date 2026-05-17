"use client";

import { Lock, TrendingUp, Flame, Dumbbell } from "lucide-react";

interface DayData {
  date: string;
  total: number;
}

interface Props {
  isPremium: boolean;
  proteinByDay: DayData[];
  gymDays: string[];
  goal: number;
}

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function WeeklyAnalytics({ isPremium, proteinByDay, gymDays, goal }: Props) {
  const last7Days = getLast7Days();
  const proteinMap = Object.fromEntries(proteinByDay.map((d) => [d.date, d.total]));
  const gymSet = new Set(gymDays);

  const maxProtein = Math.max(...last7Days.map((d) => proteinMap[d] || 0), goal, 1);
  const gymStreak = last7Days.filter((d) => gymSet.has(d)).length;
  const avgProtein = Math.round(
    last7Days.reduce((sum, d) => sum + (proteinMap[d] || 0), 0) / 7
  );

  return (
    <div className="relative w-full max-w-md mx-auto rounded-[2rem] overflow-hidden">
      {/* Card */}
      <div className={`p-6 bg-slate-900/60 backdrop-blur-2xl border border-slate-800 shadow-2xl transition-all duration-500 ${!isPremium ? "select-none" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Weekly Analytics
          </h2>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4" /> {gymStreak} day streak
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-indigo-400">Avg {avgProtein}g</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-28 mb-4">
          {last7Days.map((date) => {
            const val = proteinMap[date] || 0;
            const heightPct = Math.max((val / maxProtein) * 100, 2);
            const hitGoal = val >= goal;
            const isGym = gymSet.has(date);
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ease-out ${
                      hitGoal
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : "bg-gradient-to-t from-indigo-700 to-indigo-500"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                {/* Gym dot */}
                <div className={`w-2 h-2 rounded-full mt-1 ${isGym ? "bg-amber-400" : "bg-slate-700"}`} />
                <span className="text-[10px] text-slate-500 font-medium">{getDayLabel(date)}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Protein
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Goal hit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <Dumbbell className="w-3 h-3 inline-block" /> Gym day
          </span>
        </div>
      </div>

      {/* Locked overlay for free users */}
      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm bg-slate-950/60 border border-indigo-500/20">
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Weekly Analytics</h3>
            <p className="text-slate-400 text-sm">
              Upgrade to Premium to visualize your 7-day progress and gym streak.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
