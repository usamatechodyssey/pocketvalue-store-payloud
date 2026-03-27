import type { CollectionConfig } from 'payload'

export const HeroCarousel: CollectionConfig = {
  slug: 'heroCarousel',
  labels: {
    singular: 'Hero Carousel Slide',
    plural: 'Hero Carousel Slides',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'link', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields:[
    {
      name: 'title',
      type: 'text',
      label: 'Slide Title (e.g., NEW ARRIVALS)',
      required: true,
      admin: {
        description: 'Yeh title banner ke upar bari heading mein nazar aayega (Optional agar image me text ho).',
      }
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: { description: 'Yeh title ke neeche choti line mein nazar aayega.' }
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Shop Now',
    },
    {
      name: 'link',
      type: 'text', // Sanity mein URL tha, Payload mein Text rakhna behtar hai taake relative links (/sale) chal saken
      required: true,
      admin: {
        description: 'Internal links ke liye "/slug" aur external ke liye poora URL daalein.',
      }
    },
    {
      type: 'row',
      fields:[
        {
          name: 'desktopImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Desktop Banner Image',
          admin: { width: '50%', description: 'Recommended Size: 1920x600 pixels.' }
        },
        {
          name: 'mobileImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Mobile Banner Image',
          admin: { width: '50%', description: 'Recommended Size: 750x900 pixels.' }
        }
      ]
    }
  ],
}