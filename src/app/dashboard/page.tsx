import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDailyProgress, getWeeklyAnalytics } from "@/actions/tracking";
import ProteinTracker from "@/components/ProteinTracker";
import UpgradeBanner from "@/components/UpgradeBanner";
import GymCheckIn from "@/components/GymCheckIn";
import WeeklyAnalytics from "@/components/WeeklyAnalytics";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const [{ protein, goal, gymCompleted, isPremium }, { proteinByDay, gymDays }] =
    await Promise.all([getDailyProgress(), getWeeklyAnalytics()]);

  return (
    <>
      {/* Fixed nav — sits above everything */}
      <DashboardNav
        name={session.user?.name}
        email={session.user?.email}
        image={session.user?.image}
      />

      {/* Page background */}
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
        {/* Decorative ambient glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
        </div>

        {/* Main content — pt-16 clears the 56px (h-14) nav */}
        <main className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-24 flex flex-col gap-8">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">
              Dashboard
            </h1>
            <p className="text-slate-400 font-medium text-lg">
              Track your progress, crush your goals.
            </p>
          </header>

          {/* Protein Tracker */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <ProteinTracker initialProtein={protein} goal={goal} isPremium={isPremium} />
          </section>

          {/* Upgrade Banner — free users only */}
          {!isPremium && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-100">
              <UpgradeBanner />
            </section>
          )}

          {/* Gym Check-In */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-150">
            <div className="w-full p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/60 text-center flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-300 mb-6">Daily Workout</h3>
              <GymCheckIn initialCompleted={gymCompleted} />
            </div>
          </section>

          {/* Weekly Analytics — locked overlay for free users */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-200">
            <WeeklyAnalytics
              isPremium={isPremium}
              proteinByDay={proteinByDay}
              gymDays={gymDays}
              goal={goal}
            />
          </section>
        </main>
      </div>
    </>
  );
}
