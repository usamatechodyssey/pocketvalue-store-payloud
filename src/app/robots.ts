import { MetadataRoute } from 'next';

/**
 * 🤖 ROBOTS.TXT GENERATOR
 * This file controls search engine crawlers (Google, Bing, etc.) access.
 * We are blocking all administrative, private, and transactional routes.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Safety Check: Deployment ke waqt baseUrl ka hona zaroori hai
  if (!baseUrl) {
    console.warn("Missing NEXT_PUBLIC_BASE_URL. robots.txt might generate relative paths.");
  }

  return {
    rules: [
      {
        userAgent: '*', // Sab crawlers ke liye aik hi rule
        allow: '/',     // Baqi mukkamal website allowed hai
        
        // 🚫 DISALLOW LIST (Private & Admin Routes)
        disallow: [
          // 1. Admin Panels
          '/admin/',         // Payload CMS Admin
          '/studio/',        // Sanity Studio (agar future mein use hua toh)
          
          // 2. User Accounts & Privacy
          '/account/',       // Customer Dashboard
          '/api/',           // Backend API Routes
          
          // 3. Auth Flow (No need to index login pages)
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password/',
          '/verify-email',
          '/verify-phone',
          '/access-denied',

          // 4. E-commerce Transactional Pages
          '/cart',
          '/checkout/',
          '/wishlist',
          '/order-failure',
          '/order-success/',

          // 5. Temporary or Low-Value Pages
          '/gift-cards',
          '/sell',
        ],
      },
    ],
    // 🗺️ Sitemap Link: Crawlers ko batana ke sitemap kahan hai
    sitemap: `${baseUrl || ''}/sitemap.xml`,
  };
}