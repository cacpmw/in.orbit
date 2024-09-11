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

  //CTE - filter records within the date range, count the completion of
  // goals and group them by id
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

  // LEFT JOIN the above CTE to the goals table
  const result = await db
    .with(goalCompletionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
    COALESCE(${goalCompletionsCount.completionCount},0)
    `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionsCount, eq(goalCompletionsCount.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1);

  const { desiredWeeklyFrequency, completionCount } = result[0];

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal already completed this week!");
  }
  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning();

  const goalCompletion = insertResult[0];
  return { goalCompletion };
}

/**
 * WITH
  "goal_completions_count" AS (
    SELECT
      "goal_id",
      COUNT("id") AS "completionCount"
    FROM
      "goals_completions"
    WHERE
      (
        "goals_completions"."created_at" >= '2024-09-08T03:00:00.000Z'
        AND "goals_completions"."created_at" <= '2024-09-15T02:59:59.999Z'
        AND "goals_completions"."goal_id" = 'b9jpc4bi0hjn8i55orwptt9z'
      )
    GROUP BY
      "goals_completions"."goal_id"
  )
SELECT
  "goals"."desired_weekly_frequency",
  COALESCE("completionCount", 0) as "completionCount"
FROM
  "goals"
  LEFT JOIN "goal_completions_count" ON "goal_completions_count"."goal_id" = "goals"."id"
WHERE
  "goals"."id" = 'b9jpc4bi0hjn8i55orwptt9z'
LIMIT
  1
 */
