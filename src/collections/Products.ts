// import type { CollectionConfig } from "payload";
// import { SEO } from "../fields/SEO";

// export const Products: CollectionConfig = {
//   slug: "products",
//   admin: {
//     useAsTitle: "title",
//     defaultColumns: ["title", "brand", "price", "stock"],
//   },
//   access: {
//     read: () => true,
//   },
//   fields: [
//     {
//       type: "tabs",
//       tabs: [
//         {
//           label: "Main Information",
//           fields: [
//             { name: "title", type: "text", required: true, index: true },
//             {
//               name: "slug",
//               type: "text",
//               required: true,
//               unique: true,
//               index: true,
//               admin: { description: "Unique URL part (e.g. usama-ali-shirts)" },
//             },
//             {
//               name: "videoUrl",
//               type: "text",
//               label: "Product Video URL (Optional)",
//             },

//             // --- THE VARIANTS ARRAY ---
//             {
//               name: "variants",
//               type: "array",
//               required: true,
//               minRows: 1,
//               fields: [
//                 // 🔥 NAYA FIELD: Permanent Key ke liye
//                 // Payload by default arrays ke andar '_id' ya 'id' khud lagata hai,
//                 // lekin hum explicit control ke liye sku ko as a key use kar sakte hain
//                 // ya phir Payload ki internal 'id' par depend kar sakte hain.
//                 // Asal fix query mein hoga, schema waisa hi rehnay den.
//                 {
//                   type: "row",
//                   fields: [
//                     {
//                       name: "name",
//                       type: "text",
//                       required: true,
//                       admin: { width: "50%" },
//                     },
//                     {
//                       name: "sku",
//                       type: "text",
//                       required: true,
//                       admin: { width: "50%" },
//                     }, // ✅ SKU ko required kar den taake ise as a key use kiya ja sake
//                   ],
//                 },
//                 {
//                   type: "row",
//                   fields: [
//                     {
//                       name: "price",
//                       type: "number",
//                       required: true,
//                       admin: { width: "33%" },
//                     },
//                     {
//                       name: "salePrice",
//                       type: "number",
//                       admin: { width: "33%" },
//                     },
//                     { name: "stock", type: "number", admin: { width: "33%" } },
//                   ],
//                 },
//                 { name: "inStock", type: "checkbox", defaultValue: true },
//                 {
//                   name: "images",
//                   type: "upload",
//                   relationTo: "media",
//                   hasMany: true,
//                 },
//                 {
//                   name: "attributes",
//                   type: "array",
//                   fields: [
//                     {
//                       type: "row",
//                       fields: [
//                         {
//                           name: "name",
//                           type: "text",
//                           label: "Name (e.g. Size)",
//                         },
//                         {
//                           name: "value",
//                           type: "text",
//                           label: "Value (e.g. XL)",
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 { name: "weight", type: "number", label: "Weight (kg)" },
//                 {
//                   name: "dimensions",
//                   type: "group",
//                   fields: [
//                     {
//                       type: "row",
//                       fields: [
//                         {
//                           name: "height",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                         {
//                           name: "width",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                         {
//                           name: "depth",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           label: "Details & Specifications",
//           fields: [
//             { name: "description", type: "richText" },
//             {
//               name: "categories",
//               type: "relationship",
//               relationTo: "categories",
//               hasMany: true,
//               required: true,
//             },
//             { name: "brand", type: "relationship", relationTo: "brands" },
//             {
//               name: "specifications",
//               type: "array",
//               fields: [
//                 {
//                   type: "row",
//                   fields: [
//                     { name: "label", type: "text", admin: { width: "50%" } },
//                     { name: "value", type: "text", admin: { width: "50%" } },
//                   ],
//                 },
//               ],
//             },
//             { name: "shippingAndReturns", type: "richText" },
//           ],
//         },
//         {
//           label: "Marketing & SEO",
//           fields: [
//             { name: "rating", type: "number", min: 1, max: 5 },
//             {
//               name: "activeCampaigns",
//               type: "relationship",
//               relationTo: "campaigns",
//               hasMany: true,
//             },
//             {
//               type: "row",
//               fields: [
//                 { name: "isBestSeller", type: "checkbox", defaultValue: false },
//                 { name: "isNewArrival", type: "checkbox", defaultValue: false },
//                 { name: "isFeatured", type: "checkbox", defaultValue: false },
//                 { name: "isOnDeal", type: "checkbox", defaultValue: false },
//               ],
//             },
//             SEO,
//           ],
//         },

//       ],
//     },
//   ],
// };

import type { CollectionConfig } from "payload";
import { SEO } from "../fields/SEO";
import { revalidatePath } from "next/cache"; // ✅ Next.js Cache invalidation ke liye

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "brand", "price", "stock"],
  },
  access: {
    read: () => true,
  },
  // =================================================================
  // 🔥 ENTERPRISE SEO HOOKS: Real-time Data Sync
  // =================================================================
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        // 1. Product Detail Page ko refresh karo
        revalidatePath(`/product/${doc.slug}`);

        // 2. Homepage refresh karo (Naya product ya price change dikhane ke liye)
        revalidatePath("/");

        // 3. Sitemap refresh karo taake Google ko nayi update mile
        revalidatePath("/sitemap.xml");

        // 4. Google Shopping Feed refresh karo
        revalidatePath("/api/google-shopping");

        // 5. Agar product 'Deals' mein hai, to deals page bhi refresh karo
        if (doc.isOnDeal) {
          revalidatePath("/deals");
        }

        console.log(
          `🚀 SEO Sync: Revalidated all paths for product: ${doc.title}`,
        );
      },
    ],
    afterDelete: [
      ({ doc }) => {
        // Product delete hote hi sitemap aur pages se hata do taake 404 error na aaye Google par
        revalidatePath(`/product/${doc.slug}`);
        revalidatePath("/sitemap.xml");
        revalidatePath("/api/google-shopping");
      },
    ],
  },
  // =================================================================

  fields: [
    {
      type: "tabs",
      tabs: [
        // --- TAB 1: MAIN INFORMATION ---
        {
          label: "Main Information",
          fields: [
            { name: "title", type: "text", required: true, index: true },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true, // ✅ Database Index for Speed
              admin: { description: "Unique URL part (e.g. usama-ali-shirts)" },
            },
            {
              name: "videoUrl",
              type: "text",
              label: "Product Video URL (Optional)",
            },

            // --- THE VARIANTS ARRAY ---
            {
              name: "variants",
              type: "array",
              required: true,
              minRows: 1,
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      required: true,
                      admin: { width: "50%" },
                    },
                    {
                      name: "sku",
                      type: "text",
                      required: true,
                      index: true, // ✅ SKU per search fast hogi
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "price",
                      type: "number",
                      required: true,
                      admin: { width: "33%" },
                    },
                    {
                      name: "salePrice",
                      type: "number",
                      admin: { width: "33%" },
                    },
                    { name: "stock", type: "number", admin: { width: "33%" } },
                  ],
                },
                { name: "inStock", type: "checkbox", defaultValue: true },
                {
                  name: "images",
                  type: "upload",
                  relationTo: "media",
                  hasMany: true,
                },
                {
                  name: "attributes",
                  type: "array",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "name",
                          type: "text",
                          label: "Name (e.g. Size)",
                        },
                        {
                          name: "value",
                          type: "text",
                          label: "Value (e.g. XL)",
                        },
                      ],
                    },
                  ],
                },
                { name: "weight", type: "number", label: "Weight (kg)" },
                {
                  name: "dimensions",
                  type: "group",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "height",
                          type: "number",
                          admin: { width: "33%" },
                        },
                        {
                          name: "width",
                          type: "number",
                          admin: { width: "33%" },
                        },
                        {
                          name: "depth",
                          type: "number",
                          admin: { width: "33%" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- TAB 2: DETAILS & SPECIFICATIONS ---
        {
          label: "Details & Specifications",
          fields: [
            { name: "description", type: "richText" },
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              hasMany: true,
              required: true,
              index: true, // ✅ Index for Category filtering
            },
            {
              name: "brand",
              type: "relationship",
              relationTo: "brands",
              index: true,
            },
            {
              name: "specifications",
              type: "array",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", admin: { width: "50%" } },
                    { name: "value", type: "text", admin: { width: "50%" } },
                  ],
                },
              ],
            },
            { name: "shippingAndReturns", type: "richText" },
          ],
        },

        // --- TAB 3: MARKETING & SEO ---
        {
          label: "Marketing & SEO",
          fields: [
            { name: "rating", type: "number", min: 1, max: 5 },
            {
              name: "activeCampaigns",
              type: "relationship",
              relationTo: "campaigns",
              hasMany: true,
              index: true, // ✅ Index for Sales/Campaigns
            },
            {
              type: "row",
              fields: [
                {
                  name: "isBestSeller",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isNewArrival",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isFeatured",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isOnDeal",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
              ],
            },
            SEO, // Reusable SEO Object
          ],
        },
      ],
    },
  ],
};
