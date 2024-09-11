import dayjs from "dayjs";
import { db } from "../connection";
import { goals, goalCompletions } from "../schema";
import { and, lte, gte, count, eq, sql } from "drizzle-orm";

export async function getWeekSummary() {
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
        .where(
          and(
            gte(goals.createdAt, firstDayOfWeek),
            lte(goals.createdAt, lastDayOfWeek)
          )
        )
    );

  const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goalCompletions.goalId,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`DATE(${goalCompletions.createdAt})`.as(
          "completedAt"
        ),
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
  );

  const goalsCompletedGroupedByWeekDay = db
    .$with("goals_completed_by_week_day")
    .as(
      db
        .select({
          completedAtDate: goalsCompletedInWeek.completedAtDate,
          completions: sql`
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',${goalsCompletedInWeek.id},
            'title',${goalsCompletedInWeek.title},
            'desiredWeeklyFrequency',${goalsCompletedInWeek.desiredWeeklyFrequency},
            'completedAt',${goalsCompletedInWeek.completedAt},
            'completedAtDate',${goalsCompletedInWeek.completedAtDate}
          )
        )
        `.as("completions"),
        })
        .from(goalsCompletedInWeek)
        .groupBy(goalsCompletedInWeek.completedAtDate)
    );

  const result = await db
    .with(
      goalsCreatedUpToCurrentWeek,
      goalsCompletedInWeek,
      goalsCompletedGroupedByWeekDay
    )
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToCurrentWeek})`.mapWith(
          Number
        ),
      goalsPerday: sql`
      JSON_OBJECT_AGG(
        ${goalsCompletedGroupedByWeekDay.completedAtDate},
        ${goalsCompletedGroupedByWeekDay.completions}
      )
      `,
    })
    .from(goalsCompletedGroupedByWeekDay);

  return {
    summary: result,
  };
}
