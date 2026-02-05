// /app/Bismillah786/categories/_actions/categoryActions.ts (REFACTORED WITH ZOD)

"use server";

import { client, writeClient } from '@/sanity/lib/client'; // Import writeClient for mutations
import { revalidatePath } from 'next/cache';
import groq from 'groq';
import { auth } from "@/app/auth";
// === THE FIX IS HERE: Import Zod and our new schemas ===
import { z } from 'zod';
import { UpsertCategorySchema, DeleteCategorySchema, CategoryCsvRowSchema } from '@/app/lib/zodSchemas';
// --- NAYE IMPORTS for Mass Deletion ---
import { exec } from 'child_process';
import path from 'path';

async function verifyAdmin(allowedRoles: string[]): Promise<string> {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
        throw new Error("Permission Denied: You do not have access to perform this action.");
    }
    return userRole;
}

// Type Definitions
export interface Category {
  _id: string; name: string; slug: string;
  parent?: { _id: string; name: string };
  subCategoryCount: number; productCount: number;
}
// This type is now inferred from the Zod schema
export type UpsertCategoryPayload = z.infer<typeof UpsertCategorySchema>;

export async function getPaginatedCategories({ 
    page = 1, 
    limit = 15, 
    searchTerm = '' 
}): Promise<{ categories: Category[], totalPages: number }> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit;
    const params: { [key: string]: string } = {};
    let filter = '*[_type == "category"';
    if (searchTerm) {
        filter += ` && name match $searchTerm `;
        params.searchTerm = `*${searchTerm}*`;
    }
    const fullQuery = groq`${filter}]`;
    const categoriesQuery = groq`
      ${fullQuery} | order(name asc) [${start}...${end}] {
        _id, name, "slug": slug.current, "parent": parent->{ _id, name },
        "subCategoryCount": count(*[_type == "category" && parent._ref == ^._id]),
        "productCount": count(*[_type == "product" && references(^._id)])
      }
    `;
    const totalCountQuery = groq`count(${fullQuery})`;
    const [categories, totalCount] = await Promise.all([
        client.fetch(categoriesQuery, params),
        client.fetch(totalCountQuery, params),
    ]);
    return { categories, totalPages: Math.ceil(totalCount / limit) };
  } catch (error) {
    console.error("Failed to fetch paginated categories:", error);
    return { categories: [], totalPages: 0 };
  }
}

export async function getAllCategoriesForForm(): Promise<{ _id: string; name: string }[]> {
  try {
    const query = groq`*[_type == "category"] | order(name asc) { _id, name }`;
    return await client.fetch(query);
  } catch (error) {
    console.error("Failed to fetch all categories for form:", error);
    return [];
  }
}
// === ACTION #3: CREATE/UPDATE A CATEGORY (Refactored with Zod) ===
export async function upsertCategory(payload: UpsertCategoryPayload): Promise<{ success: boolean; message: string }> {
  const validation = UpsertCategorySchema.safeParse(payload);
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const { id, name, slug, parentId } = validation.data;
  
  try {
    await verifyAdmin(['Super Admin', 'Content Editor']);
    
    const data = {
      _type: 'category', name, slug: { _type: 'slug', current: slug },
      parent: parentId ? { _type: 'reference', _ref: parentId } : undefined,
    };
    
    // Use the secure writeClient for all mutations
    if (id) {
      const patch = writeClient.patch(id).set({ name: data.name, 'slug.current': data.slug.current });
      if (parentId) patch.set({ parent: { _type: 'reference', _ref: parentId } });
      else patch.unset(['parent']);
      await patch.commit({ autoGenerateArrayKeys: true });
    } else {
      await writeClient.create(data);
    }

    revalidatePath('/Bismillah786/categories');
    return { success: true, message: `Category ${id ? 'updated' : 'created'} successfully!` };
  } catch (error: any) {
    console.error("Failed to upsert category:", error);
    if (error.message?.includes('slug')) {
      return { success: false, message: 'Operation failed. The slug might already be in use.' };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

// === ACTION #4: DELETE A CATEGORY (Refactored with Zod) ===
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  const validation = DeleteCategorySchema.safeParse({ categoryId });
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const { categoryId: validatedId } = validation.data;

  try {
    const userRole = await verifyAdmin(['Super Admin', 'Content Editor']);
    const checksQuery = groq`{
      "subCategoryCount": count(*[_type == "category" && parent._ref == $categoryId]),
      "productCount": count(*[_type == "product" && references($categoryId)])
    }`;
    const { subCategoryCount, productCount } = await client.fetch(checksQuery, { categoryId: validatedId });
    if (subCategoryCount > 0) return { success: false, message: 'Cannot delete. This category has sub-categories.' };
    if (productCount > 0) return { success: false, message: `Cannot delete. ${productCount} product(s) are linked to this category.` };
    if (userRole !== 'Super Admin') {
        return { success: false, message: "Permission Denied: Only a Super Admin can delete categories." };
    }
    
    await writeClient.delete(validatedId); // Use writeClient
    revalidatePath('/Bismillah786/categories');
    return { success: true, message: 'Category deleted successfully!' };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, message: 'Deletion failed due to an unexpected error.' };
  }
}

// /app/Bismillah786/categories/_actions/categoryActions.ts (REPLACE THIS FUNCTION)

// === ACTION #5: BATCH CREATE CATEGORIES (CORRECTED & TYPE-SAFE) ===
export async function batchCreateCategories(categories: unknown[]) {
  await verifyAdmin(['Super Admin', 'Content Editor']);

  let successfulCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const validCategories: z.infer<typeof CategoryCsvRowSchema>[] = [];

  // --- THE FIX IS HERE: Two-step validation for type safety ---
  // Step 1: Validate each row and separate valid data from errors.
  categories.forEach((cat, index) => {
      const result = CategoryCsvRowSchema.safeParse(cat);
      if (result.success) {
          validCategories.push(result.data);
      } else {
          failedCount++;
          errors.push(`Row ${index + 2}: ${result.error.issues[0].message}`);
      }
  });

  if (validCategories.length === 0) {
      return { success: false, message: "No valid category data found in the file.", errors };
  }
  
  // Step 2: Now, operate only on the `validCategories` array.
  // TypeScript knows for certain that `cat` cannot be null inside this loop.
  const createTransaction = writeClient.transaction();
  for (const cat of validCategories) {
    createTransaction.createIfNotExists({
      _id: `category-${cat.slug}`,
      _type: 'category',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
    });
  }
  try {
    await createTransaction.commit({ autoGenerateArrayKeys: true });
  } catch (error: any) {
    return { success: false, message: `Initial category creation failed: ${error.message}`, errors };
  }

  const allCreatedCategories: {_id: string, slug: string}[] = await client.fetch(groq`*[_type == "category"]{_id, "slug": slug.current}`);
  
  const linkTransaction = writeClient.transaction();
  let linksToCreate = 0;

  for (const cat of validCategories) { // Loop over the guaranteed valid array
    if (cat.parent_slug) {
      const child = allCreatedCategories.find(c => c.slug === cat.slug);
      const parent = allCreatedCategories.find(p => p.slug === cat.parent_slug);
      if (child && parent) {
        linkTransaction.patch(child._id, { set: { parent: { _type: 'reference', _ref: parent._id } } });
        linksToCreate++;
      } else if (!parent) {
        const errorMsg = `Could not link "${cat.name}" because parent slug "${cat.parent_slug}" was not found.`;
        if (!errors.includes(errorMsg)) {
            errors.push(errorMsg);
            failedCount++;
        }
      }
    }
  }
  
  try {
    if (linksToCreate > 0) {
        await linkTransaction.commit({ autoGenerateArrayKeys: true });
    }
    // Correctly calculate successful count
    successfulCount = validCategories.length - (errors.length - (categories.length - validCategories.length));
  } catch (error: any) {
    return { success: false, message: 'Setting parent relationships failed.', errors: [...errors, error.message] };
  }

  if (successfulCount > 0) {
    revalidatePath('/Bismillah786/categories');
    revalidatePath('/');
  }

  // Final report calculation is now simpler
  return {
    success: failedCount === 0,
    message: `Processed: ${categories.length}, Successful: ${successfulCount}, Failed: ${failedCount}`,
    errors,
  };
}
// === ACTION #6: DELETE ALL CATEGORIES AND PRODUCTS (NEW SECURE METHOD) ===
const CONFIRMATION_PHRASE = "I AM SURE";

const MassDeletionSchema = z.object({
    identifier: z.string().min(1, "Category Name or Slug is required."),
    confirmPhrase: z.string().refine(val => val === CONFIRMATION_PHRASE, {
        message: `You must type the phrase '${CONFIRMATION_PHRASE}' exactly to confirm deletion.`,
    }),
});

export type MassDeletionPayload = z.infer<typeof MassDeletionSchema>;

// === ACTION #6: HIERARCHICAL MASS DELETION (FINAL & ROBUST VERSION) ===
export async function massDeleteCategoryHierarchy(payload: MassDeletionPayload): Promise<{ success: boolean; message: string; logs?: string[] }> {
    const validation = MassDeletionSchema.safeParse(payload);
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    const { identifier } = validation.data;
    
    try {
        await verifyAdmin(['Super Admin']);
        
        const scriptPath = path.join(process.cwd(), 'scripts/sanity-category-deletion-surgeon.js');
        const quotedScriptPath = `"${scriptPath}"`;
        const command = `node ${quotedScriptPath} "${identifier}"`; 
        
        console.log(`Executing command: ${command}`);

        const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
            exec(command, { 
                maxBuffer: 1024 * 1024 * 5,
                // 🔥🔥🔥 Yahan hum environment variables ko child process mein pass kar rahay hain.
                // Ye sabse zaroori fix hai Vercel par scripts chalane ke liye.
                env: {
                    ...process.env, // Existing env variables bhi inherit honge
                    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
                    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
                    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
                }
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Script Execution Error: ${error.message}`);
                    return reject({ stdout, stderr, error });
                }
                resolve({ stdout, stderr });
            });
        });

        const logs = stdout.split('\n').filter(line => line.trim().length > 0);

        const isSuccessfulCompletion = stdout.includes('Alhamdulillah! Mission accomplished.');
        const isNothingToDo = stdout.includes('Nothing to do.');

        if (stderr || stdout.includes('❌ ERROR')) {
             console.error("Script returned errors or warnings:", stderr || "Check logs for ❌ ERROR");
             return { success: false, message: "Deletion script failed or finished with errors. See logs.", logs: [...logs, stderr] };
        }
        
        if (isSuccessfulCompletion || isNothingToDo) {
            revalidatePath('/Bismillah786/products');
            revalidatePath('/Bismillah786/categories');
            
            const finalMessage = isNothingToDo 
                                 ? `No products found in the hierarchy. Category check successful.` 
                                 : `Hierarchical deletion successfully completed for category: ${identifier}.`;
                                 
            return { success: true, message: finalMessage, logs };
        } 
        
        return { success: false, message: "Script finished, but its status is unclear. Check logs for missing output.", logs };
        
    } catch (error: any) {
        console.error("Mass Deletion API Error:", error);
        
        if (error.code === 'ENOENT') {
             return { success: false, message: "CRITICAL ERROR: Deletion script file 'sanity-category-deletion-surgeon.js' not found in the 'scripts' folder." };
        }
        
        return { success: false, message: error.message || "An unexpected error occurred during mass deletion." };
    }
}

// // === ACTION #6: DELETE ALL CATEGORIES AND PRODUCTS (NEW SECURE METHOD) ===
// // --- ZOD SCHEMA FOR MASS DELETION (FIXED) ---
// const CONFIRMATION_PHRASE = "I AM SURE";

// const MassDeletionSchema = z.object({
//     identifier: z.string().min(1, "Category Name or Slug is required."),
    
//     // FIX: z.literal ke bajaye z.string().refine use kar rahe hain
//     // Ya phir simple z.literal use karte hain agar custom error nahi chahiye
//     confirmPhrase: z.string().refine(val => val === CONFIRMATION_PHRASE, {
//         message: `You must type the phrase '${CONFIRMATION_PHRASE}' exactly to confirm deletion.`,
//     }),
// });

// export type MassDeletionPayload = z.infer<typeof MassDeletionSchema>;

// // === ACTION #6: HIERARCHICAL MASS DELETION (FINAL & ROBUST VERSION) ===
// export async function massDeleteCategoryHierarchy(payload: MassDeletionPayload): Promise<{ success: boolean; message: string; logs?: string[] }> {
//     const validation = MassDeletionSchema.safeParse(payload);
//     if (!validation.success) {
//         return { success: false, message: validation.error.issues[0].message };
//     }
//     const { identifier } = validation.data;
    
//     try {
//         // SECURITY CHECK: Mass deletion sirf Super Admin kar sakta hai.
//         await verifyAdmin(['Super Admin']);
        
//         // --- ASLI SCRIPT KO EXECUTE KAREIN ---
//         const scriptPath = path.join(process.cwd(), 'scripts/sanity-category-deletion-surgeon.js');
        
//         // FIX: Path mein spaces ko handle karne ke liye double quotes zaroori hain.
//         const quotedScriptPath = `"${scriptPath}"`;
//         // Identifier ko bhi quote mein rakhein taake agar naam mein space ho to masla na ho.
//         const command = `node ${quotedScriptPath} "${identifier}"`; 
        
//         console.log(`Executing command: ${command}`);

//         const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
//             // maxBuffer ko 5MB tak badha diya taake bade logs handle ho sakein
//             exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`Script Execution Error: ${error.message}`);
//                     return reject({ stdout, stderr, error });
//                 }
//                 resolve({ stdout, stderr });
//             });
//         });

//         const logs = stdout.split('\n').filter(line => line.trim().length > 0);

//         // --- FINAL LOGIC CHECK ---
//         const isSuccessfulCompletion = stdout.includes('Alhamdulillah! Mission accomplished.');
//         const isNothingToDo = stdout.includes('Nothing to do.');

//         if (stderr || stdout.includes('❌ ERROR')) {
//              // Agar koi script error ya stderr hai
//              console.error("Script returned errors or warnings:", stderr || "Check logs for ❌ ERROR");
//              return { success: false, message: "Deletion script failed or finished with errors. See logs.", logs: [...logs, stderr] };
//         }
        
//         if (isSuccessfulCompletion || isNothingToDo) {
//             // Agar products mile aur delete ho gaye, ya products nahi mile (dono successful scenarios)
//             revalidatePath('/Bismillah786/products');
//             revalidatePath('/Bismillah786/categories');
            
//             const finalMessage = isNothingToDo 
//                                  ? `No products found in the hierarchy. Category check successful.` 
//                                  : `Hierarchical deletion successfully completed for category: ${identifier}.`;
                                 
//             return { success: true, message: finalMessage, logs };
//         } 
        
//         // Agar yahan tak pohancha aur koi bhi success condition true nahi hui
//         return { success: false, message: "Script finished, but its status is unclear. Check logs for missing output.", logs };
        
//     } catch (error: any) {
//         console.error("Mass Deletion API Error:", error);
        
//         if (error.code === 'ENOENT') {
//              return { success: false, message: "CRITICAL ERROR: Deletion script file 'sanity-category-deletion-surgeon.js' not found in the 'scripts' folder." };
//         }
        
//         return { success: false, message: error.message || "An unexpected error occurred during mass deletion." };
//     }
// }
// // === ACTION #6: HIERARCHICAL MASS DELETION (SLIGHTLY CLEANER EXEC) ===
// export async function massDeleteCategoryHierarchy(payload: MassDeletionPayload): Promise<{ success: boolean; message: string; logs?: string[] }> {
//     const validation = MassDeletionSchema.safeParse(payload);
//     if (!validation.success) {
//         return { success: false, message: validation.error.issues[0].message };
//     }
//     const { identifier } = validation.data;
    
//     try {
//         // SECURITY CHECK: Mass deletion sirf Super Admin kar sakta hai.
//         await verifyAdmin(['Super Admin']);
        
//         // --- ASLI SCRIPT KO EXECUTE KAREIN ---
//         const scriptPath = path.join(process.cwd(), 'scripts/sanity-category-deletion-surgeon.js');
        
//           // --- FIX: Exec Command mein path ko double quotes mein wrap kar diya gaya hai ---
//         // Double quotes (") path mein spaces ko handle karne ke liye zaroori hain.
//         const quotedScriptPath = `"${scriptPath}"`;
//         const command = `node ${quotedScriptPath} "${identifier}"`; // Identifier bhi quote mein
        
//         console.log(`Executing command: ${command}`);

//         const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
//             // maxBuffer ko 5MB tak badha diya taake bade logs handle ho sakein
//             exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
//                 if (error) {
//                     // Agar koi exit code error hai to reject karein
//                     console.error(`Script Execution Error: ${error.message}`);
//                     return reject({ stdout, stderr, error });
//                 }
//                 resolve({ stdout, stderr });
//             });
//         });

//         const logs = stdout.split('\n').filter(line => line.trim().length > 0);

//         if (stderr || stdout.includes('❌ ERROR')) {
//              console.error("Script returned errors or warnings:", stderr || "Check logs for ❌ ERROR");
//              return { success: false, message: "Deletion script failed or finished with errors. See logs.", logs: [...logs, stderr] };
//         }
        
//         // Agar success hua to revalidate karein
//         revalidatePath('/Bismillah786/products');
//         revalidatePath('/Bismillah786/categories');
        
//         // Final log line ko check karein
//         if (!stdout.includes('Alhamdulillah! Mission accomplished.')) {
//             return { success: false, message: "Script failed to reach completion. Check logs.", logs };
//         }

//         return { success: true, message: `Hierarchical deletion successfully completed for category: ${identifier}.`, logs };
        
//     } catch (error: any) {
//         console.error("Mass Deletion API Error:", error);
        
//         if (error.code === 'ENOENT') {
//              return { success: false, message: "CRITICAL ERROR: Deletion script file 'sanity-category-deletion-surgeon.js' not found in the 'scripts' folder." };
//         }
        
//         return { success: false, message: error.message || "An unexpected error occurred during mass deletion." };
//     }
// }