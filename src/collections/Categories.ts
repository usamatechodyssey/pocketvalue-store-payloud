import type { CollectionConfig } from 'payload'
import { SEO } from '../fields/SEO' // ✅ Humne jo SEO field banayi thi usay import kiya

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent'], // Dashboard table view settings
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs', // ✅ Sanity ke "Groups" ka behtareen replacement
      tabs: [
        // --- TAB 1: MAIN DETAILS ---
        {
          label: 'Main Details',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Category Name',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              required: true,
              unique: true,
              admin: {
                description: 'URL identifier (e.g., "mens-clothing").',
              },
            },
            {
              name: 'parent',
              type: 'relationship',
              relationTo: 'categories', // ✅ Recursive Tree logic
              label: 'Parent Category',
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Category Icon/Image',
            },
          ],
        },
        // --- TAB 2: PAGE CONTENT ---
        {
          label: 'Category Page Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Category Description',
              admin: {
                description: 'SEO aur category page par nazar aane wala text.',
              },
            },
            {
                name: 'desktopBanner',
                type: 'upload',
                relationTo: 'media',
                label: 'Desktop Banner Image',
                admin: {
                  description: 'Wide image for large screens (e.g. 1500x400).',
                },
            },
            {
                name: 'mobileBanner',
                type: 'upload',
                relationTo: 'media',
                label: 'Mobile Banner Image',
                admin: {
                  description: 'Tall/Square image for mobile screens.',
                },
            },
          ],
        },
        // --- TAB 3: SEO ---
        {
          label: 'SEO Settings',
          fields: [
            SEO, // ✅ Hamara reusable SEO object yahan inject ho gaya
          ],
        },
      ],
    },
  ],
}