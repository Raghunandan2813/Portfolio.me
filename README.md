# Raghunandan Kumar — Portfolio

Personal portfolio and case-study site for a Full Stack & Agentic AI Engineer.
Next.js App Router on Vercel, with Supabase Postgres and Drizzle ORM.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) |
| Hosting | Vercel |
| Database | Supabase Postgres + Drizzle ORM (postgres-js) |
| Styling | Hand-written CSS with design tokens, Tailwind v4 available |
| Email | Resend |

## Routes

| Path | Description |
| --- | --- |
| `/` | Profile, about, featured work, GitHub feeds, experience, stack, contact |
| `/projects` | Case-study archive |
| `/projects/[slug]` | Individual case study (statically generated) |
| `/api/contact` | `POST` — validates, emails, and stores an enquiry |
| `/api/visits` | `GET` total, `POST` counts one unique visit per browser per day |
| `/api/github` | Latest public repositories, cached |
| `/api/github-activity` | 12-week public contribution calendar, cached |
| `/sitemap.xml`, `/robots.txt` | Generated from `app/sitemap.ts` and `app/robots.ts` |

## Configuration

Copy `.env.example` to `.env` locally, and set the same keys in
**Vercel → Settings → Environment Variables** for production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Supabase **transaction pooler** string (port 6543). |
| `DIRECT_URL` | For migrations | Supabase **direct** connection (port 5432), used only by drizzle-kit. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical origin. Drives canonical tags, sitemap, and absolute OG image URLs. |
| `GITHUB_TOKEN` | Strongly recommended | Raises the GitHub API limit from 60/hr per IP to 5,000/hr. Without it both GitHub feeds degrade to cached or empty data. A fine-grained token with **no scopes** is enough. |
| `BREVO_API_KEY` | Recommended | Enables contact-form email. Without it messages are still stored in Postgres. |
| `CONTACT_EMAIL` | With Brevo | Notification destination. |
| `CONTACT_FROM` | No | Sender address, verified in Brevo under **Senders & IP**. Defaults to `CONTACT_EMAIL`. |

Brevo is used rather than Resend because it verifies a single sender *address*
instead of a whole domain, so a personal mailbox works without owning a domain.
Replies go to the visitor via `Reply-To`, not to the sender address.

### Why two database URLs

Vercel serverless functions open a connection per invocation, so the app must
talk to Postgres through Supabase's PgBouncer **transaction pooler** or it will
exhaust the connection limit. PgBouncer in transaction mode cannot use prepared
statements, which is why `db/index.ts` sets `prepare: false`.

Migrations need DDL that PgBouncer restricts, so drizzle-kit uses `DIRECT_URL`
instead. This split is normal for Supabase on serverless.

## Reliability notes

Three deliberate design decisions worth knowing before changing this code:

1. **The contact route delivers and persists independently.** `deliverEmail()`
   and `storeEnquiry()` each swallow their own errors and run under
   `Promise.all`, so a database outage cannot prevent the email and a Resend
   outage cannot prevent the stored copy. Only a both-failed case returns an
   error. Do not reintroduce a sequence where one can throw before the other
   runs.

2. **GitHub responses go through a read-through cache with stale-on-error.**
   See `lib/cache.ts`. When the API fails, an expired cache entry is served in
   preference to an empty feed. `/api/github-activity` caches the raw event
   counts, not the rendered calendar, so a cached response still ends on
   today's date.

3. **Rate limiting fails open.** `lib/rate-limit.ts` allows the request through
   if the database is unreachable. Losing a real enquiry is worse than
   admitting spam, and every route validates independently.

## Development

```bash
npm install
npm run dev           # http://localhost:3000
npm run build         # production build
npm run typecheck     # tsc --noEmit
npm run lint
```

Database and assets:

```bash
npm run db:generate   # generate migrations after editing db/schema.ts
npm run db:migrate    # apply migrations (uses DIRECT_URL)
npm run db:studio     # browse data
npm run og:generate   # re-render public/og.png after copy changes
```

`og:generate` runs in Node at authoring time rather than at request time:
`next/og` pulls in satori and resvg WASM, and rendering a card that never
changes on every request would be wasteful.

## Deploying to Vercel

1. Push this branch to GitHub and import the repo in Vercel.
2. Add every variable from the table above (including both database URLs).
3. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the real deployment URL and
   redeploy, so canonical tags and OG images resolve correctly.
4. Run `npm run db:migrate` once against the Supabase project.
