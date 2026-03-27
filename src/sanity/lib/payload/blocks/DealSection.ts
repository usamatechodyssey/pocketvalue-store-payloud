import { Block } from 'payload'

export const DealSection: Block = {
  slug: 'dealSection', // Sanity _type se match
  labels: {
    singular: 'Deal / Campaign Section',
    plural: 'Deal Sections',
  },
  fields: [
    // --- 1. Header Info ---
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },

    // --- 2. The Brain (Fetch Strategy) ---
    {
      name: 'fetchStrategy',
      type: 'select',
      defaultValue: 'campaign',
      options: [
        { label: 'Campaign (e.g. Eid Sale)', value: 'campaign' },
        { label: 'Category (e.g. Shoes)', value: 'category' },
        { label: 'Manual Selection', value: 'manual' },
        { label: 'Tag (New/Best/Featured)', value: 'tag' },
      ],
      required: true,
    },

    // --- 3. Conditional Fields (Jadoo Shuru) ---
    {
      name: 'selectedCampaign',
      type: 'relationship',
      relationTo: 'campaigns',
      admin: {
        // Sirf tab dikhega jab strategy 'campaign' ho
        condition: (_, siblingData) => siblingData.fetchStrategy === 'campaign',
      },
    },
    {
      name: 'selectedCategory',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, siblingData) => siblingData.fetchStrategy === 'category',
      },
    },
    {
      name: 'manualProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true, // Multiple products select karne ke liye
      admin: {
        condition: (_, siblingData) => siblingData.fetchStrategy === 'manual',
      },
    },
    {
      name: 'tagType',
      type: 'select',
      options: [
        { label: 'New Arrivals', value: 'newArrivals' },
        { label: 'Best Sellers', value: 'bestSellers' },
        { label: 'Featured Products', value: 'featured' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.fetchStrategy === 'tag',
      },
    },

    // --- 4. Design & Layout ---
    {
      type: 'row',
      fields: [
        {
          name: 'viewType',
          type: 'select',
          defaultValue: 'slider',
          options: [
            { label: 'Slider', value: 'slider' },
            { label: 'Grid', value: 'grid' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'backgroundStyle',
          type: 'select',
          defaultValue: 'white',
          options: [
            { label: 'Clean White', value: 'white' },
            { label: 'Vibrant Gradient', value: 'gradient' },
            { label: 'Light Gray', value: 'gray' },
          ],
          admin: { width: '50%' },
        },
      ],
    },

    // --- 5. Timer Logic ---
    {
      name: 'enableTimer',
      type: 'checkbox',
      label: 'Show Countdown Timer?',
      defaultValue: false,
    },
    {
      name: 'endTime',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime', // Time picker bhi aayega
        },
        condition: (_, siblingData) => siblingData.enableTimer,
      },
    },

    // --- 6. Side Banner Logic ---
    {
      name: 'showSideBanner',
      type: 'checkbox',
      label: 'Show Side Banner?',
      defaultValue: false,
    },
    {
      name: 'sideBanner',
      type: 'group', // Nested Object
      admin: {
        condition: (_, siblingData) => siblingData.showSideBanner,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
  ],
}