import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeekSummary } from "../../db/services/getWeekSummary";

const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/week-summary", async () => {
    const { summary } = await getWeekSummary();
    return { summary };
  });
};

export default getWeekSummaryRoute;
