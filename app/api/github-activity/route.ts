import { cachedJson } from "@/lib/cache";
import { GITHUB_USERNAME, githubFetch, githubGraphQL } from "@/lib/github";
import { readEnv } from "@/lib/env";

type GithubEvent = { created_at: string; type: string };

/** Date (YYYY-MM-DD) -> { count, level }. */
type DayMap = Record<string, { count: number; level: number }>;

type CalendarResponse = {
  viewer: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            date: string;
            contributionCount: number;
            contributionLevel: string;
          }[];
        }[];
      };
    };
  };
};

/**
 * Keyed by data source, not just version. Without this, adding a token would
 * appear to do nothing until the previously cached public-only entry expired.
 */
function cacheKey(hasToken: boolean) {
  return hasToken ? "github:activity:full:v2" : "github:activity:public:v2";
}
const CACHE_TTL_SECONDS = 60 * 60 * 3;
const WINDOW_DAYS = 84; // 12 weeks

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function windowBounds() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - (WINDOW_DAYS - 1));
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

/**
 * Full contribution calendar for the authenticated user, private included.
 *
 * `viewer` rather than `user(login:)` on purpose: the private totals are only
 * returned for the account that owns the token.
 */
async function fetchFullCalendar(): Promise<DayMap> {
  const { from, to } = windowBounds();

  const data = await githubGraphQL<CalendarResponse>(CONTRIBUTIONS_QUERY, {
    from: from.toISOString(),
    to: to.toISOString(),
  });

  const days: DayMap = {};
  for (const week of data.viewer.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      days[day.date] = {
        count: day.contributionCount,
        // GitHub's own quartiles, so the shading matches the profile page.
        level: LEVELS[day.contributionLevel] ?? 0,
      };
    }
  }
  return days;
}

function levelFromCount(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/** Public-only fallback for when no token is configured. */
async function fetchPublicEventCounts(): Promise<DayMap> {
  const response = await githubFetch(
    `/users/${GITHUB_USERNAME}/events/public?per_page=100`,
  );
  const events = (await response.json()) as GithubEvent[];

  const counts: Record<string, number> = {};
  for (const event of events) {
    const date = event.created_at.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }

  const days: DayMap = {};
  for (const [date, count] of Object.entries(counts)) {
    days[date] = { count, level: levelFromCount(count) };
  }
  return days;
}

async function fetchActivity(): Promise<DayMap> {
  if (!readEnv("GITHUB_TOKEN")) return fetchPublicEventCounts();

  try {
    return await fetchFullCalendar();
  } catch (error) {
    // Most likely a token without read:user. Degrade to public data rather
    // than showing an empty calendar.
    console.error("Contribution calendar unavailable, falling back to public events", error);
    return fetchPublicEventCounts();
  }
}

/**
 * Grid is rebuilt per request rather than cached, so a cached response still
 * ends on today's date instead of the day it was stored.
 */
function buildDays(days: DayMap) {
  const today = new Date();
  const out: { date: string; count: number; level: number }[] = [];

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const entry = days[key];
    out.push({ date: key, count: entry?.count ?? 0, level: entry?.level ?? 0 });
  }

  return out;
}

export async function GET() {
  const hasToken = Boolean(readEnv("GITHUB_TOKEN"));
  const result = await cachedJson(cacheKey(hasToken), CACHE_TTL_SECONDS, fetchActivity);
  const days = buildDays(result?.value ?? {});

  return Response.json(
    {
      days,
      totalContributions: days.reduce((sum, day) => sum + day.count, 0),
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
