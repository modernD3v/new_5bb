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
 */

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
];
