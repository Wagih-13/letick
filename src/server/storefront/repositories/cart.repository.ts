import { db } from "@/shared/db";
import * as schema from "@/shared/db/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * Storefront Cart Repository
 * Handles data access for shopping cart operations
 */

export class StorefrontCartRepository {
  /**
   * Get or create cart for user or session
   */
  async getOrCreate(userId?: string, sessionId?: string) {
    // Validate userId against users table; if it doesn't exist, treat as guest
    let validUserId = userId;
    if (userId) {
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      if (!user) {
        validUserId = undefined;
      }
    }

    if (!validUserId && !sessionId) {
      throw new Error("Either userId or sessionId is required");
    }

    // Try to find existing cart
    let cart;
    if (validUserId) {
      [cart] = await db
        .select()
        .from(schema.carts)
        .where(
          and(
            eq(schema.carts.userId, validUserId),
            eq(schema.carts.status, "active")
          )
        )
        .limit(1);
    } else if (sessionId) {
      [cart] = await db
        .select()
        .from(schema.carts)
        .where(
          and(
            eq(schema.carts.sessionId, sessionId),
            eq(schema.carts.status, "active")
          )
        )
        .limit(1);
    }

    // Create new cart if not found
    if (!cart) {
      [cart] = await db
        .insert(schema.carts)
        .values({
          userId: validUserId || null,
          sessionId: sessionId || null,
          status: "active",
          subtotal: "0.00",
          taxAmount: "0.00",
          shippingAmount: "0.00",
          discountAmount: "0.00",
          totalAmount: "0.00",
        })
        .returning();
    }

    return cart;
  }

  /**
   * Get cart with items
   */
  async getWithItems(cartId: string) {
    const [cart] = await db
      .select()
      .from(schema.carts)
      .where(eq(schema.carts.id, cartId))
      .limit(1);

    if (!cart) {
      return null;
    }

    const items = await db
      .select({
        id: schema.cartItems.id,
        productId: schema.cartItems.productId,
        variantId: schema.cartItems.variantId,
        productName: schema.cartItems.productName,
        variantName: schema.cartItems.variantName,
        sku: schema.cartItems.sku,
        quantity: schema.cartItems.quantity,
        unitPrice: schema.cartItems.unitPrice,
        totalPrice: schema.cartItems.totalPrice,
        image: sql<string>`coalesce(
          (
            select pv.image
            from ${schema.productVariants} pv
            where pv.id = ${schema.cartItems.variantId}
            limit 1
          ),
          (
            select pi.url
            from ${schema.productImages} pi
            where pi.product_id = ${schema.cartItems.productId}
            order by pi.is_primary desc, pi.sort_order asc
            limit 1
          ),
          (
            select pv2.image
            from ${schema.productVariants} pv2
            where pv2.product_id = ${schema.cartItems.productId} and pv2.is_active = true and pv2.image is not null
            order by pv2.sort_order asc
            limit 1
          )
        )`,
        maxQuantity: sql<number>`(
          case
            when ${schema.cartItems.variantId} is not null then
              coalesce((
                select pv.stock_quantity
                from ${schema.productVariants} pv
                where pv.id = ${schema.cartItems.variantId}
              ), 0)
            else
              coalesce((
                select sum(inv.available_quantity)::int
                from ${schema.inventory} inv
                where inv.product_id = ${schema.cartItems.productId}
              ), 0)
          end
        )`,
      })
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, cartId))
      .orderBy(schema.cartItems.createdAt);

    return {
      ...cart,
      items,
    };
  }

  /**
   * Add item to cart
   */
  async addItem(params: {
    cartId: string;
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }) {
    const totalPrice = params.unitPrice * params.quantity;

    // Check if item already exists
    const existingItem = await db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.cartId, params.cartId),
          eq(schema.cartItems.productId, params.productId),
          params.variantId
            ? eq(schema.cartItems.variantId, params.variantId)
            : sql`${schema.cartItems.variantId} is null`
        )
      )
      .limit(1);

    let item;
    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + params.quantity;
      [item] = await db
        .update(schema.cartItems)
        .set({
          quantity: newQuantity,
          totalPrice: (params.unitPrice * newQuantity).toFixed(2),
        })
        .where(eq(schema.cartItems.id, existingItem[0].id))
        .returning();
    } else {
      // Insert new item
      [item] = await db
        .insert(schema.cartItems)
        .values({
          cartId: params.cartId,
          productId: params.productId,
          variantId: params.variantId || null,
          productName: params.productName,
          variantName: params.variantName || null,
          sku: params.sku,
          quantity: params.quantity,
          unitPrice: params.unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        })
        .returning();
    }

    // Recalculate cart totals
    await this.recalculateTotals(params.cartId);

    return item;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    const [item] = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.id, itemId))
      .limit(1);

    if (!item) {
      throw new Error("Cart item not found");
    }

    const totalPrice = parseFloat(item.unitPrice) * quantity;

    await db
      .update(schema.cartItems)
      .set({
        quantity,
        totalPrice: totalPrice.toFixed(2),
      })
      .where(eq(schema.cartItems.id, itemId));

    // Recalculate cart totals
    await this.recalculateTotals(item.cartId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    const [item] = await db
      .select({ cartId: schema.cartItems.cartId })
      .from(schema.cartItems)
      .where(eq(schema.cartItems.id, itemId))
      .limit(1);

    if (!item) {
      throw new Error("Cart item not found");
    }

    await db.delete(schema.cartItems).where(eq(schema.cartItems.id, itemId));

    // Recalculate cart totals
    await this.recalculateTotals(item.cartId);
  }

  /**
   * Recalculate cart totals
   */
  async recalculateTotals(cartId: string) {
    const items = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, cartId));

    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice),
      0
    );

    // TODO: Calculate tax based on shipping address
    const taxAmount = 0;

    // TODO: Calculate shipping based on method selected
    const shippingAmount = 0;

    // Compute automatic discounts (no code)
    const auto = await this.computeAutomaticDiscount(cartId);
    const discountAmount = auto.amount;

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    await db
      .update(schema.carts)
      .set({
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(schema.carts.id, cartId));
  }

  /**
   * Compute automatic discount amount for a cart based on active discounts
   * Strategy: choose the single best automatic discount (no stacking)
   */
  async computeAutomaticDiscount(cartId: string): Promise<{ amount: number; applied?: { id: string; name: string; type: string; value: string; scope: string } }> {
    const now = new Date();
    // Load cart items with productId, quantity, unitPrice
    const items = await db
      .select({
        productId: schema.cartItems.productId,
        quantity: schema.cartItems.quantity,
        unitPrice: schema.cartItems.unitPrice,
      })
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, cartId));
    if (!items.length) return { amount: 0 };

    // Active automatic discounts
    const discounts = await db
      .select()
      .from(schema.discounts)
      .where(sql`${schema.discounts.isAutomatic} = true and ${schema.discounts.status} = 'active' and (${schema.discounts.startsAt} is null or ${schema.discounts.startsAt} <= ${now}) and (${schema.discounts.endsAt} is null or ${schema.discounts.endsAt} >= ${now})`);

    if (!discounts.length) return { amount: 0 };

    // Helper: get qualifying product ids for a discount
    const getQualifyingProductIds = async (disc: any): Promise<Set<string> | null> => {
      if (disc.scope === 'all') return null; // all products
      if (disc.scope === 'products') {
        const rows = await db.select({ pid: schema.discountProducts.productId }).from(schema.discountProducts).where(eq(schema.discountProducts.discountId, disc.id));
        return new Set(rows.map(r => r.pid));
      }
      if (disc.scope === 'categories') {
        const rows = await db.select({ cid: schema.discountCategories.categoryId }).from(schema.discountCategories).where(eq(schema.discountCategories.discountId, disc.id));
        const catIds = rows.map(r => r.cid);
        if (!catIds.length) return new Set<string>();
        const prodRows = await db.select({ pid: schema.productCategories.productId }).from(schema.productCategories).where(sql`${schema.productCategories.categoryId} in ${catIds}`);
        return new Set(prodRows.map(r => r.pid));
      }
      return new Set<string>();
    };

    const evaluateDiscount = async (disc: any): Promise<number> => {
      const valueNum = parseFloat(String(disc.value || '0'));
      const qualifying = await getQualifyingProductIds(disc);
      // Qualifying subtotal and qty
      let qSubtotal = 0;
      let qQty = 0;
      for (const it of items) {
        const qualifies = !qualifying || (it.productId ? qualifying.has(it.productId) : false);
        if (qualifies) {
          const unit = parseFloat(String(it.unitPrice));
          const qty = Number(it.quantity);
          qSubtotal += unit * qty;
          qQty += qty;
        }
      }
      if (qSubtotal <= 0) return 0;

      // Respect minSubtotal if set
      const minSubtotal = disc.minSubtotal ? parseFloat(String(disc.minSubtotal)) : 0;
      if (minSubtotal > 0 && qSubtotal < minSubtotal) return 0;

      // Bundle support via metadata.offerKind === 'bundle' with bundle.requiredQty
      const md: any = disc.metadata || null;
      if (md && md.offerKind === 'bundle' && md.bundle?.requiredQty) {
        if (qQty < Number(md.bundle.requiredQty)) return 0;
      }

      if (disc.type === 'percentage') {
        return (qSubtotal * valueNum) / 100;
      }
      if (disc.type === 'fixed_amount') {
        return Math.min(valueNum, qSubtotal);
      }
      if (disc.type === 'free_shipping') {
        // Shipping is currently 0 in totals; treat as 0 extra discount here
        return 0;
      }
      return 0;
    };

    let bestAmount = 0;
    let best: any = null;
    for (const d of discounts) {
      const amt = await evaluateDiscount(d);
      if (amt > bestAmount) {
        bestAmount = amt;
        best = d;
      }
    }

    if (best && bestAmount > 0) {
      return { amount: Number(bestAmount.toFixed(2)), applied: { id: best.id, name: best.name, type: best.type, value: String(best.value), scope: best.scope } };
    }
    return { amount: 0 };
  }

  /**
   * Merge guest cart into user cart on login
   */
  async mergeCart(guestCartId: string, userId?: string, sessionId?: string) {
    // Validate user; if invalid, return guest cart as-is to avoid FK violations
    let validUserId = userId;
    if (userId) {
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      if (!user) {
        validUserId = undefined;
      }
    }

    if (!validUserId) {
      const guest = await this.getWithItems(guestCartId);
      if (!guest) {
        throw new Error("Guest cart not found");
      }
      return guest;
    }

    // Get or create user cart (with session fallback available)
    const userCart = await this.getOrCreate(validUserId, sessionId);

    // If the cookie cart id equals the user's cart id, nothing to merge
    if (guestCartId === userCart.id) {
      return userCart;
    }

    // Get guest cart items
    const guestItems = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, guestCartId));

    // Move items to user cart
    for (const item of guestItems) {
      // Skip items with missing required data
      if (!item.productId || !item.sku) {
        continue;
      }

      await this.addItem({
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId || undefined,
        productName: item.productName,
        variantName: item.variantName || undefined,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
      });
    }

    // Delete guest cart
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, guestCartId));
    await db.delete(schema.carts).where(eq(schema.carts.id, guestCartId));

    return userCart;
  }

  /**
   * Clear cart
   */
  async clear(cartId: string) {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
    await this.recalculateTotals(cartId);
  }
}

export const storefrontCartRepository = new StorefrontCartRepository();
