import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  serial,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

/** LINE users who have chatted with the OA */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  lineUserId: text("line_user_id").notNull().unique(),
  displayName: text("display_name"),
  language: text("language").default("th"),
  ...timestamps,
});

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    lineUserId: text("line_user_id").notNull(),
    status: text("status").default("active").notNull(), // active | resolved | handoff
    lastIntent: text("last_intent"),
    summary: text("summary"),
    humanHandoff: boolean("human_handoff").default(false).notNull(),
    ...timestamps,
  },
  (t) => [index("conversations_line_user_idx").on(t.lineUserId)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull(),
    role: text("role").notNull(), // user | assistant | system
    content: text("content").notNull(),
    intent: text("intent"),
    ...timestamps,
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    lineUserId: text("line_user_id").notNull(),
    displayName: text("display_name"),
    language: text("language"),
    checkIn: text("check_in"),
    checkOut: text("check_out"),
    adults: integer("adults"),
    children: integer("children"),
    roomType: text("room_type"),
    rooms: integer("rooms"),
    budget: text("budget"),
    specialRequest: text("special_request"),
    intent: text("intent"),
    leadScore: text("lead_score").default("COLD").notNull(), // HOT | WARM | COLD
    status: text("status").default("New").notNull(),
    // New | Contacted | Interested | Booking Link Sent | Booking Confirmed | Lost | Closed
    source: text("source").default("line"),
    campaign: text("campaign"),
    promotion: text("promotion"),
    bookingLinkClicked: boolean("booking_link_clicked").default(false).notNull(),
    humanHandoff: boolean("human_handoff").default(false).notNull(),
    ...timestamps,
  },
  (t) => [index("leads_line_user_idx").on(t.lineUserId)],
);

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  roomType: text("room_type"),
  rate: text("rate"),
  currency: text("currency").default("THB").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  bookingStart: text("booking_start"),
  bookingEnd: text("booking_end"),
  stayStart: text("stay_start"),
  stayEnd: text("stay_end"),
  terms: text("terms"),
  status: text("status").default("draft").notNull(), // draft | active | expired | archived
  priority: integer("priority").default(0).notNull(),
  bookingUrl: text("booking_url"),
  ...timestamps,
});

export const knowledgeBase = pgTable(
  "knowledge_base",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    language: text("language").default("th").notNull(),
    status: text("status").default("published").notNull(), // draft | published
    priority: integer("priority").default(0).notNull(),
    ...timestamps,
  },
  (t) => [index("kb_category_idx").on(t.category)],
);

export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  lineUserId: text("line_user_id").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  adults: integer("adults"),
  children: integer("children"),
  roomType: text("room_type"),
  rooms: integer("rooms"),
  status: text("status").default("new").notNull(),
  ...timestamps,
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    lineUserId: text("line_user_id"),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (t) => [index("events_name_idx").on(t.name)],
);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin").notNull(),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminUser: text("admin_user").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  ...timestamps,
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  ...timestamps,
});
