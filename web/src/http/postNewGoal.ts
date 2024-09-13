type NewGoalRequest = {
  title: string;
  desiredWeeklyFrequency: number;
};

export async function postNewGoal(newGoalPayload: NewGoalRequest) {
  await fetch("http://localhost:3333/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newGoalPayload),
  });
}
