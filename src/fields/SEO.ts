import { Field } from 'payload'

export const SEO: Field = {
  name: 'seo',
  type: 'group', // Sanity mein ye 'object' hota hai, Payload mein 'group'
  label: 'SEO Settings',
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta Title',
      admin: {
        description: 'Browser tab aur search results mein nazar aane wala title (50-60 chars).',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta Description',
      admin: {
        description: 'Search results ke liye summary (150-160 chars).',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Social Share Image (Open Graph)',
      admin: {
        description: 'Jab ye page Facebook ya WhatsApp par share hoga, to ye image dikhegi.',
      },
    },
  ],
}