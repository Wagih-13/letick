import { NextRequest, NextResponse } from "next/server";
import { storefrontCartService } from "../services/cart.service";
import { auth } from "@/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

/**
 * Storefront Cart Controller
 * Handles HTTP requests for cart endpoints
 */

const addItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const removeItemSchema = z.object({
  itemId: z.string().uuid(),
});

const applyDiscountSchema = z.object({
  code: z.string().min(1),
});

export class StorefrontCartController {
  /**
   * GET /api/storefront/cart
   * Get or create cart
   */
  static async get(request: NextRequest) {
    try {
      // Buy Now is only honored when explicitly requested to avoid overriding the normal cart in UI
      const mode = request.nextUrl.searchParams.get("mode");
      if (mode === "buy-now") {
        const buyNowCartId = request.cookies.get("buy_now_cart_id")?.value;
        if (buyNowCartId) {
          try {
            const bn = await storefrontCartService.getCart(buyNowCartId);
            if (bn) {
              // Do not mutate cart_id here; this is a temp checkout cart view
              return NextResponse.json({ success: true, data: bn });
            }
          } catch {}
        }
        // If no Buy Now cart exists, fall through to normal cart resolution below
      }

      // Determine authenticated user (if any)
      const session = await auth();
      const userId = (session as any)?.user?.id as string | undefined;

      // Get or create session ID for guest carts
      const existingSessionId = request.cookies.get("cart_session_id")?.value;
      const sessionId = existingSessionId || uuidv4();

      let cart;
      if (userId) {
        // First resolve the user's cart
        const userCart = await storefrontCartService.getOrCreate(userId, sessionId);
        const guestCartId = request.cookies.get("cart_id")?.value;
        // Only merge if the cookie cart is different from the user's cart
        if (guestCartId && guestCartId !== userCart.id) {
          cart = await storefrontCartService.mergeCart(guestCartId, userId);
        } else {
          cart = userCart;
        }
      } else {
        // Guest cart by session
        cart = await storefrontCartService.getOrCreate(undefined, sessionId);
      }

      const response = NextResponse.json({ success: true, data: cart });

      // Maintain cookies
      if (!existingSessionId) {
        response.cookies.set("cart_session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      response.cookies.set("cart_id", cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } catch (error) {
      console.error("Error getting cart:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to get cart",
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/storefront/cart/items
   * Add item to cart
   */
  static async addItem(request: NextRequest) {
    try {
      const body = await request.json();
      const data = addItemSchema.parse(body);

      // Resolve user and target cart
      const session = await auth();
      const userId = (session as any)?.user?.id as string | undefined;
      const buyNowCartId = request.cookies.get("buy_now_cart_id")?.value;
      let cartId = request.cookies.get("cart_id")?.value;
      const sessionId = request.cookies.get("cart_session_id")?.value || uuidv4();

      if (userId) {
        // Always use the user's persistent cart (not the buy-now cart)
        const userCart = await storefrontCartService.getOrCreate(userId, sessionId);
        cartId = userCart.id;
      } else {
        // Guest: ensure we don't write into the buy-now cart
        const sessionCart = await storefrontCartService.getOrCreate(undefined, sessionId);
        // If current cart_id equals buy-now, override to session cart for this add
        if (buyNowCartId && cartId === buyNowCartId) {
          cartId = sessionCart.id;
        } else if (!cartId) {
          cartId = sessionCart.id;
        }
      }

      const cart = await storefrontCartService.addItem({
        cartId,
        ...data,
      });

      const response = NextResponse.json({
        success: true,
        data: cart,
      });

      // Persist session/cart and clear any lingering Buy Now cookie so GET returns the correct cart
      if (!request.cookies.get("cart_session_id")?.value) {
        response.cookies.set("cart_session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      response.cookies.set("cart_id", cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      if (buyNowCartId) {
        response.cookies.set("buy_now_cart_id", "", { maxAge: 0 });
      }

      return response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }

      console.error("Error adding item to cart:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to add item to cart",
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/storefront/cart/items
   * Update item quantity
   */
  static async updateItem(request: NextRequest) {
    try {
      const body = await request.json();
      const data = updateItemSchema.parse(body);

      await storefrontCartService.updateItemQuantity(data.itemId, data.quantity);

      // Get updated cart (respect user cart if authenticated)
      const session = await auth();
      const userId = (session as any)?.user?.id as string | undefined;
      const sessionId = request.cookies.get("cart_session_id")?.value || uuidv4();
      let cartId = request.cookies.get("cart_id")?.value;
      if (userId) {
        const userCart = await storefrontCartService.getOrCreate(userId, sessionId);
        cartId = userCart.id;
      }

      if (!cartId) {
        return NextResponse.json({ success: true, data: null });
      }
      const cart = await storefrontCartService.getCart(cartId as string);

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }

      console.error("Error updating cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to update cart item",
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/storefront/cart/items
   * Remove item from cart
   */
  static async removeItem(request: NextRequest) {
    try {
      const body = await request.json();
      const data = removeItemSchema.parse(body);

      await storefrontCartService.removeItem(data.itemId);

      // Get updated cart (respect user cart if authenticated)
      const session = await auth();
      const userId = (session as any)?.user?.id as string | undefined;
      const sessionId = request.cookies.get("cart_session_id")?.value || uuidv4();
      let cartId = request.cookies.get("cart_id")?.value;
      if (userId) {
        const userCart = await storefrontCartService.getOrCreate(userId, sessionId);
        cartId = userCart.id;
      }
      if (!cartId) {
        return NextResponse.json({ success: true, data: null });
      }
      const cart = await storefrontCartService.getCart(cartId as string);

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }

      console.error("Error removing cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to remove cart item",
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/storefront/cart/discount
   * Apply discount code
   */
  static async applyDiscount(request: NextRequest) {
    try {
      const body = await request.json();
      const data = applyDiscountSchema.parse(body);

      const cartId = request.cookies.get("cart_id")?.value;
      if (!cartId) {
        throw new Error("Cart not found");
      }

      const cart = await storefrontCartService.applyDiscount(cartId, data.code);

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }

      console.error("Error applying discount:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to apply discount",
          },
        },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/storefront/cart/merge
   * Merge guest cart into user cart on login
   */
  static async mergeCart(request: NextRequest) {
    try {
      // TODO: Get authenticated user ID
      const userId = undefined;
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Authentication required",
              code: "UNAUTHORIZED",
            },
          },
          { status: 401 }
        );
      }

      const guestCartId = request.cookies.get("cart_id")?.value;
      if (!guestCartId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "No guest cart found",
              code: "CART_NOT_FOUND",
            },
          },
          { status: 404 }
        );
      }

      const cart = await storefrontCartService.mergeCart(guestCartId, userId);

      const response = NextResponse.json({
        success: true,
        data: cart,
      });

      // Update cart ID cookie
      response.cookies.set("cart_id", cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (error) {
      console.error("Error merging cart:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to merge cart",
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/storefront/cart/clear
   * Clears the current cart and unsets cart cookies
   */
  static async clear(request: NextRequest) {
    try {
      const cartId = request.cookies.get("cart_id")?.value;
      if (cartId) {
        await storefrontCartService.clearCart(cartId);
      }
      const res = NextResponse.json({ success: true });
      // Unset cart cookies
      res.cookies.set("cart_id", "", { maxAge: 0 });
      // Keep session id to allow new guest cart creation
      return res;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: { message: error instanceof Error ? error.message : "Failed to clear cart" } },
        { status: 500 },
      );
    }
  }
}
