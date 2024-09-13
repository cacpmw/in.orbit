import { Plus } from "lucide-react";
import { OutlineButton } from "./ui/outline-button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingGoals } from "../http/getPendingGoals";
import { postCompleteGoal } from "../http/postPendingGoal";

export function PendingGoals() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryFn: getPendingGoals,
    queryKey: ["pending-goals"],
    staleTime: 1000 * 60,
  });

  if (!data) {
    return null;
  }
  async function handleCompleteGoal(goalId: string) {
    await postCompleteGoal(goalId);
    await queryClient.invalidateQueries({ queryKey: ["summary"] }); //refetches data
    await queryClient.invalidateQueries({ queryKey: ["pending-goals"] }); //refetches data
  }
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((pendingGoal) => {
        return (
          <OutlineButton
            key={pendingGoal.id}
            disabled={
              pendingGoal.completionCount >= pendingGoal.desiredWeeklyFrequency
            }
            onClick={() => handleCompleteGoal(pendingGoal.id)}
          >
            <Plus className="size-4 text-zinc-600" />
            {pendingGoal.title}
          </OutlineButton>
        );
      })}
    </div>
  );
}
