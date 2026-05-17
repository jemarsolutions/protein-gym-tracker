"use server";

import { pool } from "@/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function logProtein(mealName: string, proteinGrams: number) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to track protein.");
  }

  const userId = session.user.id;

  try {
    // Using parameterized queries ($1, $2, etc.) to prevent SQL injection
    await pool.query(
      `INSERT INTO protein_logs (user_id, meal_name, protein_grams, date)
       VALUES ($1, $2, $3, CURRENT_DATE)`,
      [userId, mealName, proteinGrams]
    );

    // Revalidate the dashboard so it immediately shows the new data
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to log protein:", error);
    throw new Error("Database Error: Failed to log protein.");
  }
}

export async function logGymCheckIn(notes: string = "") {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to check in.");
  }

  const userId = session.user.id;

  try {
    // Parameterized query for gym logs
    await pool.query(
      `INSERT INTO gym_logs (user_id, workout_completed, notes, date)
       VALUES ($1, true, $2, CURRENT_DATE)`,
      [userId, notes]
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to log gym check-in:", error);
    throw new Error("Database Error: Failed to log gym check-in.");
  }
}

// Helper action to fetch the daily progress for the UI
export async function getDailyProgress() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { protein: 0, goal: 150, gymCompleted: false, isPremium: false };
  }

  const userId = session.user.id;

  try {
    // 1. Get today's total protein
    const proteinRes = await pool.query(
      `SELECT SUM(protein_grams) as total_protein 
       FROM protein_logs 
       WHERE user_id = $1 AND date = CURRENT_DATE`,
      [userId]
    );
    
    // 2. Check if there is a gym log for today
    const gymRes = await pool.query(
      `SELECT id 
       FROM gym_logs 
       WHERE user_id = $1 AND date = CURRENT_DATE AND workout_completed = true 
       LIMIT 1`,
      [userId]
    );

    // 3. Get the user's custom daily protein goal and premium status
    const userRes = await pool.query(
      `SELECT daily_protein_goal, is_premium 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    const totalProtein = parseInt(proteinRes.rows[0]?.total_protein || "0");
    const gymCompleted = gymRes.rowCount ? gymRes.rowCount > 0 : false;
    const goal = userRes.rows[0]?.daily_protein_goal || 150;
    const isPremium = userRes.rows[0]?.is_premium || false;

    return {
      protein: totalProtein,
      goal: goal,
      gymCompleted: gymCompleted,
      isPremium: isPremium
    };
  } catch (error) {
    console.error("Failed to fetch daily progress:", error);
    return { protein: 0, goal: 150, gymCompleted: false, isPremium: false };
  }
}

export async function updateDailyProteinGoal(newGoal: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const clamped = Math.max(50, Math.min(600, Math.round(newGoal)));

  await pool.query(
    `UPDATE users SET daily_protein_goal = $1 WHERE id = $2`,
    [clamped, userId]
  );

  revalidatePath("/dashboard");
  return { success: true, goal: clamped };
}

export async function getWeeklyAnalytics() {
  const session = await auth();
  if (!session?.user?.id) {
    return { proteinByDay: [], gymDays: [] };
  }

  const userId = session.user.id;

  try {
    const proteinRes = await pool.query(
      `SELECT date::text, COALESCE(SUM(protein_grams), 0)::int AS total
       FROM protein_logs
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY date
       ORDER BY date ASC`,
      [userId]
    );

    const gymRes = await pool.query(
      `SELECT DISTINCT date::text
       FROM gym_logs
       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'
         AND workout_completed = true
       ORDER BY date ASC`,
      [userId]
    );

    return {
      proteinByDay: proteinRes.rows as { date: string; total: number }[],
      gymDays: gymRes.rows.map((r: { date: string }) => r.date) as string[],
    };
  } catch (error) {
    console.error("Failed to fetch weekly analytics:", error);
    return { proteinByDay: [], gymDays: [] };
  }
}
