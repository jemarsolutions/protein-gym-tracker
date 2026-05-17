import type { Metadata } from "next";
import { signIn } from "@/auth";
import { Dumbbell } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden selection:bg-emerald-500/30">
      {/* Decorative ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="mb-8 p-4 bg-emerald-500/10 rounded-3xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]">
          <Dumbbell className="w-16 h-16 text-emerald-400" aria-hidden="true" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
          Protein &amp; Gym Tracker
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
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
              className="px-8 py-4 bg-slate-50 text-slate-900 hover:bg-slate-200 font-bold rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-xl w-full sm:w-auto"
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
              className="px-8 py-4 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 border border-slate-700 shadow-xl w-full sm:w-auto"
            >
              Sign In with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
