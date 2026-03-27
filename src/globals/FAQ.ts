import type { GlobalConfig } from 'payload'
import { SEO } from '../fields/SEO' // ✅ Humara banaya hua reusable SEO field import karein

export const FAQ: GlobalConfig = {
  slug: 'faq',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    // 🔥 FIX: Tabs ka istemal Sanity ki tarah groups ke liye
    {
      type: 'tabs',
      tabs:[
        // --- TAB 1: CONTENT ---
        {
          label: 'Q&A Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Frequently Asked Questions',
            },
            {
            name: 'subtitle',
            type: 'text',
            label: 'FAQ Subtitle (Optional)',
            required: false, // Lazmi nahi hai
            admin: {
              description: 'A short tagline displayed below the main title.',
            },
          },
            {
              name: 'faqList',
              type: 'array',
              label: 'List of Questions & Answers',
              minRows: 1,
              fields:[
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'richText', required: true },
              ]
            },
          ]
        },
        // --- TAB 2: SEO ---
        {
          label: 'SEO Settings',
          fields: [
            SEO, // ✅ Reusable SEO field ko yahan inject kar diya
          ]
        }
      ]
    }
  ],
}