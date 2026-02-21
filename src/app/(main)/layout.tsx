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

// ✅ NEW: Import Both Vercel Tools
import { SpeedInsights } from "@vercel/speed-insights/next"; 
import { Analytics } from "@vercel/analytics/react";

import {
  getNavigationCategories,
  getSearchSuggestions,
  getGlobalSettings,
} from "@/sanity/lib/queries";
import { SanityCategory } from "@/sanity/types/product_types";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import NextTopLoader from 'nextjs-toploader';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

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
  const settings = await getGlobalSettings();

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
    formatDetection: {
      telephone: false,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, searchSuggestions, globalSettings] = await Promise.all([
    getNavigationCategories() as Promise<SanityCategory[]>,
    getSearchSuggestions(),
    getGlobalSettings(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

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

        <NextTopLoader 
          color="#f97316"
          initialPosition={0.08}
          crawlSpeed={200}
          height={5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 15px #f97316, 0 0 10px #f97316"
          zIndex={99999}
        />
      
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <AppStateProvider>
              <Toaster
                position="bottom-center"
                toastOptions={{ duration: 3000 }}
              />
              
              <PWAInstallPrompt />

              <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
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

        {/* ✅ BOTH INSTALLED: Performance & Visitor Tracking */}
        <SpeedInsights />
        <Analytics />
        
      </body>
    </html>
  );
}