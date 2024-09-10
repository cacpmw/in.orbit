import { db } from "../connection";
import { goalCompletions, goals } from "../schema";
import { and, lte, gte, count, eq, sql } from "drizzle-orm";
import dayjs from "dayjs";

interface CreateGoalCompletionRequest {
  goalId: string;
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

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
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const result = await db
    .with(goalCompletionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
    COALESCE(${goalCompletionsCount.completionCount},0)
    `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionsCount, eq(goalCompletions.goalId, goals.id))
    .where(eq(goals.id, goalId));

  // const result = await db
  //   .insert(goalCompletions)
  //   .values({ goalId })
  //   .returning();

  // const goalCompletion = result[0];
  return result;
}
