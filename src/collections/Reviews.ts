// import type { CollectionConfig } from 'payload'

// export const Reviews: CollectionConfig = {
//   slug: 'reviews',
//   admin: {
//     useAsTitle: 'comment', // Admin panel mein comment title ke taur par dikhega
//     defaultColumns: ['product', 'user', 'rating', 'isApproved'],
//   },
//   access: {
//     // 🔥 Sabse Aham: Sirf approved reviews frontend par show hon
//     read: ({ req: { user } }) => {
//       // Agar user logged in hai to sab reviews dekh sakta hai (Admin/Moderator)
//       if (user) return true;
//       // Agar user logged in nahi to sirf approved reviews dikhenge
//       return {
//         isApproved: {
//           equals: true,
//         },
//       };
//     },
//     // Create, Update, Delete ke rules hum baad mein set karenge
//   },
//   fields: [
//     {
//       name: 'user', // ✅ User ko Payload Users collection se reference karein
//       type: 'relationship',
//       relationTo: 'users',
//       required: true,
//       admin: {
//         readOnly: true, // Review user hamesha automatically submit hoga
//         position: 'sidebar',
//       },
//     },
//     {
//       name: 'product', // ✅ Product ko Payload Products collection se reference karein
//       type: 'relationship',
//       relationTo: 'products',
//       required: true,
//       admin: {
//         readOnly: true, // Review product hamesha automatically submit hoga
//         position: 'sidebar',
//       },
//     },
//     {
//       name: 'rating',
//       type: 'number',
//       required: true,
//       min: 1,
//       max: 5,
//     },
//     {
//       name: 'comment',
//       type: 'textarea', // Sanity 'text' ki jagah Payload 'textarea'
//       required: true,
//       minLength: 10,
//       maxLength: 1000,
//     },
//     {
//       name: 'reviewImage',
//       type: 'upload', // Image field ko Media collection se link karein
//       relationTo: 'media',
//       label: 'Review Image (Optional)',
//     },
//     {
//       name: 'isApproved',
//       type: 'checkbox', // Sanity 'boolean' ki jagah Payload 'checkbox'
//       label: 'Approved for Display?',
//       defaultValue: true, // Default true taake har review foran dikhe
//       admin: {
//         position: 'sidebar',
//         description: 'Frontend par show karne ke liye approval zaroori hai.',
//       },
//     },
//   ],
// }
import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'comment',
    defaultColumns: ['product', 'user', 'rating', 'isApproved'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        isApproved: {
          equals: true,
        },
      };
    },
  },
  fields: [
    {
      name: 'user', 
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // 🛑 YAHAN SE 'admin: { readOnly: true, position: 'sidebar' },' HATA DO
      admin: {
        position: 'sidebar', // Sirf position rehne den
        description: 'Jis user ne review diya hai.',
      },
    },
    {
      name: 'product', 
      type: 'relationship',
      relationTo: 'products',
      required: true,
      // 🛑 YAHAN SE 'admin: { readOnly: true, position: 'sidebar' },' HATA DO
      admin: {
        position: 'sidebar', // Sirf position rehne den
        description: 'Jis product ke liye review hai.',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    {
      name: 'reviewImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Review Image (Optional)',
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      label: 'Approved for Display?',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Frontend par show karne ke liye approval zaroori hai.',
      },
    },
  ],
}