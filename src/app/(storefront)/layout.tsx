import type { Metadata } from "next";
import { StorefrontHeader } from "@/components/storefront/layout/header";
import { StorefrontFooter } from "@/components/storefront/layout/footer";
import { QueryProvider } from "@/components/storefront/providers/query-provider";
import { AuthProvider } from "@/components/storefront/providers/auth-provider";
import { CartProvider } from "@/components/storefront/providers/cart-provider";
import { PromoBand } from "@/components/storefront/layout/promo-band";
import { CurrencyProvider } from "@/components/storefront/providers/currency-provider";

export const metadata: Metadata = {
  title: {
    default: "Modest Wear",
    template: "%s | Modest Wear",
  },
  description: "Modest Wear — modern e-commerce storefront with best-in-class shopping experience",
  icons: {
    icon: "/Storefront/images/logo%20(1).png",
    shortcut: "/Storefront/images/logo%20(1).png",
    apple: "/Storefront/images/logo%20(1).png",
  },
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <QueryProvider>
        <CartProvider>
          <CurrencyProvider>
          <div className="flex min-h-screen flex-col overflow-x-clip">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <StorefrontHeader />
            {/* <PromoBand /> */}
            <main id="main-content" role="main" tabIndex={-1} className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <StorefrontFooter />
            {/* <MobileBottomBar /> */}
          </div>
          </CurrencyProvider>
        </CartProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
