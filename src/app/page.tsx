import type { Metadata } from "next";
import { signIn } from "@/auth";
import { Dumbbell } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Track Protein & Gym Progress — Free Fitness App",
  description:
    "Log your daily protein intake and gym workouts in seconds. Set custom goals, track your streak, and upgrade for weekly analytics. Free to start.",
  openGraph: {
    title: "Protein & Gym Tracker — Track Your Fitness Progress",
    description:
      "Log your daily protein intake and gym workouts in seconds. Set custom goals, track your streak, and upgrade for weekly analytics.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden selection:bg-emerald-500/30 relative">
      {/* Top right theme switch */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 dark:bg-emerald-900/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 dark:bg-cyan-900/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="mb-8 p-4 bg-emerald-500/10 rounded-3xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)] dark:shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]">
          <Dumbbell className="w-16 h-16 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent animate-pulse">
          Protein &amp; Gym Tracker
        </h1>

        <p className="text-xl md:text-2xl text-slate-650 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
          The fastest, most beautiful way to track your daily protein goals and gym progress.
          Optimized for mobile, built for speed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              id="sign-in-google"
              className="px-8 py-4 bg-slate-950 dark:bg-slate-50 text-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-xl w-full sm:w-auto"
            >
              Get Started with Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              id="sign-in-github"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 font-bold rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-xl w-full sm:w-auto"
            >
              Sign In with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
