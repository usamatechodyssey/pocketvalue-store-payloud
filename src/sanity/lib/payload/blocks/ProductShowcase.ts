import { Block } from 'payload'

export const ProductShowcase: Block = {
  slug: 'productShowcase', // Sanity _type se match
  labels: {
    singular: 'Product Row / Showcase',
    plural: 'Product Showcases',
  },
  fields: [
    // 1. Header
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      required: true,
      admin: {
        description: 'e.g. New Arrivals, Best Sellers',
      },
    },

    // 2. Data Source Strategy
    {
      name: 'type',
      type: 'select',
      label: 'Product Source',
      defaultValue: 'newest',
      options: [
        { label: 'New Arrivals (Auto)', value: 'newest' },
        { label: 'Best Sellers (Auto)', value: 'best-selling' },
        { label: 'Featured Products (Auto)', value: 'featured' },
        { label: 'Manual Selection', value: 'manual' },
      ],
    },

    // 3. Manual Product Selection (Conditional)
    {
      name: 'manualProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true, // Multiple products select karne ke liye
      admin: {
        condition: (_, siblingData) => siblingData.type === 'manual',
        description: 'Select products manually (Drag to reorder).',
      },
    },

    // 4. Side Banner Logic
    {
      name: 'showSideBanner',
      type: 'checkbox',
      label: 'Add Side Banner?',
      defaultValue: false,
      admin: {
        description: 'Enable this to show a banner on the left side of the product slider.',
      },
    },

    // 5. Side Banner Config (Group)
    {
      name: 'sideBanner',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData.showSideBanner,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Banner Image',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Banner Link',
        },
      ],
    },
  ],
}