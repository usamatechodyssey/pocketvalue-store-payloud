"use server";

import { revalidatePath } from "next/cache";
// import { auth } from "@/app/auth";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ProductPayloadSchema, ProductGroupSchema } from "@/app/lib/zodSchemas";
import { verifyStaff } from "@/lib/payloadAuth";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

 const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

const generateKey = (): string =>
  `var_${Date.now()}_${Math.random().toString(36).substring(7)}`;

const safeFloat = (val: unknown): number => {
  if (typeof val === "number") return val;
  if (!val || typeof val !== "string" || val.trim() === "") return 0;
  const num = parseFloat(val.replace(/,/g, "").trim());
  return isNaN(num) ? 0 : num;
};

const safeInt = (val: unknown): number => {
  if (typeof val === "number") return Math.floor(val);
  if (!val || typeof val !== "string" || val.trim() === "") return 0;
  const num = parseInt(val.replace(/,/g, "").trim(), 10);
  return isNaN(num) ? 0 : num;
};

// Checks if a CSV row actually contains variant data (ignores purely empty cells)
const hasVariantData = (row: any): boolean => {
  const hasName =
    row.variant_name !== undefined &&
    row.variant_name !== null &&
    row.variant_name.toString().trim() !== "";
  const hasSku =
    row.variant_sku !== undefined &&
    row.variant_sku !== null &&
    row.variant_sku.toString().trim() !== "";
  const hasPrice =
    row.variant_price !== undefined &&
    row.variant_price !== null &&
    row.variant_price.toString().trim() !== "";
  return hasName || hasSku || hasPrice;
};

// Converts standard text to Payload's Lexical RichText format
function convertToLexical(text: string) {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: text, version: 1 }],
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
        },
      ],
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

// Parses "Key:Value | Key:Value" string into Payload Array format
function parseSpecificationsToKeyVal(
  specString?: string,
): { label: string; value: string; id?: string }[] {
  if (!specString || typeof specString !== "string") return [];
  return specString
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const parts = item.split(":");
      return parts.length >= 2
        ? { label: parts[0].trim(), value: parts.slice(1).join(":").trim() }
        : { label: "Feature", value: item.trim() };
    });
}

// Downloads image from URL and uploads directly to Payload's Media Collection via Buffer
export async function uploadImageToPayload(
  url: string,
  filename: string,
  payload: any,
): Promise<string | null> {
  if (!url || !url.startsWith("http")) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for Vercel

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const mediaDoc = await payload.create({
      collection: "media",
      data: { alt: filename },
      file: {
        data: buffer,
        name: `${filename}-${Date.now()}.jpg`,
        mimetype: response.headers.get("content-type") || "image/jpeg",
        size: buffer.byteLength,
      },
    });

    return mediaDoc.id;
  } catch (error: any) {
    console.error(
      `[Payload Media Upload Error] Failed for ${url}: ${error.message}`,
    );
    return null;
  }
}

// ============================================================================
// MAIN SERVER ACTION: BATCH CREATE PRODUCTS
// ============================================================================

export async function batchCreateProductsPayload(productGroups: any[][]) {
// 🛡️ SECURITY LOCK: Only Admin and Manager can perform bulk imports
  await verifyStaff(['admin', 'manager']);

  const payload = await getPayload({ config: configPromise });
  let successfulCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // Pre-fetch collections for relationship mapping
  const [cats, brnds] = await Promise.all([
    payload.find({ collection: "categories", limit: 1000 }),
    payload.find({ collection: "brands", limit: 1000 }),
  ]);

  const cachedCategories = cats.docs;
  const cachedBrands = brnds.docs;

  for (const group of productGroups) {
    try {
      // Validate incoming group shape
      const validatedGroup = ProductGroupSchema.parse(group);
      const [parentData, ...variantRows] = validatedGroup;

      // 1. BRAND HANDLING (Find existing or Create new)
      let brandId: string | undefined = undefined;
      if (parentData.brand && parentData.brand.trim() !== "") {
        const brandName = parentData.brand.trim();
        console.log(`🕵️‍♂️ [Step 1] CSV se Brand Name mila: "${brandName}"`);

        let matchedBrand = cachedBrands.find(
          (b: any) => b.name.toLowerCase() === brandName.toLowerCase(),
        );

        if (matchedBrand) {
          console.log(`✅ [Step 2] Brand pehle se database mein mojood hai.`);
        } else {
          console.log(
            `⚠️ [Step 2] Brand "${brandName}" database mein nahi mila. Naya create kar rahe hain...`,
          );
          try {
            const newBrand = await (payload.create as any)({
              collection: "brands",
              data: {
                name: brandName,
                slug: generateSlug(brandName),
              },
            });

            console.log("📦 [Step 3] Payload se response mila:", newBrand); // Yeh bohot important hai!

            if (newBrand && newBrand.id) {
              matchedBrand = newBrand;
              cachedBrands.push(newBrand);
              console.log(
                "✅ [Step 4] Naya Brand successfully create ho gaya hai.",
              );
            } else {
              console.error(
                "❌ [CRITICAL] Naya Brand create toh hua, lekin uski ID nahi mili!",
              );
            }
          } catch (e: any) {
            console.error(
              `❌ [CRITICAL] Naya Brand create karte waqt error aaya:`,
              e.message,
            );
          }
        }

        if (matchedBrand) {
          brandId = matchedBrand.id;
          console.log(`🆔 [Step 5] Final Brand ID assign hui: "${brandId}"`);
        } else {
          console.log(`❓ [Step 5] Final Brand ID assign NAHI ho saki.`);
        }
      }

      // 2. CATEGORIES HANDLING (Map string names/slugs to Payload IDs)
      const categoryIds = parentData.categories
        ? parentData.categories
            .split(",")
            .map((catName: string) => {
              const cleanName = catName.trim().toLowerCase();
              const found = cachedCategories.find(
                (c: any) =>
                  c.name.toLowerCase() === cleanName || c.slug === cleanName,
              );
              if (!found)
                throw new Error(
                  `Category "${catName.trim()}" not found. Please create it first.`,
                );
              return found.id;
            })
            .filter(Boolean)
        : [];

      // 3. VARIANT & IMAGE HANDLING (The "Smart CSV" Logic)
      const allVariantRows = [...variantRows];

      // Check if parent row also contains variant data (Merged Format)
      if (hasVariantData(parentData)) {
        if (
          !parentData.variant_name ||
          parentData.variant_name.toString().trim() === ""
        ) {
          parentData.variant_name = "Standard";
        }
        allVariantRows.unshift(parentData);
      }

      const processedVariants = [];

      for (const v of allVariantRows) {
        if (hasVariantData(v)) {
          const imageUrls = (v.variant_images || "")
            .toString()
            .split(",")
            .map((u: string) => u.trim())
            .filter(Boolean);

          // 🚀 SPEED FIX: Create an array of promises
          const imageUploadPromises = imageUrls.map((url: string) =>
            uploadImageToPayload(
              url,
              parentData.slug || "product-variant",
              payload,
            ),
          );

          // Run all upload promises in PARALLEL and wait for them all to finish
          const resolvedImageIds = await Promise.all(imageUploadPromises);
          const imageIds = resolvedImageIds.filter(Boolean) as string[]; // Filter out any nulls

          // Map specific variant attributes
          const attributes = [];
          if (v.attribute1_name && v.attribute1_value) {
            attributes.push({
              _key: generateKey(),
              name: v.attribute1_name.toString().trim(),
              value: v.attribute1_value.toString().trim(),
            });
          }
          if (v.attribute2_name && v.attribute2_value) {
            attributes.push({
              _key: generateKey(),
              name: v.attribute2_name.toString().trim(),
              value: v.attribute2_value.toString().trim(),
            });
          }

          processedVariants.push({
            _key: generateKey(),
            name: v.variant_name || "Standard",
            sku: v.variant_sku || "",
            price: safeFloat(v.variant_price),
            salePrice: v.variant_salePrice
              ? safeFloat(v.variant_salePrice)
              : undefined,
            stock: safeInt(v.variant_stock),
            inStock:
              v.variant_inStock !== undefined
                ? String(v.variant_inStock).toLowerCase() === "true"
                : safeInt(v.variant_stock) > 0,
            images: imageIds, // Assign the resolved IDs
            weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
            dimensions:
              v.variant_height || v.variant_width
                ? {
                    height: safeFloat(v.variant_height),
                    width: safeFloat(v.variant_width),
                    depth: safeFloat(v.variant_depth),
                  }
                : undefined,
            attributes: attributes,
          });
        }
      }

      if (processedVariants.length === 0) {
        throw new Error(
          "No valid variants found. A product must have at least one variant.",
        );
      }

      // 4. PREPARE FINAL PAYLOAD DOCUMENT
      const productData = {
        title: parentData.title,
        slug: parentData.slug,
        videoUrl: parentData.videoUrl || "",
        description: convertToLexical(parentData.description || ""),
        specifications: parseSpecificationsToKeyVal(parentData.specifications),
        brand: brandId,
        categories: categoryIds,
        categoryIds: categoryIds, // Ensure Zod validation passes if it expects this
        isBestSeller: String(parentData.isBestSeller).toLowerCase() === "true",
        isNewArrival: String(parentData.isNewArrival).toLowerCase() === "true",
        isFeatured: String(parentData.isFeatured).toLowerCase() === "true",
        isOnDeal: String(parentData.isOnDeal).toLowerCase() === "true",
        rating: safeFloat(parentData.rating),
        variants: processedVariants,
      };

      // Double check data shape against Zod before DB insertion
      ProductPayloadSchema.parse(productData);

      // 5. INSERT INTO PAYLOAD DATABASE
      await payload.create({
        collection: "products",
        data: productData as any, // Asserting as any to bypass strict Payload local API types mismatch with Zod
      });

      successfulCount++;
    } catch (err: any) {
      failedCount++;
      errors.push(`Row [${group[0]?.title || "Unknown"}]: ${err.message}`);
      console.error(`[Batch Upload Error] Product: ${group[0]?.title}`, err);
    }
  }

  // Clear Next.js Cache
  revalidatePath("/");
  revalidatePath("/admin/import-products");

  return {
    success: failedCount === 0,
    successful: successfulCount,
    failed: failedCount,
    errors,
  };
}
