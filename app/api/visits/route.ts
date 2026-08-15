import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteStats } from "@/db/schema";
import { clientIp } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";

const PORTFOLIO_ID = "portfolio";
const VISIT_COOKIE = "rk_visit";
const VISIT_WINDOW_SECONDS = 60 * 60 * 24; // count a browser once per day

const NO_STORE = { "Cache-Control": "no-store" } as const;

function hasVisitCookie(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  return cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${VISIT_COOKIE}=`));
}

function visitCookie() {
  return `${VISIT_COOKIE}=1; Max-Age=${VISIT_WINDOW_SECONDS}; Path=/; SameSite=Lax; HttpOnly; Secure`;
}

async function readTotal(): Promise<number | null> {
  const db = await getDb();
  const [stats] = await db
    .select({ totalViews: siteStats.totalViews })
    .from(siteStats)
    .where(eq(siteStats.id, PORTFOLIO_ID))
    .limit(1);
  return stats?.totalViews ?? 0;
}

export async function GET() {
  try {
    return Response.json({ totalViews: await readTotal() }, { headers: NO_STORE });
  } catch (error) {
    console.error("Visit count read failed", error);
    return Response.json({ totalViews: null }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  try {
    // A returning browser within the window reads the total without adding to
    // it, so refreshes (including my own) no longer inflate the number.
    if (hasVisitCookie(request)) {
      return Response.json(
        { totalViews: await readTotal(), counted: false },
        { headers: NO_STORE },
      );
    }

    // Backstop for clients that ignore cookies, e.g. a scripted curl loop.
    const limit = await checkRateLimit({
      bucket: "visit",
      identifier: clientIp(request),
      limit: 3,
      windowSeconds: VISIT_WINDOW_SECONDS,
    });
    if (!limit.allowed) {
      return Response.json(
        { totalViews: await readTotal(), counted: false },
        { headers: { ...NO_STORE, "Set-Cookie": visitCookie() } },
      );
    }

    const db = await getDb();
    await db
      .insert(siteStats)
      .values({ id: PORTFOLIO_ID, totalViews: 1 })
      .onConflictDoUpdate({
        target: siteStats.id,
        set: {
          totalViews: sql`${siteStats.totalViews} + 1`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });

    return Response.json(
      { totalViews: await readTotal(), counted: true },
      { headers: { ...NO_STORE, "Set-Cookie": visitCookie() } },
    );
  } catch (error) {
    console.error("Visit count update failed", error);
    return Response.json({ totalViews: null }, { status: 503, headers: NO_STORE });
  }
}
