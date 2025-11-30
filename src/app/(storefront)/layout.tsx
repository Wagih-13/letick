import type { Metadata } from "next";
import { StorefrontHeader } from "@/components/storefront/layout/header";
import { StorefrontFooter } from "@/components/storefront/layout/footer";
import { QueryProvider } from "@/components/storefront/providers/query-provider";
import { AuthProvider } from "@/components/storefront/providers/auth-provider";
import { CartProvider } from "@/components/storefront/providers/cart-provider";
import { PromoBand } from "@/components/storefront/layout/promo-band";
import { CurrencyProvider } from "@/components/storefront/providers/currency-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "Le Tick";
const siteDescription = "Le Tick is a premium watches store for men and women. Discover elegant hijabs, abayas, modest dresses, and modern Islamic wear. Free shipping, authentic styles, worldwide delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "watches",
    "men's watches",
    "women's watches",
    "luxury watches",
    "premium watches",
    "authentic watches",
    "high-quality watches",
    "modern watches",
    "classic watches",
    "best watches"
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/Storefront/images/logo%20(1).png",
    shortcut: "/Storefront/images/logo%20(1).png",
    apple: "/Storefront/images/logo%20(1).png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/Storefront/images/logo%20(1).png`,
        width: 1200,
        height: 630,
        alt: `${siteName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/Storefront/images/logo%20(1).png`],
    creator: "@modestwear", // Update with actual Twitter handle
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "your-google-verification-code", // Add after setting up Google Search Console
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
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
