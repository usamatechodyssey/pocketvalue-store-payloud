import type { GlobalConfig } from "payload";
import { SEO } from "../fields/SEO";

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin", // Admin panel mein alag group mein dikhega
  },
  access: {
    read: () => true, // Frontend API ke liye accessible
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        // --- TAB 1: GENERAL INFO ---
        {
          label: "General Info",
          fields: [
            { name: "siteName", type: "text", required: true },
            { name: "siteLogo", type: "upload", relationTo: "media" },
            { name: "storeContactEmail", type: "email" },
            { name: "storePhoneNumber", type: "text" },
            { name: "storeAddress", type: "text" },
            {
              name: "socialLinks",
              type: "group",
              fields: [
                { name: "facebook", type: "text" }, // Using text instead of url for flexibility
                { name: "instagram", type: "text" },
                { name: "twitter", type: "text" },
              ],
            },
          ],
        },
        // --- TAB 2: PROMOTIONS ---
        {
          label: "Promotions & Banners",
          fields: [
            {
              name: "topBarAnnouncements",
              type: "array", // Array of strings in Payload
              fields: [{ name: "message", type: "text" }],
            },
          ],
        },
        // --- TAB 3: NAVIGATION ---
        {
          label: "Navigation & Menus",
          fields: [
            {
              name: "secondaryNavLinks",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                {
                  name: "url",
                  type: "text",
                  required: true,
                  defaultValue: "/",
                },
                {
                  name: "position",
                  type: "radio",
                  options: [
                    { label: "Left Side", value: "left" },
                    { label: "Right Side", value: "right" },
                  ],
                  defaultValue: "left",
                },
                { name: "isHighlight", type: "checkbox", defaultValue: false },
              ],
            },
          ],
        },
        // --- TAB 4: SHIPPING RULES (CRITICAL) ---
        {
          label: "Shipping Rules",
          fields: [
            {
              name: "shippingRules",
              type: "array",
              fields: [
                { name: "name", type: "text", required: true },
                {
                  name: "minAmount",
                  type: "number",
                  required: true,
                  defaultValue: 0,
                  min: 0,
                },
                { name: "cost", type: "number", required: true, min: 0 },
                {
                  name: "isOnCall",
                  type: "checkbox",
                  defaultValue: false,
                  label: "Shipping on Call?",
                },
              ],
            },
          ],
        },
        // --- TAB 5: INVENTORY ---
        {
          label: "Inventory",
          fields: [
            {
              name: "inventorySettings",
              type: "group",
              fields: [
                { name: "lowStockThreshold", type: "number", defaultValue: 5 },
                {
                  name: "alertRecipientEmail",
                  type: "email",
                  defaultValue: "admin@example.com",
                },
              ],
            },
          ],
        },
        // --- TAB 6: SEARCH ---
        {
          label: "Search Suggestions",
          fields: [
            {
              name: "searchSettings",
              type: "group",
              fields: [
                {
                  name: "trendingKeywords",
                  type: "array",
                  fields: [{ name: "keyword", type: "text" }],
                },
                {
                  name: "popularCategories",
                  type: "relationship",
                  relationTo: "categories",
                  hasMany: true,
                },
              ],
            },
          ],
        },
         // --- ✅ NEW TAB 7: DYNAMIC PRICING LOGIC (The Fixed Version) ---
        {
          label: 'Dynamic Pricing Logic',
          fields: [
            {
              name: 'globalFixedFees',
              type: 'array',
              label: 'Fixed Platform Fees',
              admin: { 
                description: 'Percentages deducted from Gross Sale Price (e.g., Bank Charges 3%, Platform Fee 2%).' 
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { 
                      name: 'label', 
                      type: 'text', 
                      required: true, 
                      admin: { placeholder: 'e.g. Bank Charges' } // ✅ FIX: Nested in admin
                    },
                    { 
                      name: 'percentage', 
                      type: 'number', 
                      required: true, 
                      admin: { placeholder: '3' } // ✅ FIX: Nested in admin
                    }
                  ]
                }
              ]
            },
            {
              name: 'pricingLogicTiers',
              type: 'array',
              label: 'Tiered Pricing Brackets (Excel Logic)',
              admin: { 
                description: 'Based on your Excel plan: Define Profit and Ad Spend based on the Buying Price (Cost).' 
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'minCost', type: 'number', required: true, label: 'Cost From (Rs.)' },
                    { name: 'maxCost', type: 'number', required: true, label: 'Cost To (Rs.)' },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'profitPercent', type: 'number', required: true, label: 'Desired Profit %' },
                    { name: 'adSpendPercent', type: 'number', required: true, label: 'Ad Spend %' },
                    { name: 'visualDiscount', type: 'number', label: 'Visual Discount % (Ref Only)' },
                  ]
                }
              ]
            }
          ]
        },

        // --- TAB 8: SEO ---
        {
          label: "Default SEO",
          fields: [SEO], // Humara shared SEO block
        },
      ],
    },
  ],
};
