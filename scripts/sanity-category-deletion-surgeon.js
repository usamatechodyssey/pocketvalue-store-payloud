// =============================================================================
// # POCKETVALUE - SANITY SURGEON V3.0 (NODE.JS SERVER ACTION COMPATIBLE)
// # Purpose: Deletes products from a parent category AND its children (2 levels deep).
// # Usage: node sanity-category-deletion-surgeon.js "category-slug-or-name"
// =============================================================================

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@sanity/client');
const process = require('process'); // Explicit import for clarity

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const CHUNK_SIZE = 50; // 🔥🔥🔥 Make sure this line is present and uncommented
const RATE_LIMIT_DELAY = 2000; // 🔥🔥🔥 Make sure this line is present and uncommented

// --- Initial Validation ---
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
    console.error("❌ ERROR: Sanity credentials not found. Please ensure NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN are set in the environment.");
    process.exit(1);
}

// --- Sanity Client Initialization ---
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: '2022-03-07',
  useCdn: false
});

// --- Core Functions ---

/**
 * Finds documents referencing the product and removes the reference.
 * @param {string} productId - The ID of the product being deleted.
 */
async function findAndRemoveReferences(productId) {
    const query = `*[references($productId)]`;
    // Set a lower limit to be safe against large reference checks
    const referencingDocs = await client.fetch(query, { productId });

    if (!referencingDocs || referencingDocs.length === 0) {
        return;
    }

    console.log(`  -> Found ${referencingDocs.length} reference(s) to product ${productId}. Removing...`);
    const transaction = client.transaction();
    
    // Patching references in a transaction
    for (const doc of referencingDocs) {
        // Find and remove reference from arrays and singular fields
        let needsPatch = false;
        const setPatch = {};
        const unsetPatch = [];
        
        for (const [key, value] of Object.entries(doc)) {
            if (Array.isArray(value)) {
                // Filter out the reference from the array
                const newArray = value.filter(item => item?._ref !== productId);
                if (newArray.length < value.length) {
                    setPatch[key] = newArray;
                    needsPatch = true;
                }
            } else if (value?._ref === productId) {
                // Unset the singular reference field
                unsetPatch.push(key);
                needsPatch = true;
            }
        }
        
        if(needsPatch) {
            transaction.patch(doc._id, p => {
                let currentPatch = p;
                if(Object.keys(setPatch).length > 0) currentPatch = currentPatch.set(setPatch);
                if(unsetPatch.length > 0) currentPatch = currentPatch.unset(unsetPatch);
                return currentPatch;
            });
        }
    }
    
    try { 
        await transaction.commit({ returnDocuments: false, autoGenerateArrayKeys: true });
        console.log(`  -> Successfully removed references for ${productId}.`); 
    } catch (e) { 
        console.error(`  -> ❌ ERROR removing references for ${productId}:`, e.message); 
        throw e; // Re-throw to skip the product deletion
    }
}

/**
 * Deletes a chunk of product IDs in one transaction.
 * @param {string[]} productIds - Array of product IDs to delete.
 */
async function deleteProductsInChunk(productIds) {
    console.log(`\n--- Deleting chunk of ${productIds.length} products... ---`);
    const transaction = client.transaction();
    productIds.forEach(pid => transaction.delete(pid));
    
    try { 
        await transaction.commit({ returnDocuments: false }); 
        console.log(`--- ✅ Chunk deleted successfully. ---`); 
    } catch (e) { 
        console.error(`--- ❌ ERROR deleting chunk:`, e.message); 
        // Important: Agar transaction fail ho to error log karein
    }
}

/**
 * Main execution function that runs the hierarchical deletion.
 * @param {string} categoryIdentifier - Name or slug of the parent category.
 */
async function main(categoryIdentifier) {
    console.log(`\n==============================================`);
    console.log(`🔥 POCKETVALUE - HIERARCHICAL DELETION TOOL 🔥`);
    console.log(`==============================================`);
    console.log(`Target Category: ${categoryIdentifier}`);
    
    if (!categoryIdentifier) {
        console.error("❌ ERROR: No category identifier provided.");
        return { success: false, message: "No category identifier provided." };
    }

    console.log(`\n1. Finding parent category '${categoryIdentifier}' and its children...`);
    
    // Find all category IDs in the hierarchy (up to 2 levels deep)
    const categoryQuery = `
      *[_type == 'category' && (name == $identifier || slug.current == $identifier)][0] {
        "allIds": [
          _id, 
          ...*[_type == 'category' && parent._ref == ^._id]._id,
          ...*[_type == 'category' && parent._ref in *[_type == 'category' && parent._ref == ^._id]._id]._id
        ]
      }.allIds
    `;
    let allCategoryIds = await client.fetch(categoryQuery, { identifier: categoryIdentifier });

    if (!allCategoryIds || allCategoryIds.length === 0) {
        console.log(`❌ ERROR: Category '${categoryIdentifier}' not found. Please check the name/slug.`);
        return { success: false, message: `Category '${categoryIdentifier}' not found.` };
    }
    
    allCategoryIds = [...new Set(allCategoryIds.filter(Boolean))];
    console.log(`✅ Found ${allCategoryIds.length} total categories in hierarchy.`);
    
    console.log("\n2. Finding all products across these categories...");
    // Find products linked to ANY of the collected category IDs
    const prodQuery = `*[_type == "product" && count((categories[]->_id)[@ in $allCategoryIds]) > 0]{_id}`;
    const productDocs = await client.fetch(prodQuery, { allCategoryIds });
    const productIds = productDocs.map(doc => doc._id);

    if (productIds.length === 0) {
        console.log("✅ No products found in this category hierarchy. Nothing to do.");
        return { success: true, message: "No products found. Script finished." };
    }
    
    console.log(`Found ${productIds.length} products to delete.`);
    console.log("\n🚀 Starting deletion process...");
    
    let totalDeleted = 0;
    
    for (let i = 0; i < productIds.length; i += CHUNK_SIZE) {
        const chunk = productIds.slice(i, i + CHUNK_SIZE);
        console.log(`\nProcessing chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(productIds.length / CHUNK_SIZE)}...`);
        
        const safeToDelete = [];
        for (const productId of chunk) {
            try {
                // Step 1: Remove all references to this product
                await findAndRemoveReferences(productId); 
                safeToDelete.push(productId);
            } catch (error) {
                // Agar reference removal fail ho jaye to product ko skip kar dein
                console.log(`Skipping deletion of ${productId} due to an error during reference removal.`);
            }
        }

        if (safeToDelete.length > 0) {
            // Step 2: Delete the product itself
            await deleteProductsInChunk(safeToDelete);
            totalDeleted += safeToDelete.length;
        }

        if (productIds.length > i + CHUNK_SIZE) {
            console.log(`Waiting ${RATE_LIMIT_DELAY / 1000}s before next chunk to avoid rate limiting...`);
            // Rate limit delay
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
    }
    
    console.log(`\n\nAlhamdulillah! Mission accomplished. Total products deleted: ${totalDeleted}.`);
    return { success: true, message: `Total products deleted: ${totalDeleted}` };
}

// --- Entry Point (Script runs directly from command line) ---
const categoryIdentifier = process.argv[2]; // Command line argument index 2 (node script.js ARGUMENT)

if (categoryIdentifier) {
    // If the script is run directly, execute the main function
    main(categoryIdentifier).catch(err => {
        console.error("A critical error occurred:", err);
        process.exit(1);
    });
} else {
    // If no argument is provided, the Server Action will handle the logic
    console.log("Script loaded successfully. Awaiting execution from Server Action.");
}