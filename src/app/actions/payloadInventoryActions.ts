// "use server";

// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import { auth } from "@/app/auth";
// import { headers } from "next/headers";

// async function verifyAdmin() {
//     const session = await auth();
//     if (session?.user?.role && ["Super Admin", "Store Manager"].includes(session.user.role)) return true;
//     const payload = await getPayload({ config: configPromise });
//     const { user } = await payload.auth({ headers: await headers() });
//     if (user) return true;
//     throw new Error("Unauthorized");
// }

// export async function getPaginatedInventoryRisk({ page = 1, limit = 10 }) {
//   try {
//     await verifyAdmin();
//     const payload = await getPayload({ config: configPromise });

//     // 1. Settings se Threshold fetch karein
//     const settings = await payload.findGlobal({ slug: 'settings' });
//     const threshold = settings.inventorySettings?.lowStockThreshold ?? 5;

//     // 2. Query for products having variants below threshold
//     const result = await payload.find({
//       collection: 'products',
//       where: {
//         'variants.stock': { less_than_equal: threshold }
//       },
//       page,
//       limit,
//       depth: 1
//     });

//     // 3. Flatten variants logic (Aik product ke multiple low-stock variants ho sakte hain)
//     const riskItems: any[] = [];
//     result.docs.forEach((product: any) => {
//       product.variants?.forEach((v: any) => {
//         if (v.stock <= threshold) {
//           riskItems.push({
//             productId: product.id,
//             productTitle: product.title,
//             variantName: v.name,
//             sku: v.sku || 'N/A',
//             currentStock: v.stock,
//             image: product.variants[0]?.images?.[0]?.url || null,
//             threshold: threshold
//           });
//         }
//       });
//     });

//     return {
//       items: riskItems,
//       totalPages: result.totalPages,
//       totalDocs: result.totalDocs,
//       activeThreshold: threshold
//     };
//   } catch (error: any) {
//     console.error("Inventory Risk Engine Error:", error.message);
//     return { items: [], totalPages: 0, totalDocs: 0, activeThreshold: 5 };
//   }
// }
"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { verifyStaff } from "@/lib/payloadAuth";

/**
 * 📊 GET PAGINATED INVENTORY RISK
 * Scans variants across all products based on the dynamic threshold in Settings.
 */
export async function getPaginatedInventoryRisk({ page = 1, limit = 10 }) {
  try {
    // 🛡️ SECURITY LOCK: Only authorized staff can access the risk audit report
    await verifyStaff(["admin", "manager", "editor"]);

    const payload = await getPayload({ config: configPromise });

    // 1. Live Settings fetch karein (Dynamic Threshold)
    const settings = await payload.findGlobal({ slug: "settings" });
    const threshold = settings.inventorySettings?.lowStockThreshold ?? 5;

    // 2. Query for products having variants below threshold
    // We use the depth: 1 to get basic info and media for the list
    const result = await payload.find({
      collection: "products",
      where: {
        "variants.stock": { less_than_equal: threshold },
      },
      page,
      limit,
      depth: 1,
    });

    // 3. Flatten variants logic (One product -> Multiple potential risk items)
    const riskItems: any[] = [];
    result.docs.forEach((product: any) => {
      product.variants?.forEach((v: any) => {
        // Double check stock against threshold for each specific variant
        const stock = v.stock ?? 0;
        if (stock <= threshold) {
          riskItems.push({
            productId: product.id,
            productTitle: product.title,
            variantName: v.name,
            sku: v.sku || "N/A",
            currentStock: stock,
            // Get the first image of the variant or the first available for the product
            image:
              v.images?.[0]?.url ||
              product.variants?.[0]?.images?.[0]?.url ||
              null,
            threshold: threshold,
          });
        }
      });
    });

    return {
      items: riskItems,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs, // Total products found with risk
      activeThreshold: threshold,
    };
  } catch (error: any) {
    console.error("Payload Inventory Risk Engine Error:", error.message);
    // Safe fallback to prevent UI crash
    return { items: [], totalPages: 0, totalDocs: 0, activeThreshold: 5 };
  }
}
