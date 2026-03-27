"use server";

import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { z } from "zod"; // For validation and ZodError
import { Payload } from 'payload'; // Payload type for better typing
import { verifyStaff } from "@/lib/payloadAuth";

// --- CONFIGURATION ---
const CONFIRMATION_PHRASE = "I AM SURE"; // Required phrase for mass deletion

// --- Zod Schema for Validation ---
const PayloadMassDeletionSchema = z.object({
    identifier: z.string().min(1, "Category Name or Slug is required."),
    confirmPhrase: z.string().refine(val => val === CONFIRMATION_PHRASE, {
        message: `You must type the phrase '${CONFIRMATION_PHRASE}' exactly to confirm deletion.`,
    }),
});

export type MassDeletionPayload = z.infer<typeof PayloadMassDeletionSchema>;

// --- Helper for Recursive Category/Product Finding ---
async function findCategoryHierarchy(
    payload: Payload, 
    identifier: string, 
    allCategories: any[] // Cached all categories for efficiency
): Promise<{ categoryIds: string[], productIds: string[] }> {
    const rootCategory = allCategories.find(c => 
        c.slug === identifier.toLowerCase() || c.name.toLowerCase() === identifier.toLowerCase()
    );

    if (!rootCategory) {
        throw new Error(`Category "${identifier}" not found.`);
    }

    const categoryIdsToScan: string[] = [rootCategory.id]; // Ye categories sirf scan hongi, delete nahi
    let productsToDelete: string[] = [];

    // Find all sub-categories recursively to get all product links
    const findSubCategories = (parentId: string) => {
        const children = allCategories.filter(c => c.parent && c.parent.id === parentId);
        children.forEach(child => {
            categoryIdsToScan.push(child.id); // Add to list of categories whose products will be deleted
            findSubCategories(child.id); // Recurse
        });
    };

    findSubCategories(rootCategory.id);

    // Find all products linked to these categories
    const productsResult = await payload.find({
        collection: 'products',
        where: { categories: { in: categoryIdsToScan } },
        limit: 99999, // Max limit to get all
        depth: 0 // Only need IDs
    });
    productsToDelete = productsResult.docs.map(p => p.id);

    return { categoryIds: categoryIdsToScan, productIds: productsToDelete }; // categoryIds here are just for scanning
}

// === 🔥 THE PAYLOAD MASS DELETION SURGEON ACTION 🔥 ===
export async function massDeleteCategoryHierarchyPayload(payloadData: MassDeletionPayload): Promise<{ success: boolean; message: string; logs?: string[] }> {
    // ✅ Permissions Check (Using Payload's built-in access, or your custom role system)
    // IMPORTANT: In a real Payload setup, user roles should be checked here from req.user
    // For now, we are assuming it's called from an authorized admin view.
    // await verifyAdmin(['Super Admin']); // Uncomment and adapt if you have Payload user roles integrated
  // 🛡️ SECURITY LOCK: Mass deletion is strictly restricted to 'admin' (Super Admin) only.
    // Managers and Editors cannot perform this action for safety reasons.
    await verifyStaff(['admin']);
    
    const validation = PayloadMassDeletionSchema.safeParse(payloadData);
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    const { identifier } = validation.data;
    
    const payload = await getPayload({ config: configPromise });
    const logs: string[] = [];

    try {
        logs.push(`🔍 Starting mass product deletion under category: "${identifier}"`);

        // Cache all categories to build hierarchy efficiently
        const allCategoriesResult = await payload.find({ collection: 'categories', limit: 99999, depth: 1 });
        const allCategories = allCategoriesResult.docs;

        // Find all products to delete (categories are only scanned, not deleted)
        const { categoryIds: categoriesScanned, productIds: productIdsToDelete } = // categoryIdsToDelete renamed to categoriesScanned for clarity
            await findCategoryHierarchy(payload, identifier, allCategories);

        if (productIdsToDelete.length === 0) {
            logs.push(`⚠️ No products found linked to category "${identifier}" or its sub-categories. Nothing to delete.`);
            return { success: true, message: "No matching products found for deletion in this hierarchy.", logs };
        }

        logs.push(`Categories scanned for products: ${categoriesScanned.length}`);
        logs.push(`Products targeted for deletion: ${productIdsToDelete.length}`);

        // --- Phase 1: Delete Products ONLY ---
        logs.push(`🗑️ Deleting ${productIdsToDelete.length} products...`);
        const productDeletionPromises = productIdsToDelete.map(id => 
            (payload.delete as any)({ collection: 'products', id, overrideAccess: true })
        );
        await Promise.all(productDeletionPromises);
        logs.push(`✅ Successfully deleted ${productIdsToDelete.length} products.`);
        

        // ❌ PHASE 2: DELETE CATEGORIES - This block has been REMOVED as per your requirement.
        // Categories will NOT be deleted.


        logs.push(`🎉 Alhamdulillah! Products deletion mission accomplished for category "${identifier}". Categories are kept safe.`);
        revalidatePath('/');
        revalidatePath('/admin/products');
        // revalidatePath('/admin/categories'); // Categories ko revalidate karne ki zaroorat nahi agar wo delete nahi huin.
        
        return { success: true, message: `Successfully deleted ${productIdsToDelete.length} products from category "${identifier}" hierarchy. Categories are safe.`, logs };

    } catch (error: any) {
        logs.push(`❌ CRITICAL ERROR: ${error.message}`);
        console.error("Mass Product Deletion Action Error:", error);
        return { success: false, message: error.message || "An unexpected error occurred during mass product deletion.", logs };
    }
}