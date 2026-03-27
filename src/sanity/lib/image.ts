// import createImageUrlBuilder from '@sanity/image-url'
// import { SanityImageSource } from "@sanity/image-url/lib/types/types";
// import { dataset, projectId } from '../env'
// // https://www.sanity.io/docs/image-url
// const builder = createImageUrlBuilder({ projectId, dataset })
// export const urlFor = (source: SanityImageSource) => {
// return builder.image(source)
// }
///////////////////////////////////////////////////////////
// import createImageUrlBuilder from '@sanity/image-url'
// // ✅ FIX: 'type' import use karein taake Next.js/TS khush rahey
// import type { SanityImageSource } from "@sanity/image-url/lib/types/types"; 
// import { dataset, projectId } from '../env'

// const builder = createImageUrlBuilder({ projectId, dataset })

// // ✅ FIX: Union type use kiya (Sanity Image ya Payload Image)
// export const urlFor = (source: SanityImageSource | { url?: string } | any) => {
  
//   // 🔥 THE PAYLOAD ADAPTER (NEW)
//   // Agar source ke andar direct 'url' mojood hai (yani ye Payload/Cloudinary se aya hai)
//   if (source && typeof source === 'object' && 'url' in source && source.url) {
//     const mockBuilder: any = {
//       width: () => mockBuilder,
//       height: () => mockBuilder,
//       fit: () => mockBuilder,
//       url: () => source.url // Direct Cloudinary URL return kar dega
//     };
//     return mockBuilder;
//   }

//   // 🛑 THE SANITY ORIGINAL (Ye aapka purana code wese hi rahega)
//   return builder.image(source as SanityImageSource)
// }
// src/sanity/lib/image.ts

import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"; 
import { dataset, projectId } from '../env'

const builder = createImageUrlBuilder({ projectId, dataset })

// 🔥 UNIVERSAL MOCK BUILDER
// Ye function ensure karega ke frontend code kitni bhi chaining kare (.width.height.fit), wo kabhi crash nahi hoga.
const createMockBuilder = (finalUrl: string) => {
  const mockBuilder: any = {
    width: () => mockBuilder,
    height: () => mockBuilder,
    fit: () => mockBuilder,
    crop: () => mockBuilder,
    auto: () => mockBuilder,
    format: () => mockBuilder,
    quality: () => mockBuilder,
    url: () => finalUrl, // Aakhir mein hamesha ye URL return karega
  };
  return mockBuilder;
};

// ✅ THE BULLETPROOF PAYLOAD ADAPTER
export const urlFor = (source: any) => {
  // 1. Agar source bilkul undefined ya null hai
  if (!source) {
    return createMockBuilder('/placeholder.png');
  }

  // 2. Agar source aik string hai (e.g., Direct Cloudinary URL aagaya Payload Query se)
  if (typeof source === 'string') {
    // Agar wo ghalti se Sanity ka _ref string hai, to use pass hone do
    if (source.startsWith('image-')) {
       return builder.image(source as SanityImageSource);
    }
    // Warna wo Cloudinary ka URL hai, usay mock builder mein daal do
    return createMockBuilder(source);
  }

  // 3. Agar source ke andar url pehle se hai (Payload Object hai)
  if (typeof source === 'object' && 'url' in source && source.url) {
    return createMockBuilder(source.url);
  }

  // 4. Agar source mein asset._ref hai lekin wo Payload ki ID hai (image- se shuru nahi ho rahi)
  if (source?.asset?._ref && !source.asset._ref.startsWith('image-')) {
    if (source.url) {
      return createMockBuilder(source.url);
    }
    return createMockBuilder('/placeholder.png');
  }

  // 🛑 THE SANITY ORIGINAL (Sirf tab chalega jab asli Sanity ID ya Object ho)
  try {
    return builder.image(source as SanityImageSource);
  } catch (error) {
    console.error("Sanity URL Builder Error (Ignored):", error);
    return createMockBuilder('/placeholder.png');
  }
}