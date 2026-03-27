// import { NextResponse } from "next/server";
// import { getPayload } from "payload";
// import configPromise from "@payload-config";

// export async function GET() {
//   const payload = await getPayload({ config: configPromise });
//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   // 1. Fetch Products from MongoDB (Payload)
//   const { docs: products } = await payload.find({
//     collection: "products",
//     limit: 1000, // Google usually pulls in batches
//     depth: 1, // Brand logic ke liye depth 1 kaafi hai
//   });

//   // 2. XML Boilerplate
//   let xml = `<?xml version="1.0" encoding="UTF-8"?>
//   <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
//     <channel>
//       <title>PocketValue - Official Product Feed</title>
//       <link>${baseUrl}</link>
//       <description>Premium quality products at best prices in Pakistan.</description>`;

//   // 3. Mapping Products to Google Format
//   products.forEach((p: any) => {
//     const variant = p.variants?.[0];
//     const price = variant?.salePrice || variant?.price || 0;
//     const image = variant?.images?.[0]?.url || "";
//     const brand = p.brand?.name || "PocketValue";
//     const availability =
//       variant?.stock > 0 && variant?.inStock ? "in stock" : "out of stock";

//     xml += `
//       <item>
//         <g:id>${p.id}</g:id>
//         <g:title>${escapeXml(p.title)}</g:title>
//         <g:description>${escapeXml(p.title)} available on PocketValue.</g:description>
//         <g:link>${baseUrl}/product/${p.slug}</g:link>
//         <g:image_link>${image}</g:image_link>
//         <g:condition>new</g:condition>
//         <g:availability>${availability}</g:availability>
//         <g:price>${price} PKR</g:price>
//         <g:brand>${escapeXml(brand)}</g:brand>
//         <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
//       </item>`;
//   });

//   xml += `</channel></rss>`;

//   return new NextResponse(xml, {
//     headers: {
//       "Content-Type": "application/xml",
//       "Cache-Control": "s-maxage=3600, stale-while-revalidate",
//     },
//   });
// }

// // XML characters safety helper
// function escapeXml(unsafe: string) {
//   return unsafe.replace(/[<>&"']/g, (c) => {
//     switch (c) {
//       case "<":
//         return "&lt;";
//       case ">":
//         return "&gt;";
//       case "&":
//         return "&amp;";
//       case '"':
//         return "&quot;";
//       case "'":
//         return "&apos;";
//       default:
//         return c;
//     }
//   });
// }
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

// 🔥 Next.js ko order do ke isay build time par render NA KAREIN (Only Runtime)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  try {
    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Products from MongoDB (Payload)
    const { docs: products } = await payload.find({
      collection: "products",
      limit: 1000,
      depth: 1,
    });

    // 2. XML Boilerplate
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
      <channel>
        <title>PocketValue - Official Product Feed</title>
        <link>${baseUrl}</link>
        <description>Premium quality products at best prices in Pakistan.</description>`;

    // 3. Mapping Products to Google Format
    products.forEach((p: any) => {
      const variant = p.variants?.[0];
      const price = variant?.salePrice || variant?.price || 0;
      const image = variant?.images?.[0]?.url || "";
      const brand = p.brand?.name || "PocketValue";
      const availability =
        variant?.stock > 0 && variant?.inStock ? "in stock" : "out of stock";

      xml += `
        <item>
          <g:id>${p.id}</g:id>
          <g:title>${escapeXml(p.title)}</g:title>
          <g:description>${escapeXml(p.title)} available on PocketValue.</g:description>
          <g:link>${baseUrl}/product/${p.slug}</g:link>
          <g:image_link>${image}</g:image_link>
          <g:condition>new</g:condition>
          <g:availability>${availability}</g:availability>
          <g:price>${price} PKR</g:price>
          <g:brand>${escapeXml(brand)}</g:brand>
          <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
        </item>`;
    });

    xml += `</channel></rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Google Shopping Feed error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PocketValue</title><description>Feed temporarily unavailable during build.</description></channel></rss>`,
      { headers: { "Content-Type": "application/xml" } },
    );
  }
}

// XML characters safety helper
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}
