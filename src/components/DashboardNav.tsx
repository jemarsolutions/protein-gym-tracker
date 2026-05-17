"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import Image from "next/image";

interface Props {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function DashboardNav({ name, email, image }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* User info */}
        <div className="flex items-center gap-3">
          {image ? (
            <Image
              src={image}
              alt={name ?? "User avatar"}
              width={34}
              height={34}
              className="rounded-full ring-2 ring-emerald-500/40"
            />
          ) : (
            <div className="w-[34px] h-[34px] rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-white text-sm font-semibold leading-tight">{name ?? "Athlete"}</p>
            <p className="text-slate-500 text-xs">{email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
