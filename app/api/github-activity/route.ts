type GithubEvent = { created_at: string; type: string };

export async function GET() {
  const today = new Date();
  const counts = new Map<string, number>();
  const days: { date: string; count: number; level: number }[] = [];

  try {
    const response = await fetch(
      "https://api.github.com/users/Raghunandan2813/events/public?per_page=100",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Raghunandan-Portfolio",
        },
      },
    );
    if (!response.ok) throw new Error("GitHub activity request failed");
    const events = (await response.json()) as GithubEvent[];
    for (const event of events) {
      const date = event.created_at.slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
  } catch {
    // A zero-state calendar is still useful when GitHub rate-limits the public API.
  }

  for (let offset = 83; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const count = counts.get(key) ?? 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    days.push({ date: key, count, level });
  }

  const totalEvents = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;

  return Response.json(
    { days, totalEvents, activeDays },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
