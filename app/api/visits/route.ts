import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteStats } from "@/db/schema";

const PORTFOLIO_ID = "portfolio";

export async function GET() {
  try {
    const db = await getDb();
    const [stats] = await db
      .select({ totalViews: siteStats.totalViews })
      .from(siteStats)
      .where(eq(siteStats.id, PORTFOLIO_ID))
      .limit(1);

    return Response.json(
      { totalViews: stats?.totalViews ?? 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ totalViews: null }, { status: 503 });
  }
}

export async function POST() {
  try {
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

    const [stats] = await db
      .select({ totalViews: siteStats.totalViews })
      .from(siteStats)
      .where(eq(siteStats.id, PORTFOLIO_ID))
      .limit(1);

    return Response.json(
      { totalViews: stats?.totalViews ?? 1 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ totalViews: null }, { status: 503 });
  }
}
