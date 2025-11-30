"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { AiFillTikTok } from "react-icons/ai";

export function StorefrontFooter() {
  const currentYear = new Date().getFullYear();
  const { data: session } = useSession();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-flex items-center mb-4">
              {/* <Image
                src="/Storefront/images/logo%20(1).png"
                alt="Modest Wear"
                width={160}
                height={40}
                className="h-7 w-auto"
                priority
              /> */}
              <h1 className="text-2xl font-bold">Letick </h1>
              <span className="sr-only">Letick Store</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Modern e-commerce platform with best-in-class shopping experience.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/people/LE-TICK/61578018620812/?ref=pl_edit_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>

              <Link
                href="https://www.instagram.com/le__tick_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://www.tiktok.com/@le__tick_?_t=ZS-8xYDWd4BVbE&_r=1&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGntzTQAmpE5ngq4ucD6IbsnXT7MsbidHqo4FYnCzwJBEF8W-mrnTcZFagqLIg_aem_z9HmsUr3QwGW87J097OnKw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <AiFillTikTok className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>

            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/new"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/sale"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/featured"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Account (hidden for guests) */}
          {session?.user && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/account"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Order History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/addresses"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Addresses
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Letick Store. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
