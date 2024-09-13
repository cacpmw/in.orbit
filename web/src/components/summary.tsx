import { CheckCircle2, Plus } from "lucide-react";
import { DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { InOrbitIcon } from "./inOrbitIcon";
import { Progress, ProgressIndicator } from "./ui/progress-bar";
import { Separator } from "./ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "../http/getSummary";
import dayjs from "dayjs";
import ptbr from "dayjs/locale/pt-br";
import { PendingGoals } from "./pendingGoals";

export default function Summary() {
  const { data } = useQuery({
    queryFn: getSummary,
    queryKey: ["summary"],
    staleTime: 1000 * 60,
  });

  if (!data) {
    return null;
  }
  dayjs.locale(ptbr);
  const firstDayOfWeek = dayjs().startOf("week").format("D MMM");
  const lastDayOfWeek = dayjs().endOf("week").format("D MMM");

  const progress = Math.round((data.completed / data.total) * 100);
  return (
    <div className="py-10 max-w-[480px] px-5 mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <InOrbitIcon />
          <span className="text-lg font-semibold capitalize">{`${firstDayOfWeek} - ${lastDayOfWeek}`}</span>
        </div>
        <DialogTrigger asChild>
          <Button
            size="sm"
            type="button"
            className="bg-violet-500
         text-violet-50
         px-4 py-2.5
         rounded-lg
         flex
         gap-2
         items-center
         text-sm
         font-medium
         tracking-tight
         hover:bg-violet-600
         "
          >
            <Plus className="size-4" />
            Cadastrar meta
          </Button>
        </DialogTrigger>
      </div>

      <div className="flex flex-col gap-3">
        <Progress value={data.completed} max={data.total}>
          <ProgressIndicator style={{ width: `${progress}%` }} />
        </Progress>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Você completou{" "}
            <span className="text-zinc-100">{data.completed || 0}</span> de{" "}
            <span className="text-zinc-100">{data.total || 0}</span> metas nessa
            semana.
          </span>
          <span>{progress}%</span>
        </div>
      </div>

      <Separator />

      <PendingGoals />
      <div className="flex flex-col gap-6">
        <h2 className="font-medium text-lg text-zinc-100">Sua semana</h2>

        {Object.entries(data.goalsPerday).map(([date, goals]) => {
          const weekDay = dayjs(date).format("dddd");
          const formatedDate = dayjs(date).format("D[ de ]MMMM");
          return (
            <div key={date} className="flex flex-col gap-4">
              <h3 className="font-medium capitalize">
                {weekDay}{" "}
                <span className="text-zinc-400 text-xs">({formatedDate})</span>
              </h3>

              <ul className="flex flex-col gap-3">
                {goals.map((goal) => {
                  const time = dayjs(goal.completedAt).format("HH:mm");
                  return (
                    <li key={goal.id} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-pink-500" />
                      <span className="text-zinc-400">
                        Você completou{" "}
                        <span className="text-sm text-zinc-100">
                          “{goal.title}”
                        </span>{" "}
                        às{" "}
                        <span className="text-sm Stext-zinc-100">{time}h</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
