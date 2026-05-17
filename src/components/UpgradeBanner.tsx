"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { createCheckoutSession } from "@/actions/stripe";

export default function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { url } = await createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 shadow-2xl">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900" />

      {/* Decorative glows */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Premium
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-white mb-2 leading-tight">
          Unlock Your Full Potential
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Get custom goals, weekly analytics, and an ad-free experience.
        </p>

        {/* Feature list */}
        <ul className="space-y-2.5 mb-7">
          {[
            "Custom daily protein goal (50–600g)",
            "7-day analytics & gym streak chart",
            "Ad-free experience",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-indigo-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to checkout...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Upgrade to Premium — $4.99/mo
              <ArrowRight className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-xs text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
