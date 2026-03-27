import type { CollectionConfig } from 'payload'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    useAsTitle: 'title',
    defaultColumns:['title', 'slug', 'isActive', 'endDate'],
  },
  access: {
    read: () => true,
  },
  fields:[
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      type: 'row',
      fields:[
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
      ]
    },
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}