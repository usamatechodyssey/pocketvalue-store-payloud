import { Block } from 'payload'

export const CategoryGrid: Block = {
  slug: 'categoryGrid', // Sanity _type
  labels: {
    singular: 'Featured Category Grid (Bento)',
    plural: 'Featured Category Grids',
  },
  fields:[
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Featured Collections',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Grid Items',
      minRows: 1,
      fields:[
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          admin: { width: '50%' }
        },
        {
          name: 'discountText',
          type: 'text',
          label: 'Discount Text',
          required: true,
          admin: { 
              width: '50%',
              description: 'e.g., "50-80% OFF" or "Under Rs. 999"'
          }
        },
      ],
    },
  ],
}