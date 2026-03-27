// This is the main layout file for the application. It sets up global providers, metadata, and includes the main layout client component. It also integrates the new IntelligenceTracker for enhanced user behavior tracking.
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { AppStateProvider } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../providers/AuthProvider";
import Script from "next/script";
import "../globals.css";

import { ThemeProvider } from "next-themes";
import MainLayoutClient from "../components/layout/MainLayoutClient";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

// ✅ NEW IMPORTS: Intelligence Tracking
import { headers } from "next/headers";

import { getPayloadNavigationCategories } from "@/sanity/lib/payload/category.queries";
import { getPayloadSearchSuggestions } from "@/sanity/lib/payload/settings.queries";
import { SanityCategory } from "@/sanity/types/product_types";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import NextTopLoader from "nextjs-toploader";
import { fetchGlobalSettingsAction } from "../actions/globalSettingsActions";
// import { trackSessionPulse } from "../actions/trackingActions";
import IntelligenceTracker from "../components/intelligence/IntelligenceTracker";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

// Viewport & Metadata logic remains exactly the same...
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchGlobalSettingsAction();
  const baseSEO = generateBaseMetadata({
    title: settings.seo?.metaTitle,
    description: settings.seo?.metaDescription,
    image: settings.seo?.ogImage,
    path: `/`,
  });
  return {
    ...baseSEO,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "PocketValue",
    },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 const headerList = await headers();
const sessionId = headerList.get('x-pv-session-id');
const visitorId = headerList.get('x-pv-visitor-id'); // 👈 Naya ID

  // // ================================================================

  const [categories, searchSuggestions, globalSettings] = await Promise.all([
    getPayloadNavigationCategories() as Promise<SanityCategory[]>,
    getPayloadSearchSuggestions(),
    fetchGlobalSettingsAction(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Schema objects remain the same...
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    logo: globalSettings.siteLogo
      ? urlFor(globalSettings.siteLogo).url()
      : `${siteUrl}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: globalSettings.storePhoneNumber || "",
      contactType: "Customer Service",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.variable}>
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <NextTopLoader color="#f97316" height={5} showSpinner={false} />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <AppStateProvider>
              <Toaster position="bottom-center" />
              <PWAInstallPrompt />
             <IntelligenceTracker sessionId={sessionId} visitorId={visitorId} />
              <Suspense
                fallback={
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />
                }
              >
                <MainLayoutClient
                  categories={categories || []}
                  searchSuggestions={
                    searchSuggestions || {
                      trendingKeywords: [],
                      popularCategories: [],
                    }
                  }
                  globalSettings={globalSettings || {}}
                >
                  {children}
                </MainLayoutClient>
              </Suspense>
            </AppStateProvider>
          </AuthProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
