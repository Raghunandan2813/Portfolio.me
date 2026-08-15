# Raghunandan Kumar — Portfolio

Personal portfolio and case-study site for a Full Stack & Agentic AI Engineer.
Built on [vinext](https://github.com/cloudflare/vinext) (Next.js App Router on
Cloudflare Workers) with Cloudflare D1 + Drizzle for persistence.

**Live:** set `NEXT_PUBLIC_SITE_URL` — see [Configuration](#configuration).

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) via vinext |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
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

Copy `.env.example` to `.env` for local work, and set the same keys as secrets
in the hosting dashboard for production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical origin. Drives canonical tags, sitemap, and absolute OG image URLs. |
| `GITHUB_TOKEN` | Strongly recommended | Raises the GitHub API limit from 60/hr per shared IP to 5,000/hr. Without it both GitHub feeds degrade to cached or empty data. A fine-grained token with **no scopes** is sufficient. |
| `RESEND_API_KEY` | Recommended | Enables contact-form email notifications. Without it messages are still stored in D1. |
| `CONTACT_EMAIL` | With Resend | Notification destination. |
| `CONTACT_FROM` | No | Verified sender address. Defaults to the Resend shared sender. |

## Reliability notes

Three deliberate design decisions worth knowing before changing this code:

1. **The contact route delivers and persists independently.** `deliverEmail()`
   and `storeEnquiry()` both swallow their own errors and run under
   `Promise.all`, so a D1 outage cannot prevent the email and a Resend outage
   cannot prevent the stored copy. Only a both-failed case returns an error to
   the visitor. Do not reintroduce a sequence where one can throw before the
   other runs.

2. **GitHub responses go through a D1 read-through cache with stale-on-error.**
   See `lib/cache.ts`. When the API fails, an expired cache entry is served in
   preference to an empty feed. `/api/github-activity` caches the raw event
   counts, not the rendered calendar, so a cached response still ends on
   today's date.

3. **Rate limiting fails open.** `lib/rate-limit.ts` allows the request through
   if D1 is unreachable. Losing a real enquiry is worse than admitting spam,
   and every route validates independently.

## Development

```bash
npm run install:ci    # one bounded lockfile install
npm run dev           # Vite + vinext dev server
npm run build         # build and validate the deployable Sites artifact
npm test              # build, validate, verify rendered preview metadata
npm run lint          # eslint
```

Database and assets:

```bash
npm run db:generate   # regenerate Drizzle migrations after editing db/schema.ts
npm run og:generate   # re-render public/og.png (Node-side; run after copy edits)
```

`og:generate` runs in Node rather than in the Worker on purpose: `next/og`
pulls in satori and resvg WASM, which would consume a large share of the Worker
size budget if it ran at request time.

### Migrations

`drizzle/` is applied by the hosting platform. After editing `db/schema.ts`,
run `npm run db:generate` and commit both the generated SQL and the updated
`drizzle/meta/` snapshot.

## Prerequisites

- Node.js `>=22.13.0`
- The build and install helper scripts target Linux (`flock`, `curl`, GNU
  `timeout`) and are not native macOS scripts.

## Platform notes

- `.openai/hosting.json` declares the D1 binding (`DB`) and optional R2.
- `vite.config.ts` simulates declared bindings for local development.
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in
  helpers. Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, and
  `/callback` — do not implement app routes for those paths.
- The `codex-preview` meta tag in `app/layout.tsx` is required by the Sites
  preview tooling and asserted by `tests/rendered-html.test.mjs`. Leave it in
  place.
- `examples/d1/` is a reference surface from the starter, not wired into the
  site.
