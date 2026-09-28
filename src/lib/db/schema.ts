import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const homeBoroughEnum = pgEnum("home_borough", [
  "manhattan",
  "brooklyn",
  "queens",
  "bronx",
  "staten_island",
]);

export const userRoleEnum = pgEnum("user_role", ["member", "admin"]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "post",
  "comment",
  "ride",
]);

export const reportStatusEnum = pgEnum("report_status", ["open", "resolved"]);

export const rideStatusEnum = pgEnum("ride_status", [
  "open",
  "full",
  "cancelled",
]);

export const rideRequestStatusEnum = pgEnum("ride_request_status", [
  "pending",
  "accepted",
  "declined",
]);

export const subscriberSourceEnum = pgEnum("subscriber_source", [
  "join_page",
  "checkout",
  "footer",
]);

// --- Auth.js tables (extended users) ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  handle: text("handle").unique(),
  homeBorough: homeBoroughEnum("home_borough"),
  instagramHandle: text("instagram_handle"),
  role: userRoleEnum("role").default("member").notNull(),
  banned: boolean("banned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// --- App tables ---

export const mountains = pgTable("mountains", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  summitElevFt: integer("summit_elev_ft").notNull(),
  baseElevFt: integer("base_elev_ft").notNull(),
  isIndoor: boolean("is_indoor").default(false).notNull(),
  websiteUrl: text("website_url"),
  driveNote: text("drive_note"),
  active: boolean("active").default(true).notNull(),
});

export const refreshLocks = pgTable("refresh_locks", {
  key: text("key").primaryKey(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }).notNull(),
});

export const scoreSnapshots = pgTable(
  "score_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mountainId: uuid("mountain_id")
      .notNull()
      .references(() => mountains.id, { onDelete: "cascade" }),
    weekendStart: date("weekend_start").notNull(),
    score: integer("score"),
    label: text("label").notNull(),
    reasons: jsonb("reasons").$type<string[]>().notNull().default([]),
    forecast: jsonb("forecast").$type<Record<string, unknown>>().notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("score_snapshots_mountain_weekend_uidx").on(
      t.mountainId,
      t.weekendStart,
    ),
  ],
);

export const checkins = pgTable(
  "checkins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mountainId: uuid("mountain_id")
      .notNull()
      .references(() => mountains.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("checkins_user_mountain_date_uidx").on(
      t.userId,
      t.mountainId,
      t.date,
    ),
  ],
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mountainId: uuid("mountain_id").references(() => mountains.id, {
    onDelete: "set null",
  }),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  hidden: boolean("hidden").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  hidden: boolean("hidden").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  mountainId: uuid("mountain_id").references(() => mountains.id, {
    onDelete: "set null",
  }),
  locationText: text("location_text"),
  partifulUrl: text("partiful_url"),
  imageUrl: text("image_url"),
  description: text("description"),
  published: boolean("published").default(false).notNull(),
});

export const rideOffers = pgTable("ride_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mountainId: uuid("mountain_id")
    .notNull()
    .references(() => mountains.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  departBorough: homeBoroughEnum("depart_borough").notNull(),
  departArea: text("depart_area").notNull(),
  departTime: text("depart_time").notNull(),
  seatsTotal: integer("seats_total").notNull(),
  costPerSeatCents: integer("cost_per_seat_cents").notNull(),
  hasBoardSpace: boolean("has_board_space").default(true).notNull(),
  notes: text("notes"),
  status: rideStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const rideRequests = pgTable(
  "ride_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rideId: uuid("ride_id")
      .notNull()
      .references(() => rideOffers.id, { onDelete: "cascade" }),
    riderId: uuid("rider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: rideRequestStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("ride_requests_ride_rider_uidx").on(t.rideId, t.riderId),
  ],
);

export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  homeBorough: homeBoroughEnum("home_borough"),
  source: subscriberSourceEnum("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  stripePriceId: text("stripe_price_id"),
  active: boolean("active").default(false).notNull(),
  dropAt: timestamp("drop_at", { withTimezone: true }),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  email: text("email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull(),
  lineItems: jsonb("line_items").$type<Record<string, unknown>[]>().notNull(),
  shipping: jsonb("shipping").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
