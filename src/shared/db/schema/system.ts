import { pgTable, varchar, text, timestamp, uuid, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { auditActionEnum, backupStatusEnum, healthCheckStatusEnum } from "../enums";
import { users } from "./users";

// ==================== SYSTEM SETTINGS ====================
export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: text("value").notNull(),
    type: varchar("type", { length: 50 }).default("string").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: index("system_settings_key_idx").on(table.key),
    isPublicIdx: index("system_settings_is_public_idx").on(table.isPublic),
  }),
);

// ==================== AUDIT LOGS ====================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: uuid("resource_id"),
    changes: jsonb("changes").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    resourceIdx: index("audit_logs_resource_idx").on(table.resource),
    resourceIdIdx: index("audit_logs_resource_id_idx").on(table.resourceId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  }),
);

// ==================== BACKUPS ====================
export const backups = pgTable(
  "backups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size").notNull(),
    status: backupStatusEnum("status").default("pending").notNull(),
    type: varchar("type", { length: 50 }).default("manual").notNull(),
    error: text("error"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdBy: uuid("created_by").references(() => users.id),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("backups_status_idx").on(table.status),
    typeIdx: index("backups_type_idx").on(table.type),
    createdAtIdx: index("backups_created_at_idx").on(table.createdAt),
  }),
);

// ==================== HEALTH CHECKS ====================
export const healthChecks = pgTable(
  "health_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    service: varchar("service", { length: 100 }).notNull(),
    status: healthCheckStatusEnum("status").default("healthy").notNull(),
    responseTime: integer("response_time"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    error: text("error"),
    checkedAt: timestamp("checked_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    serviceIdx: index("health_checks_service_idx").on(table.service),
    statusIdx: index("health_checks_status_idx").on(table.status),
    checkedAtIdx: index("health_checks_checked_at_idx").on(table.checkedAt),
  }),
);
