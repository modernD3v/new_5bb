# 5 Borough Boarders: Website Build Plan

> Hand this file to Cursor. Build one phase at a time. Do not start the next phase until the current phase's acceptance criteria pass.

## 1. Project summary

5 Borough Boarders (@5boroughboarders) is a NYC snowboarding community with about 1,200 Instagram followers. Mission: help snowboarders in the five boroughs cut travel costs and make new friends.

The website is the community's home base. It does five jobs:

1. **Snow Board (community map):** an interactive map of the mountains NYC riders go to. Each mountain gets a weekend snow score (1 to 10). Members can check in ("I'm going Saturday"), post and comment.
2. **Trips & Events:** upcoming trips and meetups, each linking to its Partiful RSVP.
3. **Catch a Ride:** carpool offers and requests so members split gas and tolls.
4. **Shop:** merch drops (shirts etc.). **Built now, hidden at launch** behind the `SHOP_ENABLED` flag (see section 12.1).
5. **Join:** email signup so the community isn't dependent on Instagram.

Primary audience is on phones. **Design mobile first.**

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (latest, App Router, TypeScript, Server Components, Server Actions) |
| Hosting | Vercel |
| Database | Neon Postgres (use the Vercel Neon integration) |
| ORM | Drizzle ORM + drizzle-kit migrations, `@neondatabase/serverless` driver |
| Auth | Auth.js (NextAuth v5) with Drizzle adapter. Providers: Google + email magic link via Resend |
| Styling | Tailwind CSS + shadcn/ui |
| Map | Leaflet via `react-leaflet` with OpenStreetMap tiles (load client-side only with `next/dynamic`, `ssr: false`) |
| Weather | Open-Meteo Forecast API (free, no key) |
| Image uploads | Vercel Blob |
| Email | Resend (magic links, email list, notifications) |
| Payments | Stripe Checkout + webhook |
| Validation | Zod on every form and API input |
| Tests | Vitest for the scoring engine and utilities |
| Analytics | Vercel Analytics |

### Environment variables

```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_RESEND_KEY=
RESEND_API_KEY=
EMAIL_FROM=
BLOB_READ_WRITE_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
SHOP_ENABLED=false
```

Create a `.env.example` with these keys. Never commit real values.

## 3. Brand and design

- Logo: black and white circular badge (snowboarder over a city skyline). Owner will supply the file in `/public/brand/`.
- Palette: black `#0A0A0A`, white `#FFFFFF`, ice blue accent `#7DD3FC`, plus score colors (below).
- Vibe: NYC street meets snow. Bold condensed headings, lots of photos, friendly copy.
- Score colors: 8 to 10 green `#22C55E`, 6 to 7 lime `#A3E635`, 4 to 5 amber `#F59E0B`, 1 to 3 red `#EF4444`, indoor gray `#94A3B8`.
- Accessibility: never rely on color alone. Every pin and badge also shows the number.

## 4. Site map and routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Home: hero, this weekend's top 3 mountains, next trip, latest posts, join CTA, Instagram link | Public |
| `/board` | Full-screen map with scored pins + side list ranked by score | Public |
| `/mountains/[slug]` | Mountain page: score, reasons, Sat/Sun forecast, who's going, posts feed | Public read, member write |
| `/trips` | Upcoming and past events | Public |
| `/rides` | Ride offers, filter by mountain, date, borough | Members |
| `/rides/new` | Offer a ride | Members |
| `/rides/[id]` | Ride detail + request a seat | Members |
| `/shop`, `/shop/[slug]`, `/shop/success` | Merch | Public |
| `/crew` | About, founder story, rider spotlights, collab/sponsor contact form | Public |
| `/join` | Email signup | Public |
| `/profile` | Edit handle, home borough, Instagram handle, avatar | Members |
| `/admin` | Manage events, products, mountains, moderation queue | Admin |
| `/api/stripe/webhook` | Stripe events | Stripe signature |

Global nav (mobile bottom bar): Board, Trips, Rides, Shop, Profile. The Shop tab only renders when `SHOP_ENABLED=true`.

## 5. Database schema (Drizzle)

Include the standard Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`). Extend `users` with:

- `handle` (unique text), `home_borough` (enum: manhattan, brooklyn, queens, bronx, staten_island), `instagram_handle`, `role` (enum: member, admin; default member), `created_at`

App tables:

**mountains**: `id`, `slug` (unique), `name`, `state`, `lat`, `lon`, `summit_elev_ft`, `base_elev_ft`, `is_indoor` (bool), `website_url`, `drive_note` (e.g. "about 2.5 hrs from Midtown"), `active` (bool)

**refresh_locks**: `key` (text primary key), `locked_until` (timestamptz)

**score_snapshots**: `id`, `mountain_id`, `weekend_start` (date, the Saturday), `score` (int 1 to 10, null for indoor), `label`, `reasons` (jsonb string array), `forecast` (jsonb: daily Sat/Sun summary), `computed_at`. Unique on (`mountain_id`, `weekend_start`); upsert.

**checkins**: `id`, `user_id`, `mountain_id`, `date`, `note` (short text), `created_at`. Unique on (`user_id`, `mountain_id`, `date`).

**posts**: `id`, `user_id`, `mountain_id` (nullable for general posts), `body`, `image_url`, `hidden` (bool), `created_at`

**comments**: `id`, `post_id`, `user_id`, `body`, `hidden`, `created_at`

**reports**: `id`, `reporter_id`, `target_type` (post, comment, ride), `target_id`, `reason`, `status` (open, resolved), `created_at`

**events**: `id`, `title`, `slug`, `starts_at`, `mountain_id` (nullable), `location_text`, `partiful_url`, `image_url`, `description`, `published` (bool)

**ride_offers**: `id`, `driver_id`, `mountain_id`, `date`, `depart_borough`, `depart_area` (free text, e.g. "Atlantic Terminal"), `depart_time`, `seats_total`, `cost_per_seat_cents`, `has_board_space` (bool), `notes`, `status` (open, full, cancelled), `created_at`

**ride_requests**: `id`, `ride_id`, `rider_id`, `message`, `status` (pending, accepted, declined), `created_at`. Unique on (`ride_id`, `rider_id`).

**subscribers**: `id`, `email` (unique), `first_name`, `home_borough`, `source` (join_page, checkout, footer), `created_at`, `unsubscribed_at`

**products**: `id`, `slug`, `name`, `description`, `price_cents`, `images` (jsonb), `sizes` (jsonb), `stripe_price_id`, `active`, `drop_at`

**orders**: `id`, `stripe_session_id` (unique), `email`, `amount_cents`, `status`, `line_items` (jsonb), `shipping` (jsonb), `created_at`

## 6. Mountains seed data

Seed these 10. **Verify every coordinate and elevation against the resort's official site or OpenStreetMap before seeding.** The values below are approximate starting points.

| slug | name | state | lat | lon | indoor |
|---|---|---|---|---|---|
| hunter | Hunter Mountain | NY | 42.2017 | -74.2293 | no |
| windham | Windham Mountain | NY | 42.2945 | -74.2567 | no |
| belleayre | Belleayre Mountain | NY | 42.1350 | -74.5045 | no |
| mountain-creek | Mountain Creek | NJ | 41.1885 | -74.5087 | no |
| camelback | Camelback Mountain | PA | 41.0510 | -75.3560 | no |
| blue-mountain | Blue Mountain | PA | 40.8110 | -75.5190 | no |
| mount-snow | Mount Snow | VT | 42.9601 | -72.9204 | no |
| stratton | Stratton Mountain | VT | 43.1134 | -72.9081 | no |
| killington | Killington | VT | 43.6045 | -72.8201 | no |
| big-snow | Big Snow American Dream | NJ | 40.8090 | -74.0700 | yes |

Admins can add more mountains from `/admin` later.

## 7. Weekend Snow Score (core feature)

### 7.1 Data fetch

Put all logic in `lib/snow/`. Call Open-Meteo once for all outdoor mountains (it accepts comma-separated `latitude` and `longitude` lists):

```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat1,lat2,...}&longitude={lon1,lon2,...}
  &elevation={summit_elev_m1,...}
  &daily=snowfall_sum,rain_sum,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max
  &hourly=temperature_2m,snowfall,rain,wind_gusts_10m
  &temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch
  &timezone=America/New_York&past_days=5&forecast_days=10
```

Pass summit elevation (converted to meters) so the forecast reflects mountain conditions, not the valley. Check the Open-Meteo docs for current parameter names before coding.

### 7.2 Which weekend

- Mon to Fri: the upcoming Saturday and Sunday.
- Saturday or Sunday: the current weekend.
- Expose `getTargetWeekend(now: Date)` and unit test it, including DST changes, in `America/New_York`.

### 7.3 Inputs (per mountain)

| Input | Definition |
|---|---|
| `recentSnowIn` | Total snowfall from Wednesday 00:00 through Friday 23:59 before the weekend |
| `weekendSnowIn` | Total snowfall Sat + Sun |
| `dayTempF` | Average hourly temp Sat + Sun, 9am to 4pm |
| `rainIn` | Total rain Friday + Sat + Sun |
| `coldNights` | Number of nights Mon to Fri where the daily min is 24°F or lower (snowmaking weather) |
| `maxGustMph` | Highest hourly gust Sat + Sun, 9am to 4pm |

### 7.4 Formula

Start at `5`, then:

1. **Fresh snow:** `+ min(recentSnowIn * 0.5, 3)`
2. **Weekend snow:** `+ min(weekendSnowIn * 0.3, 1.5)`
3. **Temperature:**
   - 15 to 30°F: `+1`
   - above 30 up to 35°F: `+0`
   - above 35°F: `- min((dayTempF - 35) * 0.2, 3)`
   - below 5°F: `-1` (brutally cold)
4. **Rain:** if `rainIn > 0.1`: `- min(rainIn * 6, 4)`
5. **Snowmaking:** `+ min(coldNights * 0.25, 1)`
6. **Wind:** gust above 40 mph `-2`, else above 30 mph `-1`

Round to the nearest integer and clamp to 1 to 10.

Labels: 8 to 10 **Send it**, 6 to 7 **Solid**, 4 to 5 **Meh**, 1 to 3 **Skip it**.

Indoor mountains (Big Snow) skip scoring: `score = null`, label **Indoor: always on**.

### 7.5 Reasons

Return a `reasons: string[]` showing the biggest factors in plain English, sorted by impact, max 4. Examples:

- "6 in of fresh snow since Wednesday"
- "Rain expected Saturday (0.4 in)"
- "4 cold nights for snowmaking"
- "Gusts up to 38 mph may hold lifts"

### 7.6 Code shape

```ts
// lib/snow/score.ts (pure function, no I/O)
export type ScoreInputs = { recentSnowIn: number; weekendSnowIn: number; dayTempF: number; rainIn: number; coldNights: number; maxGustMph: number };
export type ScoreResult = { score: number; label: string; reasons: string[] };
export function scoreWeekend(i: ScoreInputs): ScoreResult;

// lib/snow/extract.ts: turns an Open-Meteo response into ScoreInputs for one location
// lib/snow/refresh.ts: fetch all mountains, compute, upsert score_snapshots
```

Keep all weights in one exported `WEIGHTS` constant so they can be tuned later.

### 7.7 Refresh strategy (on demand, 40 minute freshness)

No cron job. Scores refresh when someone visits.

- Freshness window: `SCORE_TTL_MINUTES = 40` (exported constant in `lib/snow/config.ts`).
- On any request that needs scores (`/`, `/board`, `/mountains/[slug]`), read the latest `score_snapshots` for the target weekend.
- If the newest `computed_at` is 40 minutes old or less: serve it.
- If it is older than 40 minutes: serve the stale snapshot immediately, then run `refresh.ts` in the background with `after()` from `next/server` (stale-while-revalidate). The next visitor gets fresh scores.
- If no snapshot exists yet for the target weekend (first visit of the week): run the refresh inline and wait for it, then render.
- **Refresh lock:** a `refresh_locks` table (`key` text primary key, `locked_until` timestamptz). Before refreshing, atomically claim the lock with `INSERT ... ON CONFLICT (key) DO UPDATE SET locked_until = now() + interval '2 minutes' WHERE refresh_locks.locked_until < now() RETURNING key`. If no row returns, another request is already refreshing, so skip. This prevents duplicate Open-Meteo calls when several people load the page at once.
- One batched Open-Meteo call covers all outdoor mountains, so the maximum is about 36 calls per day.
- If Open-Meteo fails, keep the last snapshot, release the lock, log the error, and show "Updated X hours ago".
- Admin page gets a "Refresh scores now" button that calls the same function (ignores the TTL, still respects the lock).

### 7.8 Tests (required)

Vitest fixtures for: big powder weekend (score 9 or 10), rainy warm weekend (1 to 3), cold dry week with lots of snowmaking (6 or 7), windy weekend penalty, clamp at both ends, indoor mountain, `getTargetWeekend` on each weekday.

### 7.9 Disclaimer

Show under every score: "Forecast-based score. Doesn't know trail counts or base depth. Check the resort before you go." Link to the resort's site.

## 8. Snow Board map (`/board`)

- Leaflet map centered to fit all mountains, OpenStreetMap tiles with attribution.
- Custom circular pins colored by score with the number inside. Indoor pin uses a building icon.
- Tap a pin: bottom sheet (mobile) or popup (desktop) with name, score, label, top 2 reasons, "X riders going this weekend", and a "View mountain" button.
- Toggle between Saturday and Sunday check-in counts.
- Below or beside the map: list of mountains ranked by score (list view is the accessible fallback).
- Map component loads with `next/dynamic` and `ssr: false`; show a skeleton while loading.

## 9. Mountain page (`/mountains/[slug]`)

- Header: name, state, drive note, big score badge, label, all reasons, "Updated X ago".
- Forecast strip: Fri, Sat, Sun with snow, rain, high/low, max gust.
- **Who's going:** avatars and handles grouped by Saturday and Sunday. Members tap "I'm going Sat" or "I'm going Sun" (toggle). Optional note ("Leaving Williamsburg 5am, 2 seats").
- CTA next to check-in: "Driving? Offer a ride" links to `/rides/new?mountain=slug&date=...`. "Need a ride?" links to filtered `/rides`.
- Posts feed for this mountain: text + optional photo, comments, report button.
- Server Actions for check-in, post, comment. Revalidate the page path after writes.

## 10. Trips & Events (`/trips`)

- Admin creates events with title, date, mountain, location, Partiful URL, image, description.
- Cards show date, image, mountain score if the event is this weekend, and an "RSVP on Partiful" button (opens in new tab).
- Past events move to a "Past trips" section.

## 11. Catch a Ride (`/rides`)

- Members only.
- Offer form: mountain, date, borough, pickup area (general, not an exact address), departure time, seats, cost per seat, board space, notes.
- List with filters: mountain, date, borough. Show seats left.
- Riders send a request with a short message. Driver sees requests on the ride page and accepts or declines. Email both sides via Resend on request and on accept.
- Contact details are never public. After acceptance, show each side the other's handle and Instagram handle only.
- Seats left = `seats_total - accepted requests`; mark `full` automatically.
- Show community safety guidelines on the page and require members to tick "I've read the ride guidelines" once before offering or requesting. Ride features are for members 18+ (checkbox at signup for ride access).

## 12. Shop (`/shop`)

### 12.1 Feature flag (shop hidden at launch)

The shop is fully built and tested but **not public at launch**.

- `lib/flags.ts` exports `isShopEnabled()` which reads `SHOP_ENABLED` (server-side only, defaults to `false`).
- When disabled:
  - `/shop`, `/shop/[slug]`, `/shop/success` return `notFound()` for everyone except admins.
  - The Shop nav tab, home page merch section, footer shop link and "Notify me" drop CTAs do not render.
  - Shop routes are excluded from `sitemap.xml` and marked `noindex`.
  - The Checkout Server Action and `/api/stripe/webhook` refuse requests (return 404) unless the flag is on, so nothing can be bought even with a direct link.
- **Admin preview:** admins can see and test every shop page while the flag is off, with a banner "Shop preview: not visible to the public".
- Stripe stays in **test mode** until launch day. Use Stripe test keys in all environments while the flag is off.
- Admins can still create products, upload photos and set drop dates so the shop is stocked and ready.
- Going live = set `SHOP_ENABLED=true` in Vercel, swap to Stripe live keys, redeploy. No code changes.

### 12.2 Shop features

- Admin manages products (name, images, sizes, price, drop date, active).
- On save, create or update the Stripe Product and Price and store `stripe_price_id`.
- Product page: images, size picker, "Buy" button that creates a Stripe Checkout Session (collect shipping address, allow promo codes).
- `/api/stripe/webhook` verifies the signature, handles `checkout.session.completed`, writes an `orders` row, and adds the buyer email to `subscribers` with `source = checkout` only if they ticked the opt-in.
- Products with a future `drop_at` show a countdown and "Notify me" (adds to subscribers).
- Keep it simple: no cart in v1, one product per checkout.

## 13. Join and email list (`/join`)

- Form: email, first name, home borough. Zod validated, honeypot field against bots, rate limited.
- Store in `subscribers`, send a welcome email via Resend.
- Footer on every page has a compact signup.
- Admin can export subscribers as CSV.

## 14. Crew page (`/crew`)

- Mission statement: "Helping the snowboarding community in the 5 boroughs of NYC cut costs on travel and make new friends."
- Founder section, rider spotlights (admin-managed later; hardcoded in v1 is fine), Instagram link, collab and sponsor contact form (emails the owner via Resend).

## 15. Auth, roles, moderation

- Sign in with Google or email magic link. On first sign-in, send to onboarding: choose handle, home borough, optional Instagram handle, accept community guidelines.
- `role = admin` set manually in the database for the owner.
- Middleware protects `/rides`, `/profile`, `/admin`.
- Every post, comment and ride has a Report button. Reports appear in `/admin` moderation queue. Admin can hide content or ban a user (`banned` bool on users; banned users can read but not write).
- Rate limits on posting, commenting, check-ins, ride requests and signup (simple Postgres-backed or Upstash).
- Max image size 5 MB, images only.

## 16. Build phases

### Phase 0: Setup
- Next.js App Router + TypeScript + Tailwind + shadcn/ui, ESLint, Prettier.
- Drizzle + Neon connection, first migration, seed script.
- Deploy to Vercel with Neon integration.
- **Done when:** empty site deploys, `pnpm db:migrate` and `pnpm db:seed` work.

### Phase 1: Scores + map (no auth)
- Mountains seed, Open-Meteo fetch, scoring engine, tests, on-demand refresh with 40 minute TTL and refresh lock, `/board`, basic `/mountains/[slug]` (score + forecast only).
- **Done when:** map shows 10 pins with correct colors and numbers, all Vitest tests pass, a snapshot older than 40 minutes triggers exactly one background refresh even when several requests arrive together.

### Phase 2: Members + community
- Auth.js, onboarding, profiles, check-ins, posts, comments, image upload, reports, admin moderation.
- **Done when:** a member can check in to Hunter for Saturday, post a photo, another member can comment, and admin can hide it.

### Phase 3: Trips + Catch a Ride
- Events CRUD in admin, `/trips`, ride offers, requests, accept flow, emails.
- **Done when:** a driver offers 3 seats, two riders request, driver accepts one, seats left shows 2, both get emails.

### Phase 4: Home, Crew, Join
- Home page pulling live data, Crew page, email signup, footer signup, CSV export.
- **Done when:** home shows this weekend's top 3 mountains and next trip; signup stores subscriber and sends welcome email.

### Phase 5: Shop (built behind the flag)
- Feature flag, products admin, Stripe sync (test mode), product pages, Checkout, webhook, orders, drop countdown, admin preview banner.
- **Done when:** with `SHOP_ENABLED=false`, a logged-out visitor gets 404 on every shop route and sees no shop links anywhere, while an admin can complete a test-mode purchase that creates an order row. With `SHOP_ENABLED=true`, the same flow works for the public.

### Phase 6: Polish and launch
- SEO metadata, Open Graph images (per mountain: "Hunter: 8/10 this weekend" for sharing to Instagram stories), sitemap, 404 page, loading and error states, Vercel Analytics, Lighthouse mobile score 90+, accessibility pass.
- **Done when:** launch checklist below is complete.

## 17. Launch checklist

- [ ] Domain connected (5boroughboarders.com or backup) with HTTPS
- [ ] Mountain coordinates verified
- [ ] Scores sanity-checked against a real weekend forecast
- [ ] Community and ride guidelines written and linked
- [ ] Privacy policy and terms pages
- [ ] Resend domain verified (SPF/DKIM)
- [ ] Owner account set to admin
- [ ] Instagram bio link updated to the site
- [ ] Confirm `SHOP_ENABLED=false` in production

### Shop go-live checklist (later)

- [ ] Upgrade to Vercel Pro (Hobby plan is non-commercial use only)
- [ ] Review Open-Meteo terms; the free API is non-commercial, so confirm whether a paid plan is needed once merch is selling
- [ ] Stripe live keys added in Vercel, live webhook endpoint registered
- [ ] Products, sizes, prices and shipping rates checked
- [ ] Shipping and returns policy page
- [ ] Set `SHOP_ENABLED=true` and redeploy

## 18. Rules for Cursor

- Work one phase at a time. Summarize what you built and how to test it at the end of each phase.
- Server Components by default; client components only for interactivity (map, forms with live state).
- All DB access in `lib/db/` query functions, never inline in components.
- Validate every input with Zod on the server.
- No secrets in client code. Only `NEXT_PUBLIC_` vars reach the browser.
- Keep the scoring engine pure and fully tested; UI never computes scores.
- Mobile first: test every page at 375px wide.
- Ask before adding any dependency not listed in section 2.
- Out of scope for v1: native app, DMs between members, cart with multiple items, paid memberships, live lift/trail data.

## 19. SEO and AI search

Reusable helpers so every public page gets consistent metadata, crawl rules, and structured data. Brand name is always **Five Borough Boarders**. Exactly one `H1` per page. Meaningful `alt` on every image.

### 19.1 `lib/seo.ts`

`buildMetadata({ title, description, path, image? })` returns Next.js `Metadata` with:

- `metadataBase` from `NEXT_PUBLIC_SITE_URL`
- Canonical URL for `path`
- Open Graph + Twitter card (default image `/brand/logo-badge-1024.png`)
- Title template `"%s | Five Borough Boarders"` (root layout); page titles pass the page-specific segment
- On non-production (`VERCEL_ENV !== "production"`): `robots: { index: false, follow: false }` and a matching `<meta name="robots" content="noindex,nofollow">`

Use `buildMetadata` on every page (static export or `generateMetadata`).

Root layout defaults:

- Title template `%s | Five Borough Boarders`
- Default description: `Five Borough Boarders is a NYC snowboarding community helping riders in all five boroughs cut travel costs, share rides and make new friends.`

### 19.2 `robots.ts`

- If `VERCEL_ENV !== "production"`: disallow all user agents.
- Production: allow all agents, and explicitly allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`. Disallow `/admin`, `/api`, `/profile`, `/rides`, and `/shop` while `SHOP_ENABLED` is false. Link the sitemap.

### 19.3 `sitemap.ts`

Static public routes (`/`, `/board`, `/crew`, `/join`, `/faq`, and `/trips` when it exists) + every active mountain + published upcoming events, with `lastModified`. Exclude shop routes when `SHOP_ENABLED` is false and all member-only / admin routes.

### 19.4 JSON-LD (`components/seo/JsonLd.tsx`)

Render `<script type="application/ld+json">` via a small `JsonLd` component.

- **Root layout:** `Organization` (name, url, logo, `sameAs: ["https://www.instagram.com/5boroughboarders"]`) + `WebSite`.
- **`/mountains/[slug]`:** `SkiResort` (name, geo lat/lon, url = resort website) + `BreadcrumbList` (Home → Board → Mountain).
- **`/trips` (when it exists):** one `Event` per upcoming trip (`name`, `startDate`, `location`, `offers.url` = Partiful link). Helpers live in `lib/seo.ts` so Phase 3 can plug them in.
- **`/faq`:** `FAQPage`.

### 19.5 Mountain pages (SSR text)

- `H1`: `<Mountain name> snow forecast this weekend`
- Server-render score, label, reasons, Fri/Sat/Sun forecast, and “Updated X ago” as plain HTML text (not client-only).
- Title: `<Mountain> Snow Forecast This Weekend`
- Description includes the current score and top reason.

### 19.6 `public/llms.txt`

Plain-language summary for AI crawlers (under 60 lines): mission, who it’s for, NYC focus, what each section does, how the snow score works in two sentences, and absolute links to key pages.

### 19.7 `/faq`

Public FAQ linked from the footer, with `FAQPage` JSON-LD. Friendly 2–4 sentence answers grounded in this plan. Mark any answer that needs owner-confirmed facts (prices, specific bus/train options) with a `TODO` comment instead of guessing.
