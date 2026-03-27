import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'logo'],
  },
  access: {
    read: () => true,
  },
  fields:[
    {
      name: 'name',
      type: 'text',
      label: 'Brand Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique URL identifier (e.g., "nike" or "best-design").',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Brand Logo',
      required: false, // ✅ THE FIX IS HERE
      admin: {
        description: 'Brand ka logo upload karein (e.g., JPEG, PNG, SVG).',
      },
    },
  ],
}