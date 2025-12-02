import { ReactNode } from "react";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevent invisible text while font loads
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
  robots: {
    index: false, // Admin/dashboard should not be indexed
    follow: false,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");

  return (
    <html
      lang="en"
      className={themeMode === "dark" ? "dark" : ""}
      data-theme-preset={themePreset}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning>
        {/* Meta Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1600443481133843&ev=PageView&noscript=1"
          />
        </noscript>

        <Analytics />
        <SpeedInsights />
        <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
          {children}
          <Toaster />
        </PreferencesStoreProvider>
      </body>
    </html>
  );
}
