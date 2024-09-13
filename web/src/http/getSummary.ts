type SummaryResponse = {
  completed: number;
  total: number;
  goalsPerday: Record<
    string,
    {
      id: string;
      title: string;
      desiredWeeklyFrequency: number;
      completedAt: string;
      completedAtDate: string;
    }[]
  >;
};

export async function getSummary(): Promise<SummaryResponse> {
  const response = await fetch("http://localhost:3333/week-summary");
  const data = await response.json();
  return data.summary;
}
