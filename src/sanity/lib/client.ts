
// /sanity/lib/client.ts

import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Determine if the CDN should be used based on the environment.
// In development, we want fresh data. In production, we want cached data for speed.
const useCdn = process.env.NODE_ENV === 'production';

/**
 * The primary, read-only, and cached Sanity client.
 * This client is used for all public-facing data fetching (e.g., in Server Components for pages).
 * It leverages the Sanity CDN for maximum performance and does NOT have a token.
 * This client is SAFE to use anywhere in the application.
 */
export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // useCdn,
  // No token is provided, making this a read-only client.
  
  useCdn: false,  // <-- YEH SABSE ZAROORI HAI! Write operations CDN se nahi ho sakti.
  token: process.env.SANITY_API_WRITE_TOKEN, // <-- Token yahan use karna hai server actions ke liye.
});

/**
 * The dedicated, write-enabled, and uncached Sanity client.
 * This client is used EXCLUSIVELY for mutations (create, update, delete) within Server Actions.
 * It uses a secure token and always connects to the live API (`useCdn: false`).
 * This client should NEVER be imported into a client component.
 */
export const writeClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Write operations must NEVER use the CDN.
  token: process.env.SANITY_API_WRITE_TOKEN, // The secure write token.
});

