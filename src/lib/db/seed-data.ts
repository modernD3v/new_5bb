/**
 * Mountain seed data for 5 Borough Boarders.
 *
 * Coordinates and elevations were verified before seeding (Phase 0).
 * Prefer ski-area summit/base (lift-served) over geological peaks so
 * Open-Meteo elevation hints match where people actually ride.
 *
 * Sources (checked 2026-09-28):
 *
 * Hunter
 * - Coords: USGS GNIS / Wikipedia "Colonels Chair" (ski area sits on this
 *   subpeak) — 42.20056, -74.23083
 *   https://en.wikipedia.org/wiki/Colonels_Chair
 * - Elev: Hunter Mountain Resort mountain info — summit 3,200 ft, base 1,600 ft
 *   https://www.huntermtn.com/the-mountain/about-the-mountain/mountain-info.aspx
 *   (Colonels Chair GNIS elev 3,199 ft matches resort summit.)
 *
 * Windham
 * - Coords: OpenStreetMap relation 14336718 (landuse=winter_sports centroid)
 *   42.2939257, -74.2613118 — Nominatim "Windham Mountain Club"
 * - Elev: Wikipedia "Windham Mountain Club" — top 3,100 ft, base 1,500 ft
 *   https://en.wikipedia.org/wiki/Windham_Mountain
 *
 * Belleayre
 * - Coords: Wikipedia resort lat/lon — 42.1422139, -74.510778
 *   https://en.wikipedia.org/wiki/Belleayre_Mountain
 *   (OSM winter_sports centroid 42.13033, -74.50808 also checked.)
 * - Elev: Wikipedia / ORDA stats — top 3,429 ft, base 2,025 ft
 *
 * Mountain Creek
 * - Coords: Wikipedia — 41.181, -74.513
 *   https://en.wikipedia.org/wiki/Mountain_Creek
 *   (OSM winter_sports way 972064114 centroid 41.17749, -74.51757 also checked.)
 * - Elev: Wikipedia — top 1,490 ft, base 449 ft
 *
 * Camelback
 * - Coords: Wikipedia — 41.05139, -75.35528
 *   https://en.wikipedia.org/wiki/Camelback_Mountain_Resort
 *   (OSM winter_sports way 52067284 centroid 41.04916, -75.35043 also checked.)
 * - Elev: Wikipedia — top 2,133 ft, vertical 800 ft → base 1,333 ft
 *
 * Blue Mountain (PA)
 * - Coords: Wikipedia — 40.82222, -75.51333
 *   https://en.wikipedia.org/wiki/Blue_Mountain_Resort
 *   (OSM winter_sports way 390536570 centroid 40.81666, -75.50979 also checked.)
 * - Elev: Wikipedia infobox — top 1,540 ft, base 458 ft
 *   (Body text cites a conflicting 1,407 ft summit; infobox + OSM used.)
 *
 * Mount Snow
 * - Coords: OpenStreetMap peak node 356555273 — 42.9592534, -72.9237615
 *   (matches Wikipedia 42.959, -72.922)
 * - Elev: Wikipedia — top 3,600 ft, base 1,900 ft
 *   https://en.wikipedia.org/wiki/Mount_Snow
 *
 * Stratton
 * - Coords: OpenStreetMap way 1367311040 (winter_sports) — 43.1026647, -72.9048371
 * - Elev: stratton.com mountain statistics — summit 3,875 ft, vertical 2,003 ft
 *   → base 1,872 ft
 *   https://www.stratton.com/the-mountain/mountain-statistics
 *
 * Killington
 * - Coords: Wikipedia resort — 43.626, -72.798
 *   https://en.wikipedia.org/wiki/Killington_Ski_Resort
 *   (OSM winter_sports way 1228774360 centroid 43.61120, -72.79259 also checked.)
 * - Elev: Wikipedia / Killington mountain stats — top 4,241 ft, base 1,165 ft
 *
 * Big Snow American Dream (indoor)
 * - Coords: Wikipedia — 40.81111, -74.07000
 *   https://en.wikipedia.org/wiki/Big_Snow_American_Dream
 *   (OSM way 755762044 40.81036, -74.07023 also checked.)
 * - Elev: PeakRankings top elev 446 ft; Wikipedia vertical 160 ft → base 286 ft
 *   https://www.peakrankings.com/content/big-snow-american-dream
 *   Scoring skips indoor mountains; elevations are for map/context only.
 *
 * Added with the pass filter (checked 2026-09-29). Indy summit/base figures
 * are from each resort's Indy Pass page (indyskipass.com/our-resorts/<slug>)
 * and match Wikipedia.
 *
 * Shawnee Mountain (PA)
 * - Coords: Wikipedia — 41.04083, -75.08333
 *   https://en.wikipedia.org/wiki/Shawnee_Mountain_Ski_Area
 *   (OSM Summit Lodge way 280049911 41.03384, -75.07247 also checked.)
 * - Elev: Indy Pass — summit 1,350 ft, base 650 ft (vertical 700 ft)
 *
 * Bear Creek Mountain Resort (PA)
 * - Coords: OSM landuse=winter_sports way 281594168 — 40.47467, -75.62947
 *   (Wikipedia 40.47611, -75.62583 also checked.)
 * - Elev: Indy Pass / Wikipedia — summit 1,100 ft, base 590 ft
 * - Site: bcmr.com now redirects to bcmountainresort.com
 *
 * Montage Mountain (PA)
 * - Coords: Wikipedia — 41.3533, -75.6592
 *   https://en.wikipedia.org/wiki/Montage_Mountain_Ski_Resort
 * - Elev: Indy Pass / Wikipedia — summit 1,960 ft, base 960 ft
 *
 * Catamount Mountain Resort (MA/NY border)
 * - Coords: Wikipedia — 42.171457, -73.477764
 *   https://en.wikipedia.org/wiki/Catamount_Mountain_Resort
 *   (OSM winter_sports way 1176086204 42.16559, -73.47729 also checked.)
 * - Elev: Indy Pass — summit 2,000 ft, base 1,000 ft
 *
 * Mohawk Mountain (CT)
 * - Coords: OSM landuse=winter_sports way 68519530 — 41.83562, -73.3113
 *   (Wikipedia 41.83675, -73.31342 also checked.)
 * - Elev: Indy Pass — summit 1,600 ft, base 950 ft
 *
 * Magic Mountain (VT)
 * - Coords: OSM landuse=winter_sports way 452295412 — 43.19548, -72.76402
 *   (Wikipedia 43.19278, -72.76 also checked.)
 * - Elev: Indy Pass / Wikipedia — summit 2,850 ft, base 1,350 ft
 *
 * Jack Frost and Big Boulder (PA): Epic lists them as two resorts, so two rows.
 * - Elev: jfbb.com mountain info — Jack Frost 2,000 / 1,400 ft,
 *   Big Boulder 2,175 / 1,700 ft
 *   https://www.jfbb.com/the-mountain/about-the-mountain/mountain-info.aspx
 * - Coords: OSM Jack Frost Mountain Resort way 390163427 — 41.11036, -75.65192;
 *   OSM Big Boulder chair lift way 96610192 — 41.04665, -75.59976
 *
 * Okemo (VT)
 * - Coords: Wikipedia — 43.40139, -72.71667 (matches OSM resort node 1556607603)
 *   https://en.wikipedia.org/wiki/Okemo_Mountain
 * - Elev: okemo.com mountain info — summit 3,344 ft, base 1,144 ft
 *   https://www.okemo.com/the-mountain/about-the-mountain/mountain-info.aspx
 *
 * Jiminy Peak (MA)
 * - Coords: Wikipedia — 42.55083, -73.29083
 *   https://en.wikipedia.org/wiki/Jiminy_Peak_(ski_area)
 *   (OSM resort node 2615263418 42.55481, -73.28933 also checked.)
 * - Elev: Wikipedia — summit 2,375 ft, base 1,245 ft (not on the resort site)
 */

import type { SkiPass } from "@/lib/passes/config";

export type MountainSeed = {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  summitElevFt: number;
  baseElevFt: number;
  isIndoor: boolean;
  websiteUrl: string;
  driveNote: string;
  active: boolean;
};

export const MOUNTAIN_SEEDS: MountainSeed[] = [
  {
    slug: "hunter",
    name: "Hunter Mountain",
    state: "NY",
    lat: 42.20056,
    lon: -74.23083,
    summitElevFt: 3200,
    baseElevFt: 1600,
    isIndoor: false,
    websiteUrl: "https://www.huntermtn.com",
    driveNote: "About 2.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "windham",
    name: "Windham Mountain",
    state: "NY",
    lat: 42.2939257,
    lon: -74.2613118,
    summitElevFt: 3100,
    baseElevFt: 1500,
    isIndoor: false,
    websiteUrl: "https://www.windhammountain.com",
    driveNote: "About 2.5–3 hrs from Midtown",
    active: true,
  },
  {
    slug: "belleayre",
    name: "Belleayre Mountain",
    state: "NY",
    lat: 42.1422139,
    lon: -74.510778,
    summitElevFt: 3429,
    baseElevFt: 2025,
    isIndoor: false,
    websiteUrl: "https://www.belleayre.com",
    driveNote: "About 2.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "mountain-creek",
    name: "Mountain Creek",
    state: "NJ",
    lat: 41.181,
    lon: -74.513,
    summitElevFt: 1490,
    baseElevFt: 449,
    isIndoor: false,
    websiteUrl: "https://www.mountaincreek.com",
    driveNote: "About 1–1.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "camelback",
    name: "Camelback Mountain",
    state: "PA",
    lat: 41.05139,
    lon: -75.35528,
    summitElevFt: 2133,
    baseElevFt: 1333,
    isIndoor: false,
    websiteUrl: "https://www.camelbackresort.com",
    driveNote: "About 1.5–2 hrs from Midtown",
    active: true,
  },
  {
    slug: "blue-mountain",
    name: "Blue Mountain",
    state: "PA",
    lat: 40.82222,
    lon: -75.51333,
    summitElevFt: 1540,
    baseElevFt: 458,
    isIndoor: false,
    websiteUrl: "https://www.skibluemt.com",
    driveNote: "About 1.5–2 hrs from Midtown",
    active: true,
  },
  {
    slug: "mount-snow",
    name: "Mount Snow",
    state: "VT",
    lat: 42.9592534,
    lon: -72.9237615,
    summitElevFt: 3600,
    baseElevFt: 1900,
    isIndoor: false,
    websiteUrl: "https://www.mountsnow.com",
    driveNote: "About 3.5–4 hrs from Midtown",
    active: true,
  },
  {
    slug: "stratton",
    name: "Stratton Mountain",
    state: "VT",
    lat: 43.1026647,
    lon: -72.9048371,
    summitElevFt: 3875,
    baseElevFt: 1872,
    isIndoor: false,
    websiteUrl: "https://www.stratton.com",
    driveNote: "About 4 hrs from Midtown",
    active: true,
  },
  {
    slug: "killington",
    name: "Killington",
    state: "VT",
    lat: 43.626,
    lon: -72.798,
    summitElevFt: 4241,
    baseElevFt: 1165,
    isIndoor: false,
    websiteUrl: "https://www.killington.com",
    driveNote: "About 4–4.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "big-snow",
    name: "Big Snow American Dream",
    state: "NJ",
    lat: 40.81111,
    lon: -74.07,
    summitElevFt: 446,
    baseElevFt: 286,
    isIndoor: true,
    websiteUrl: "https://www.bigsnowamericandream.com",
    driveNote: "About 30–45 min from Midtown",
    active: true,
  },
  {
    slug: "shawnee",
    name: "Shawnee Mountain",
    state: "PA",
    lat: 41.04083,
    lon: -75.08333,
    summitElevFt: 1350,
    baseElevFt: 650,
    isIndoor: false,
    websiteUrl: "https://www.shawneemt.com",
    driveNote: "About 1.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "bear-creek",
    name: "Bear Creek Mountain Resort",
    state: "PA",
    lat: 40.47467,
    lon: -75.62947,
    summitElevFt: 1100,
    baseElevFt: 590,
    isIndoor: false,
    websiteUrl: "https://www.bcmountainresort.com",
    driveNote: "About 2 hrs from Midtown",
    active: true,
  },
  {
    slug: "montage",
    name: "Montage Mountain",
    state: "PA",
    lat: 41.3533,
    lon: -75.6592,
    summitElevFt: 1960,
    baseElevFt: 960,
    isIndoor: false,
    websiteUrl: "https://www.montagemountainresorts.com",
    driveNote: "About 2 hrs from Midtown",
    active: true,
  },
  {
    slug: "catamount",
    name: "Catamount Mountain Resort",
    state: "MA/NY",
    lat: 42.171457,
    lon: -73.477764,
    summitElevFt: 2000,
    baseElevFt: 1000,
    isIndoor: false,
    websiteUrl: "https://catamountski.com",
    driveNote: "About 2.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "mohawk",
    name: "Mohawk Mountain",
    state: "CT",
    lat: 41.83562,
    lon: -73.3113,
    summitElevFt: 1600,
    baseElevFt: 950,
    isIndoor: false,
    websiteUrl: "https://www.mohawkmtn.com",
    driveNote: "About 2–2.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "magic",
    name: "Magic Mountain",
    state: "VT",
    lat: 43.19548,
    lon: -72.76402,
    summitElevFt: 2850,
    baseElevFt: 1350,
    isIndoor: false,
    websiteUrl: "https://www.magicmtn.com",
    driveNote: "About 4 hrs from Midtown",
    active: true,
  },
  {
    slug: "jack-frost",
    name: "Jack Frost",
    state: "PA",
    lat: 41.11036,
    lon: -75.65192,
    summitElevFt: 2000,
    baseElevFt: 1400,
    isIndoor: false,
    websiteUrl: "https://www.jfbb.com",
    driveNote: "About 2 hrs from Midtown",
    active: true,
  },
  {
    slug: "big-boulder",
    name: "Big Boulder",
    state: "PA",
    lat: 41.04665,
    lon: -75.59976,
    summitElevFt: 2175,
    baseElevFt: 1700,
    isIndoor: false,
    websiteUrl: "https://www.jfbb.com",
    driveNote: "About 2 hrs from Midtown",
    active: true,
  },
  {
    slug: "okemo",
    name: "Okemo",
    state: "VT",
    lat: 43.40139,
    lon: -72.71667,
    summitElevFt: 3344,
    baseElevFt: 1144,
    isIndoor: false,
    websiteUrl: "https://www.okemo.com",
    driveNote: "About 4.5 hrs from Midtown",
    active: true,
  },
  {
    slug: "jiminy-peak",
    name: "Jiminy Peak",
    state: "MA",
    lat: 42.55083,
    lon: -73.29083,
    summitElevFt: 2375,
    baseElevFt: 1245,
    isIndoor: false,
    websiteUrl: "https://www.jiminypeak.com",
    driveNote: "About 3.5 hrs from Midtown",
    active: true,
  },
];

export const PASS_SEED_SEASON = "2026-27";
export const PASS_SEED_VERIFIED_AT = "2026-09-29";

export type PassSeed = {
  slug: string;
  pass: SkiPass;
  tierNote: string;
  sourceUrl: string;
};

const EPIC_SOURCE = "https://www.epicpass.com/passes/epic-pass.aspx";
const IKON_SOURCE = "https://www.ikonpass.com/en/compare-passes";
const IKON_BONUS_SOURCE = "https://www.ikonpass.com/en/benefits/bonus-mountains";
const INDY_NOTE = "2 days per season";
const indySource = (resortSlug: string) =>
  `https://www.indyskipass.com/our-resorts/${resortSlug}`;

/**
 * 2026-27 pass access, verified 2026-09-29 against the official pass sites.
 * Mountains with no rows here are "No major pass": windham, belleayre,
 * mountain-creek, big-snow (none appear on the Epic, Ikon or Indy lists).
 *
 * - Epic: epicpass.com Epic Pass "Resort Access ... 2026/27 season" lists
 *   Hunter, Mount Snow, Okemo, Jack Frost and Big Boulder (separately).
 * - Ikon: ikonpass.com "Compare 26/27 Ikon Pass Access" table. Killington-Pico
 *   days are combined across both mountains. Blue Mountain Resort, PA is on
 *   26/27 Ikon (the ikonpass.com "blue-mountain" page is Blue Mountain, Ontario).
 *   Jiminy Peak is on the 26/27 Bonus Mountains list (full Ikon Pass only,
 *   with blackout dates).
 * - Indy: each resort is listed on indyskipass.com/our-resorts. The resort
 *   pages don't print a season label, and Mohawk, Montage and Shawnee show
 *   blackout dates for the base Indy Pass.
 */
export const PASS_SEEDS: PassSeed[] = [
  { slug: "hunter", pass: "epic", tierNote: "Epic Pass: unlimited", sourceUrl: EPIC_SOURCE },
  { slug: "mount-snow", pass: "epic", tierNote: "Epic Pass: unlimited", sourceUrl: EPIC_SOURCE },
  { slug: "okemo", pass: "epic", tierNote: "Epic Pass: unlimited", sourceUrl: EPIC_SOURCE },
  { slug: "jack-frost", pass: "epic", tierNote: "Epic Pass: unlimited", sourceUrl: EPIC_SOURCE },
  { slug: "big-boulder", pass: "epic", tierNote: "Epic Pass: unlimited", sourceUrl: EPIC_SOURCE },
  { slug: "killington", pass: "ikon", tierNote: "Ikon: 7 days, Base: 5 days", sourceUrl: IKON_SOURCE },
  { slug: "stratton", pass: "ikon", tierNote: "Ikon: unlimited, Base: unlimited with blackouts", sourceUrl: IKON_SOURCE },
  { slug: "camelback", pass: "ikon", tierNote: "Ikon: 7 days, Base: 5 days", sourceUrl: IKON_SOURCE },
  { slug: "blue-mountain", pass: "ikon", tierNote: "Ikon: 7 days, Base: 5 days", sourceUrl: IKON_SOURCE },
  { slug: "jiminy-peak", pass: "ikon", tierNote: "Bonus mountain: 2 days, full Ikon Pass only", sourceUrl: IKON_BONUS_SOURCE },
  { slug: "shawnee", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("shawnee-mountain-ski-area") },
  { slug: "bear-creek", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("bear-creek") },
  { slug: "montage", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("montage-mountain") },
  { slug: "catamount", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("catamount-mountain-resort") },
  { slug: "mohawk", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("mohawk-mountain") },
  { slug: "magic", pass: "indy", tierNote: INDY_NOTE, sourceUrl: indySource("magic-mountain") },
];
