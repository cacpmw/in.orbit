import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createGoal } from "../db/services/createGoal";
import z from "zod";
import { getCurrentWeekPendingGoals } from "../db/services/getCurrentWeekPendingGoals";
import { createGoalCompletion } from "../db/services/createGoalCompletion";

//Route validator
const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/pending-goals", async () => {
  const { pendingGoals } = await getCurrentWeekPendingGoals();
  return { pendingGoals };
});

app.post(
  "/goals",
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async (request) => {
    const { title, desiredWeeklyFrequency } = request.body;

    await createGoal({
      title,
      desiredWeeklyFrequency,
    });
  }
);

app.post(
  "/completions",
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async (request) => {
    const { goalId } = request.body;

    await createGoalCompletion({ goalId });
  }
);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server running on port 3333");
  });
