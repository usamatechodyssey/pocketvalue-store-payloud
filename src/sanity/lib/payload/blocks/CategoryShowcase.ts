import { Block } from 'payload'

export const CategoryShowcase: Block = {
  slug: 'categoryShowcase', // Sanity _type
  labels: {
    singular: 'Category Carousel (Circular)',
    plural: 'Category Carousels',
  },
  fields:[
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Shop by Category',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories', // Categories collection se link
      hasMany: true, // Multiple categories select kar sakte hain
      required: true,
      minRows: 3, // Sanity mein aapne Rule.min(3) lagaya tha
      admin: {
        description: 'Choose at least 3 categories to display in the carousel.',
      },
    },
  ],
}