// src/sanity/lib/payload/category.queries.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BreadcrumbItem } from '../../types/product_types'

// GET CATEGORY TREE (For Navigation & Mega Menu)
export const getPayloadNavigationCategories = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const result = await payload.find({
    collection: 'categories',
    depth: 5, 
    limit: 100,
  })

  const allCategories = result.docs.map((cat: any) => ({
    _id: cat.id,
    _type: 'category',
    name: cat.name,
    slug: cat.slug,
    parent: (cat.parent && typeof cat.parent === 'object') ? { _id: cat.parent.id } : null,
    image: (cat.image && typeof cat.image === 'object') ? cat.image.url : null,
    subCategories:[] 
  }))

  const categoryMap: any = {}
  allCategories.forEach(cat => categoryMap[cat._id] = { ...cat, subCategories:[] })

  const tree: any[] =[]
  allCategories.forEach(cat => {
    if (cat.parent && categoryMap[cat.parent._id]) {
      categoryMap[cat.parent._id].subCategories.push(categoryMap[cat._id])
    } else if (!cat.parent) {
      tree.push(categoryMap[cat._id])
    }
  })

  return tree;
}
// 🔥 PROPER PLACE FOR BREADCRUMBS LOGIC
export const getPayloadBreadcrumbs = async (
  type: 'product' | 'category' | 'page' | 'deals' | 'search' | 'blog' | 'contact-us' | 'faq', 
  slug?: string
): Promise<BreadcrumbItem[]> => {
  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', href: '/' }];
  
  try {
    // 1. PRODUCTS & CATEGORIES (Inke liye DB Call Zaroori hai Parents dhoondne ke liye)
    if ((type === 'product' || type === 'category') && slug) {
      const payload = await getPayload({ config: configPromise });
      let categorySlug = slug;

      // Agar product hai, to uski primary category dhoondo
      if (type === 'product') {
        const products = await payload.find({
            collection: 'products',
            where: { slug: { equals: slug } },
            depth: 1
        });
        const product = products.docs[0];
        if (product && product.categories && product.categories.length > 0) {
            // @ts-ignore
            categorySlug = product.categories[0].slug;
            breadcrumbs.push({ name: product.title, href: `/product/${slug}` });
        }
      }

      // Category Hierarchy Fetch karna
      const categories = await payload.find({
          collection: 'categories',
          where: { slug: { equals: categorySlug } },
          depth: 5
      });

      const category = categories.docs[0];
      if (category) {
          const path: any[] = [];
          let current: any = category;
          while (current) {
              path.unshift({ name: current.name, href: `/category/${current.slug}` });
              current = current.parent;
          }
          breadcrumbs.splice(1, 0, ...path);
      }
    }
    
    // =======================================================
    // 🔥 FIX: INFO PAGES (No DB Call - Just Slug)
    // =======================================================
    else if (type === 'page' && slug) {
      // Slug: "terms-and-conditions" -> Name: "Terms And Conditions"
      const formattedName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({ name: formattedName, href: `/${slug}` });
    }
    // =======================================================

    // Static Pages Logic
    else if (type === 'contact-us') breadcrumbs.push({ name: 'Contact Us', href: '/contact-us' });
    else if (type === 'deals') breadcrumbs.push({ name: 'Deals', href: '/deals' });
    else if (type === 'faq') breadcrumbs.push({ name: 'FAQ', href: '/faq' });
    else if (type === 'search') breadcrumbs.push({ name: 'Search Results', href: '/search' });

  } catch (error) {
    console.error("Payload Breadcrumbs Error:", error);
  }

  return breadcrumbs;
};

