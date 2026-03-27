// src/collections/CouponBanners.ts
import type { CollectionConfig } from "payload";

export const CouponBanners: CollectionConfig = {
  slug: "couponBanners", // ✅ Ye slug exact match karna chahiye relationTo ke sath
  admin: {
    useAsTitle: "title",
    group: "Marketing",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          'Sirf admin panel mein pehchanne ke liye (e.g., "Ramadan Offer Banner").',
      },
    },
    {
      name: "link",
      type: "relationship",
      relationTo: ["products", "categories"], // Link can go to a product OR a category
      admin: { description: "Is banner par click karke user kahan jayega?" },
    },
    {
      name: "mediaType",
      type: "radio",
      options: [
        { label: "Image / GIF", value: "image" }, // Text updated for clarity
        { label: "Video", value: "video" },
      ],
      defaultValue: "image",
    },
    {
      name: "mediaUrls",
      type: "group",
      fields: [
        // 🔥 Ye 'upload' type Media collection se jurta hai jisme already MIME types set hain
        {
          name: "mobile",
          type: "upload",
          relationTo: "media",
          label: "Mobile File (Image/Video/GIF)",
        },
        {
          name: "tablet",
          type: "upload",
          relationTo: "media",
          label: "Tablet File (Image/Video/GIF)",
        },
        {
          name: "desktop",
          type: "upload",
          relationTo: "media",
          label: "Desktop File (Image/Video/GIF)",
        },
      ],
    },
    {
      name: "width",
      type: "group",
      fields: [
        {
          name: "mobile",
          type: "text",
          defaultValue: "100%",
          admin: { width: "33%" },
        },
        {
          name: "tablet",
          type: "text",
          defaultValue: "700px",
          admin: { width: "33%" },
        },
        {
          name: "desktop",
          type: "text",
          defaultValue: "1325px",
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "height",
      type: "group",
      fields: [
        {
          name: "mobile",
          type: "text",
          defaultValue: "250px",
          admin: { width: "33%" },
        },
        {
          name: "tablet",
          type: "text",
          defaultValue: "180px",
          admin: { width: "33%" },
        },
        {
          name: "desktop",
          type: "text",
          defaultValue: "140px",
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "objectFit",
      type: "radio",
      options: [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
      ],
      defaultValue: "contain",
    },
    {
      name: "altText",
      type: "text",
      label: "Alt Text",
    },
  ],
};
