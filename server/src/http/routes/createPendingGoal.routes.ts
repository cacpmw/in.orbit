import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getCurrentWeekPendingGoals } from "../../db/services/getCurrentWeekPendingGoals";

const createPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/pending-goals", async () => {
    const { pendingGoals } = await getCurrentWeekPendingGoals();
    return { pendingGoals };
  });
};

export default createPendingGoalsRoute;
