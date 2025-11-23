import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import type { Cart } from "@/types/storefront";
import { storefrontCartService } from "./cart.service";
import { storefrontCartRepository } from "../repositories/cart.repository";
import { auth } from "@/auth";
import { notificationsService } from "../../services/notifications.service";
import { emailsService } from "../../services/emails.service";

export interface PlaceOrderInput {
  cartId: string;
  shippingAddress: any;
  shippingMethod: { id: string; name: string; price: number; description?: string; estimatedDays?: number; carrier?: string };
  paymentMethod: { type: string; [k: string]: any };
  customerEmail?: string;
  customerPhone?: string;
}

export class StorefrontCheckoutService {
  async placeOrder(input: PlaceOrderInput) {
    // Load cart
    const cart = await storefrontCartService.getCart(input.cartId);
    if (!cart) throw new Error("Cart not found");
    if (cart.items.length === 0) throw new Error("Cart is empty");

    const shippingAmount = input.shippingMethod?.price || 0;
    const subtotal = cart.subtotal;
    const taxAmount = cart.taxAmount;

    // Re-evaluate automatic discount and enforce usageLimit
    let discountAmount = 0;
    let appliedDiscount: { id: string; name: string } | null = null;
    try {
      const auto = await storefrontCartRepository.computeAutomaticDiscount(input.cartId);
      if (auto.amount > 0 && auto.applied?.id) {
        // Check usage limit
        const [disc] = await db
          .select()
          .from(schema.discounts)
          .where(eq(schema.discounts.id, auto.applied.id))
          .limit(1);
        const limit = (disc as any)?.usageLimit as number | null;
        const used = Number((disc as any)?.usageCount || 0);
        if (limit == null || used < limit) {
          discountAmount = Number(auto.amount || 0);
          appliedDiscount = { id: auto.applied.id, name: auto.applied.name };
        }
      }
    } catch {
      // ignore discount evaluation errors at checkout time
    }

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    const orderNumber = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Get authenticated user (if any)
    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    // Insert order
    const normalizePaymentMethod = (raw: string | undefined): any => {
      const t = (raw || "card").toString().toLowerCase();
      switch (t) {
        case "credit_card":
        case "card":
          return "credit_card";
        case "debit":
        case "debit_card":
          return "debit_card";
        case "paypal":
          return "paypal";
        case "stripe":
          return "stripe";
        case "cod":
        case "cash_on_delivery":
          return "cash_on_delivery";
        case "bank":
        case "bank_transfer":
          return "bank_transfer";
        default:
          return "credit_card";
      }
    };

    const [order] = await db
      .insert(schema.orders)
      .values({
        orderNumber,
        status: "pending" as any,
        paymentStatus: "pending" as any,
        paymentMethod: normalizePaymentMethod(input.paymentMethod?.type),
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: "USD",
        customerEmail: input.customerEmail || (session as any)?.user?.email || null,
        customerPhone: input.customerPhone || (input as any)?.shippingAddress?.phone || null,
        userId: userId || null,
      })
      .returning();

    // Snapshot shipping address for this order (works for guests and users)
    if (order && (input as any).shippingAddress) {
      const a: any = (input as any).shippingAddress;
      try {
        await db.insert(schema.orderShippingAddresses).values({
          orderId: order.id,
          firstName: a.firstName,
          lastName: a.lastName,
          company: a.company ?? null,
          addressLine1: a.addressLine1,
          addressLine2: a.addressLine2 ?? null,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country,
          phone: a.phone,
          email: (input.customerEmail as any) || (session as any)?.user?.email || null,
        } as any);
      } catch {
        // non-blocking in case migration not yet applied
      }
    }

    // Insert order items
    if (order) {
      for (const item of cart.items) {
        await db.insert(schema.orderItems).values({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId || null,
          productName: item.productName,
          variantName: item.variantName || null,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: item.totalPrice.toFixed(2),
          taxAmount: "0.00",
          discountAmount: "0.00",
        });
      }
    }

    // Persist applied discount snapshot and update usage counter
    if (order && appliedDiscount && discountAmount > 0) {
      try {
        await db.insert(schema.orderDiscounts).values({
          orderId: order.id,
          discountId: appliedDiscount.id,
          code: null,
          amount: discountAmount.toFixed(2),
        });
        // Increment usageCount (best-effort)
        await db
          .update(schema.discounts)
          .set({ usageCount: (schema.discounts.usageCount as any) + 1 } as any)
          .where(eq(schema.discounts.id, appliedDiscount.id));
      } catch {}
    }

    // Optional: create a shipment row linked to a shipping method table when available
    if (order) {
      try {
        const shipDays = typeof input.shippingMethod?.estimatedDays === "number" ? input.shippingMethod.estimatedDays : 5;
        const est = new Date();
        est.setDate(est.getDate() + Math.ceil(shipDays));
        const [shipment] = await db.insert(schema.shipments).values({
          orderId: order.id,
          shippingMethodId: (input.shippingMethod?.id as any) || null,
          carrier: input.shippingMethod?.carrier || null,
          status: "pending" as any,
          estimatedDeliveryAt: est,
        }).returning();

        // initial tracking update
        if (shipment) {
          await db.insert(schema.trackingUpdates).values({
            shipmentId: shipment.id,
            status: "Order placed",
            description: "Your order has been received and is being processed.",
            occurredAt: new Date(),
          });
        }
      } catch {
        // non-blocking
      }
    }

    // Notify user (if logged in)
    try {
      if (userId && order) {
        await notificationsService.create(
          {
            userId,
            type: "order_created" as any,
            title: "Order placed",
            message: `Your order ${orderNumber} has been placed successfully`,
            actionUrl: `/account/orders/${order.id}`,
          },
          { userId },
        );
      }
    } catch {}

    try {
      if (order) {
        const to = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_USER || process.env.EMAIL_FROM || "";
        if (to) {
          await emailsService.send({
            to,
            subject: `New order ${orderNumber}`,
            html: `<div><p>New order <strong>${orderNumber}</strong> has been placed.</p><p>Total: <strong>${totalAmount.toFixed(2)} USD</strong></p></div>`,
            metadata: { orderId: order.id, orderNumber },
          });
        }
      }
    } catch {}

    // Clear cart after successful order
    await storefrontCartService.clearCart(input.cartId);

    return { id: order.id, orderNumber };
  }
}

export const storefrontCheckoutService = new StorefrontCheckoutService();
