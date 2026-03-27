// /src/utils/metadata.ts

import type { Metadata } from "next";
// 🛑 OLD SANITY IMPORT
// import { getGlobalSettings } from '@/sanity/lib/queries';

// ✅ NEW PAYLOAD IMPORT
import { fetchGlobalSettingsAction } from "@/app/actions/globalSettingsActions";
import { urlFor } from "@/sanity/lib/image";

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  image?: any;
  path: string;
}

export async function generateBaseMetadata(
  options: GenerateMetadataOptions,
): Promise<Metadata> {
  // ✅ Switch: Fetching from Payload Global Settings
  const settings = await fetchGlobalSettingsAction();
  const { title, description, image, path } = options;

  const siteName = settings.siteName || "PocketValue";
  const baseTitle = title || settings.seo?.metaTitle || siteName;

  const siteNameSuffix = ` | ${siteName}`;
  let finalTitle = baseTitle;
  if (!baseTitle.endsWith(siteNameSuffix) && baseTitle !== siteName) {
    finalTitle = baseTitle + siteNameSuffix;
  }

  const pageDescription =
    description ||
    settings.seo?.metaDescription ||
    "Your one-stop shop for amazing deals!";

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const canonicalUrl = siteUrl ? `${siteUrl}${path}` : path;

  // Note: urlFor ab hamara Cloudinary adapter use karta hai
  const ogImageUrl = image
    ? urlFor(image).width(1200).height(630).url()
    : settings.seo?.ogImage
      ? urlFor(settings.seo.ogImage).width(1200).height(630).url()
      : siteUrl
        ? `${siteUrl}/og-default.png`
        : undefined;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
      absolute: baseTitle,
    },
    description: pageDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: finalTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: siteName,
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630, alt: finalTitle }]
        : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: pageDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
