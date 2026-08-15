import { cachedJson } from "@/lib/cache";
import { GITHUB_USERNAME, githubFetch } from "@/lib/github";

type GithubEvent = { created_at: string; type: string };

/** Date (YYYY-MM-DD) -> number of public events. */
type EventCounts = Record<string, number>;

const CACHE_KEY = "github:activity:v1";
const CACHE_TTL_SECONDS = 60 * 60 * 6;
const WINDOW_DAYS = 84; // 12 weeks

async function fetchEventCounts(): Promise<EventCounts> {
  const response = await githubFetch(
    `/users/${GITHUB_USERNAME}/events/public?per_page=100`,
  );
  const events = (await response.json()) as GithubEvent[];

  const counts: EventCounts = {};
  for (const event of events) {
    const date = event.created_at.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

function level(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Builds the calendar grid at request time rather than caching it, so a cached
 * response still ends on today's date instead of the day it was stored.
 */
function buildDays(counts: EventCounts) {
  const today = new Date();
  const days: { date: string; count: number; level: number }[] = [];

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const count = counts[key] ?? 0;
    days.push({ date: key, count, level: level(count) });
  }

  return days;
}

export async function GET() {
  const result = await cachedJson(CACHE_KEY, CACHE_TTL_SECONDS, fetchEventCounts);
  const days = buildDays(result?.value ?? {});

  return Response.json(
    {
      days,
      totalEvents: days.reduce((sum, day) => sum + day.count, 0),
      activeDays: days.filter((day) => day.count > 0).length,
      stale: result ? !result.fresh : true,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
      },
    },
  );
}
