import { Block } from 'payload'

export const BrandSection: Block = {
  slug: 'brandSection',
  labels: {
    singular: 'Brand Showcase',
    plural: 'Brand Showcases',
  },
  fields:[
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Shop by Top Brands',
    },
    {
      name: 'manualBrands',
      type: 'relationship',
      relationTo: 'brands', // Aapki Brands collection se link
      hasMany: true,
      admin: {
        description: 'If left empty, top 8 brands will be shown automatically (managed in frontend).',
      },
    },
  ],
}