import { Block } from 'payload'

export const LayoutSection: Block = {
  slug: 'layoutSection',
  labels: {
    singular: 'Layout Block (Trust/Newsletter/Grid)',
    plural: 'Layout Blocks',
  },
  fields:[
    {
      name: 'type',
      type: 'radio',
      label: 'Section Type',
      options:[
        { label: 'Trust Bar (Icons)', value: 'trust' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Infinite Product Grid', value: 'infiniteGrid' },
      ],
      defaultValue: 'trust',
    },
    {
      name: 'gridTitle',
      type: 'text',
      label: 'Grid Title',
      defaultValue: 'More to Explore',
      admin: {
        // 🔥 Sirf tab dikhega jab 'infiniteGrid' select ho
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },
  ],
}