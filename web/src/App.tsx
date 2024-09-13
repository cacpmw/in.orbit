import { Dialog } from "./components/ui/dialog";

import { CreateGoalDialog } from "./components/createGoalDialog";
import Summary from "./components/summary";
//import { useEffect, useState } from "react";
import { EmptyGoals } from "./components/emptyGoals";
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "./http/getSummary";

function App() {
  const { data } = useQuery({
    queryFn: getSummary,
    queryKey: ["summary"],
    staleTime: 1000 * 60,
  });

  // const [summary, setSummary] = useState<SummaryResponse>(
  //   {} as SummaryResponse
  // );

  // useEffect(() => {
  //   fetch("http://localhost:3333/week-summary")
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((data) => {
  //       setSummary(data.summary);
  //     });
  // }, []);
  return (
    <Dialog>
      {data && data.total > 0 ? <Summary /> : <EmptyGoals />}

      <CreateGoalDialog />
    </Dialog>
  );
}

export default App;
//singular - https://www.sngular.com/
// https://www.bairesdev.com/
// https://www.globant.com
