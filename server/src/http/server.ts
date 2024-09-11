import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import createCompletionRoute from "./routes/createCompletion.routes";
import createGoalRoute from "./routes/createGoal.routes";
import createPendingGoalsRoute from "./routes/createPendingGoal.routes";
import getWeekSummaryRoute from "./routes/getWeekSummary.routes";
import fastifyCors from "@fastify/cors";

//Route validator
const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
  origin: "*",
});

app.register(createGoalRoute);
app.register(createPendingGoalsRoute);
app.register(createCompletionRoute);
app.register(getWeekSummaryRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server running on port 3333");
  });
