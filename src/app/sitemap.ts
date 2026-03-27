import { MetadataRoute } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { client as sanityClient } from "@/sanity/lib/client";
import groq from "groq";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch from Payload (Products, Categories, Campaigns, AND Informational Pages)
  const [products, categories, campaigns, infoPages] = await Promise.all([
    payload.find({
      collection: "products",
      limit: 1000,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: "categories",
      limit: 500,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: "campaigns",
      where: { isActive: { equals: true } },
      select: { slug: true, updatedAt: true },
    }),
    // ✅ NEW: Footer/Informational Pages fetch karein
    payload.find({
      collection: "pages",
      limit: 100,
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // 2. Fetch from Sanity (Blogs/Posts)
  const posts = await sanityClient.fetch(
    groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
  );

  // --- Mapping Data to Sitemap Format ---

  // Products
  const productUrls = products.docs.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    priority: 0.8,
  }));

  // Categories
  const categoryUrls = categories.docs.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    priority: 0.7,
  }));

  // Deals/Campaigns
  const dealUrls = campaigns.docs.map((d) => ({
    url: `${baseUrl}/deals/${d.slug}`,
    lastModified: new Date(d.updatedAt),
    priority: 0.9,
  }));

  // ✅ NEW: Informational Pages (About Us, Terms, etc.)
  const infoPageUrls = infoPages.docs.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    priority: 0.5, // Legal pages ki priority thodi kam rakhte hain
  }));

  // Blogs
  const blogUrls = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    priority: 0.6,
  }));

  // 3. Combine Everything
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 }, // Homepage
    { url: `${baseUrl}/deals`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/contact-us`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), priority: 0.5 },
    ...dealUrls,
    ...productUrls,
    ...categoryUrls,
    ...blogUrls,
    ...infoPageUrls, // ✅ Footer pages ab sitemap mein hain!
  ];
}
