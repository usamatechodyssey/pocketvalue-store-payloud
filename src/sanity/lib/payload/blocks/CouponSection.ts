import { Block } from 'payload'

export const CouponSection: Block = {
  slug: 'couponSection',
  labels: {
    singular: 'Coupon Banner Block',
    plural: 'Coupon Banner Blocks',
  },
  fields:[
    {
      name: 'couponReference',
      type: 'relationship',
      // 🔥 FIX: 'as any' lagaya taake TypeScript error na de
      relationTo: 'couponBanners' as any, 
      label: 'Select Coupon Banner',
      admin: {
        description: 'Select a pre-made coupon design from the Coupon Banners list.',
      },
    },
    {
      name: 'fullWidth',
      type: 'checkbox',
      label: 'Full Width Mode?',
      defaultValue: false,
    },
  ],
}