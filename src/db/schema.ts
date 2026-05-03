import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const date = (name: string) => integer(name, { mode: "timestamp_ms" });

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: date("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: date("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: date("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: date("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: date("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: date("accessTokenExpiresAt"),
    refreshTokenExpiresAt: date("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: date("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: date("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: date("expiresAt").notNull(),
    createdAt: date("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: date("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const todos = sqliteTable(
  "todos",
  {
    id: integer({ mode: "number" }).primaryKey({
      autoIncrement: true,
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text().notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("todos_user_id_idx").on(table.userId)],
);
