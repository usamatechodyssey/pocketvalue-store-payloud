// sanity/schemas/post.ts

import { defineField, defineType } from "sanity";
import { BookText } from "lucide-react";

export default defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  icon: BookText,
  groups: [
    // <-- NEW: Added groups for better organization
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "content",
      to: { type: "author" },
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      group: "content",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description:
        "A short summary of the post (for card views and SEO description fallback).",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relatedProductSlugs",
      title: "Related Products (Payload Slugs)",
      description:
        "Enter the slugs of products from Payload CMS you want to show in this blog (e.g. blue-denim-jacket, mens-polo-shirt).",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    // --- NEW: SEO Field ---
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "seo", // Reference to our reusable SEO schema
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
});

// --- SUMMARY OF CHANGES ---
// - Added a `groups` array to create "Content" and "SEO Settings" tabs in the Sanity Studio UI.
// - Moved all existing fields into the "Content" group.
// - Added a new `defineField` for 'seo' and placed it in the new "SEO Settings" group.
