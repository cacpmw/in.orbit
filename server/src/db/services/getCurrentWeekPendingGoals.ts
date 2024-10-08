import dayjs from "dayjs";
import { db } from "../connection";
import { goals, goalCompletions } from "../schema";
import { and, lte, gte, count, eq, sql } from "drizzle-orm";

export async function getCurrentWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToCurrentWeek = db
    .$with("goals_created_up_to_current_week")
    .as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
          createdAt: goals.createdAt,
        })
        .from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek))
    );

  const goalCompletionsCount = db.$with("goal_completions_count").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpToCurrentWeek, goalCompletionsCount)
    .select({
      id: goalsCreatedUpToCurrentWeek.id,
      title: goalsCreatedUpToCurrentWeek.title,
      desiredWeeklyFrequency:
        goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionsCount.completionCount},0)
        `.mapWith(Number),
    })
    .from(goalsCreatedUpToCurrentWeek)
    .leftJoin(
      goalCompletionsCount,
      eq(goalCompletionsCount.goalId, goalsCreatedUpToCurrentWeek.id)
    );

  return {
    pendingGoals,
  };
}
