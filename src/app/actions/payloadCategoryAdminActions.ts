"use server";

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function getPaginatedAdminCategoriesPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = '' 
}) {
  const payload = await getPayload({ config: configPromise });

  const whereClause: any = searchTerm ? {
    or: [
      { name: { contains: searchTerm } },
      { slug: { contains: searchTerm } },
    ]
  } : {};

  // 1. Fetch Categories
  const result = await payload.find({
    collection: 'categories',
    where: whereClause,
    page,
    limit,
    depth: 1, // Parent ki details ke liye
    sort: 'name'
  });

  // 2. Counts Calculate Karein (Parallel processing for speed)
  const categoriesWithCounts = await Promise.all(result.docs.map(async (cat: any) => {
    // Sub-categories count dhoondo
    const subCats = await payload.count({
      collection: 'categories',
      where: { parent: { equals: cat.id } }
    });

    // Linked Products count dhoondo
    const prods = await payload.count({
      collection: 'products',
      where: { categories: { in: [cat.id] } }
    });

    return {
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent ? { _id: cat.parent.id, name: cat.parent.name } : null,
      subCategoryCount: subCats.totalDocs,
      productCount: prods.totalDocs
    };
  }));

  return {
    categories: categoriesWithCounts,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs
  };
}