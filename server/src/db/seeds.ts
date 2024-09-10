import dayjs from "dayjs";
import { client, db } from "./connection";
import { goals, goalsCompletions } from "./schema";

async function seed() {
  await db.delete(goalsCompletions);
  await db.delete(goals);
  const results = await db
    .insert(goals)
    .values([
      {
        title: "Acordar cedo",
        desiredWeeklyFrequency: 5,
      },
      {
        title: "Meditar",
        desiredWeeklyFrequency: 1,
      },
      {
        title: "Exercitar",
        desiredWeeklyFrequency: 2,
      },
    ])
    .returning();

  const startOfWeek = dayjs().startOf("week");

  await db.insert(goalsCompletions).values([
    {
      goalId: results[0].id,
      createdAt: startOfWeek.toDate(),
    },
    {
      goalId: results[1].id,
      createdAt: startOfWeek.add(1, "day").toDate(),
    },
  ]);
}
seed().finally(() => {
  client.end();
});
