import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

type OrderItemRow = {
  id: string;
  productId: string;
  variantId: string | null;
  productSlug: string | null;
  productName: string | null;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: any;
  totalPrice: any;
  variantImage: string | null;
  primaryImage: string | null;
};

type ShipmentRow = {
  id: string;
  status: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: any;
  estimatedDeliveryAt: any;
  deliveredAt: any;
  methodId: string | null;
  methodName: string | null;
  methodPrice: any;
};

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    let order;

    if (session?.user?.id) {
      // Authenticated: Resolve by orderNumber or UUID, must belong to user
      const orders = await db
        .select()
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.userId, session.user.id as any),
            or(eq(schema.orders.orderNumber, id), eq(schema.orders.id, id as any))
          )
        )
        .limit(1);
      order = orders[0];
    } else {
      // Guest: Resolve by UUID ONLY (to prevent enumeration), must be guest order (userId is null)
      // Validate UUID format to prevent SQL errors if id is not a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const orders = await db
          .select()
          .from(schema.orders)
          .where(and(eq(schema.orders.id, id as any), sql`${schema.orders.userId} IS NULL`))
          .limit(1);
        order = orders[0];
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: { message: "Order not found" } }, { status: 404 });
    }

    // Load items with images
    const items: OrderItemRow[] = await db
      .select({
        id: schema.orderItems.id,
        productId: schema.orderItems.productId,
        variantId: schema.orderItems.variantId,
        productSlug: schema.products.slug,
        productName: schema.orderItems.productName,
        variantName: schema.orderItems.variantName,
        sku: schema.orderItems.sku,
        quantity: schema.orderItems.quantity,
        unitPrice: schema.orderItems.unitPrice,
        totalPrice: schema.orderItems.totalPrice,
        variantImage: schema.productVariants.image,
        primaryImage: schema.productImages.url,
      })
      .from(schema.orderItems)
      .leftJoin(schema.productVariants, eq(schema.productVariants.id, schema.orderItems.variantId))
      .leftJoin(schema.products, eq(schema.products.id, schema.orderItems.productId))
      .leftJoin(
        schema.productImages,
        and(eq(schema.productImages.productId, schema.orderItems.productId), eq(schema.productImages.isPrimary, true))
      )
      .where(eq(schema.orderItems.orderId, order.id as any));

    // Load shipments + method
    const shipments: ShipmentRow[] = await db
      .select({
        id: schema.shipments.id,
        status: schema.shipments.status,
        trackingNumber: schema.shipments.trackingNumber,
        carrier: schema.shipments.carrier,
        shippedAt: schema.shipments.shippedAt,
        estimatedDeliveryAt: schema.shipments.estimatedDeliveryAt,
        deliveredAt: schema.shipments.deliveredAt,
        methodId: schema.shipments.shippingMethodId,
        methodName: schema.shippingMethods.name,
        methodPrice: schema.shippingMethods.price,
      })
      .from(schema.shipments)
      .leftJoin(schema.shippingMethods, eq(schema.shippingMethods.id, schema.shipments.shippingMethodId))
      .where(eq(schema.shipments.orderId, order.id as any));

    // Best-effort shipping address: fallback to user's default address
    let address: any = null;
    if (session?.user?.id) {
      const [addr] = await db
        .select()
        .from(schema.shippingAddresses)
        .where(and(eq(schema.shippingAddresses.userId, session.user.id as any), eq(schema.shippingAddresses.isDefault, true)))
        .limit(1);
      address = addr;
    }

    const payload = {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: parseFloat(order.subtotal as any),
      tax: parseFloat(order.taxAmount as any),
      shipping: parseFloat(order.shippingAmount as any),
      discount: parseFloat(order.discountAmount as any),
      total: parseFloat(order.totalAmount as any),
      items: items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productSlug: it.productSlug,
        name: it.productName,
        image: it.variantImage || it.primaryImage || "/placeholder-product.jpg",
        sku: it.sku,
        variant: it.variantName || null,
        quantity: it.quantity,
        price: parseFloat(it.unitPrice as any),
        total: parseFloat(it.totalPrice as any),
      })),
      shipments: shipments.map((s) => ({
        id: s.id,
        status: s.status,
        trackingNumber: s.trackingNumber,
        carrier: s.carrier,
        shippedAt: s.shippedAt,
        estimatedDeliveryAt: s.estimatedDeliveryAt,
        deliveredAt: s.deliveredAt,
        methodName: s.methodName,
        methodPrice: s.methodPrice,
      })),
      shippingAddress: address
        ? {
          name: `${address.firstName} ${address.lastName}`.trim(),
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        }
        : null,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { message: e?.message || "Failed to load order" } },
      { status: 500 }
    );
  }
}
