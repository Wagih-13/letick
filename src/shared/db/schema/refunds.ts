import { pgTable, varchar, text, timestamp, uuid, decimal, integer, index } from "drizzle-orm/pg-core";
import { refundStatusEnum } from "../enums";
import { orders, orderItems } from "./orders";
import { payments } from "./payments";
import { users } from "./users";

// ==================== REFUNDS ====================
export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    status: refundStatusEnum("status").default("pending").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    reason: text("reason"),
    approvedBy: uuid("approved_by").references(() => users.id),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("refunds_order_id_idx").on(table.orderId),
    paymentIdIdx: index("refunds_payment_id_idx").on(table.paymentId),
    statusIdx: index("refunds_status_idx").on(table.status),
  }),
);

// ==================== REFUND ITEMS ====================
export const refundItems = pgTable(
  "refund_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    refundId: uuid("refund_id").notNull().references(() => refunds.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    refundIdIdx: index("refund_items_refund_id_idx").on(table.refundId),
    orderItemIdIdx: index("refund_items_order_item_id_idx").on(table.orderItemId),
  }),
);
