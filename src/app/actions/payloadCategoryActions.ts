"use server";

import { revalidatePath } from "next/cache";
// import { auth } from "@/app/auth";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { CategoryCsvRowSchema } from "@/app/lib/zodSchemas"; // Import the category CSV schema
import { ZodError } from "zod"; // For better error handling

// Reusing helper from productActions for image upload.
// Make sure 'uploadImageToPayload' is correctly exported from payloadProductActions.ts
import { uploadImageToPayload } from "./payloadProductActions"; 
import { verifyStaff } from "@/lib/payloadAuth";



// === 🔥 BATCH CATEGORY IMPORT ACTION FOR PAYLOAD CMS 🔥 ===
export async function batchCreateCategoriesPayload(categoriesData: any[]) {
   
    // 🛡️ SECURITY LOCK: Only Admin and Manager can perform bulk category imports
    await verifyStaff(['admin', 'manager']);
    
    const payload = await getPayload({ config: configPromise });
    let successfulCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Fetch all existing categories once to optimize relationship linking
    const existingCategoriesResult = await payload.find({ collection: 'categories', limit: 1000, depth: 0 });
    const cachedCategories = existingCategoriesResult.docs; // Array of Payload category documents

    // Step 1: Validate and process category data from CSV
    const processedCategoryData: {
        name: string;
        slug: string;
        parent_slug?: string;
        image_url?: string;
        tempId: string; // Temporary ID for internal linking before Payload IDs are assigned
    }[] = [];

    categoriesData.forEach((row, index) => {
        try {
            const validated = CategoryCsvRowSchema.parse(row);
            // Generate a temporary unique ID for internal mapping during the process
            processedCategoryData.push({ ...validated, tempId: `temp-${index}-${validated.slug}` });
        } catch (error: any) {
            failedCount++;
            if (error instanceof ZodError) {
                errors.push(`Row ${index + 2} (Slug: ${row.slug || 'N/A'}): Validation failed - ${error.issues[0].message}`);
            } else {
                errors.push(`Row ${index + 2} (Slug: ${row.slug || 'N/A'}): Processing error - ${error.message}`);
            }
        }
    });

    if (processedCategoryData.length === 0) {
        return { success: false, successful: 0, failed: failedCount, errors: errors.length > 0 ? errors : ["No valid categories to import."] };
    }

    // --- Phase 1: Create Categories (without parents initially) and upload images ---
    // This array will hold categories that were successfully created or found to exist.
    const categoriesProcessedInThisBatch: {
        id: string; // Payload's actual ID
        name: string;
        slug: string;
        parent_slug?: string;
        tempId: string; // Original temporary ID from processedCategoryData
    }[] = [];

    for (const catData of processedCategoryData) {
        // Check if category already exists by slug to prevent duplicates
        const existingCategory = cachedCategories.find(c => c.slug === catData.slug);
        
        if (existingCategory) {
            categoriesProcessedInThisBatch.push({ ...existingCategory, tempId: catData.tempId, parent_slug: catData.parent_slug });
            successfulCount++; // Count as successful if it already exists
            continue; // Move to the next category in the CSV
        }

        try {
            let mediaId: string | undefined = undefined;
            if (catData.image_url) {
                const uploadedMediaId = await uploadImageToPayload(catData.image_url, catData.slug, payload);
                if (uploadedMediaId) {
                    mediaId = uploadedMediaId;
                } else {
                    errors.push(`Category "${catData.name}": Failed to upload image from URL "${catData.image_url}".`);
                }
            }

            // Create new category in Payload
            const newCategory = await (payload.create as any)({
                collection: 'categories',
                data: {
                    name: catData.name,
                    slug: catData.slug,
                    image: mediaId // Link media ID if available
                }
            });
            
            // Add to our temporary list and cache for later parent linking
            categoriesProcessedInThisBatch.push({ ...newCategory, tempId: catData.tempId, parent_slug: catData.parent_slug });
            cachedCategories.push(newCategory); // Add to cache for subsequent parent linking
            successfulCount++;

        } catch (error: any) {
            failedCount++;
            errors.push(`Failed to create category "${catData.name}": ${error.message}`);
            console.error(`[Category Batch Error] Creating "${catData.name}":`, error);
        }
    }

    // --- Phase 2: Update Categories with Parent Relationships ---
    // This needs to be a separate pass because parent categories might be defined later in the same CSV
    let parentsLinkedCount = 0;
    for (const cat of categoriesProcessedInThisBatch) {
        if (cat.parent_slug) {
            // Find parent from our combined list of existing and newly created categories
            const parentCat = cachedCategories.find(c => c.slug === cat.parent_slug);
            if (parentCat) {
                try {
                    await (payload.update as any)({
                        collection: 'categories',
                        id: cat.id,
                        data: {
                            parent: parentCat.id
                        }
                    });
                    parentsLinkedCount++;
                } catch (error: any) {
                    errors.push(`Category "${cat.name}": Failed to link parent "${cat.parent_slug}" - ${error.message}`);
                    console.error(`[Category Batch Error] Linking parent for "${cat.name}":`, error);
                }
            } else {
                errors.push(`Category "${cat.name}": Parent category "${cat.parent_slug}" not found in Payload or CSV.`);
            }
        }
    }

    // Revalidate paths for categories and homepage/products if relevant
    revalidatePath('/');
    revalidatePath('/admin/categories'); // Payload's default category list
    // If you have a custom view for category import, revalidate its path too.
    // revalidatePath('/admin/import-categories'); 

    return {
        success: failedCount === 0,
        successful: successfulCount,
        failed: failedCount,
        errors,
        message: `Import Processed. Created/Updated: ${successfulCount}, Failed: ${failedCount}, Parents Linked: ${parentsLinkedCount}`
    };
}