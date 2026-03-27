import type { CollectionConfig } from 'payload'
import { SEO } from '../fields/SEO'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
              {
            name: 'subtitle',
            type: 'text',
            label: 'Page Subtitle (Optional)',
            required: false, // Lazmi nahi hai
            admin: {
              description: 'A short tagline displayed below the main title.',
            },
          },
            {            
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'body',
              type: 'richText', // Lexical Editor
              required: true,
            },
          ]
        },
        {
          label: 'SEO Settings',
          fields: [SEO]
        }
      ]
    }
  ],
}