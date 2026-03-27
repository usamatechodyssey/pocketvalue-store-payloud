// // /src/app/actions/couponActions.ts (REFACTORED WITH ZOD)

// "use server";

// import { auth } from "@/app/auth";
// import { client } from "@/sanity/lib/client";
// import { GET_COUPON_BY_CODE } from "@/sanity/lib/queries";
// import { ratelimiter, redis } from "@/app/lib/rate-limiter";
// import { ipAddress } from '@vercel/functions';
// import { NextRequest } from "next/server";
// import connectMongoose from "@/app/lib/mongoose";
// import Order from "@/models/Order";
// // === THE FIX IS HERE: Import Zod and our new schema ===
// import { z } from "zod";
// import { VerifyCouponSchema } from "@/app/lib/zodSchemas";

// // We can now infer the Cart type directly from our Zod schema
// type Cart = z.infer<typeof VerifyCouponSchema>['cart'];

// interface CouponValidationResult {
//   success: boolean;
//   message: string;
//   finalDiscount?: {
//     code: string;
//     amount: number;
//     type: 'percentage' | 'fixed' | 'freeShipping';
//     value?: number;
//     maximumDiscount?: number;
//   };
// }

// export async function verifyAndApplyCoupon(
//   code: string, 
//   cart: Cart, 
//   req: NextRequest
// ): Promise<CouponValidationResult> {
//   const session = await auth();
//   if (!session?.user?.id) {
//     return { success: false, message: "Please log in to apply a coupon." };
//   }

//   // --- Step 1: Validate all inputs with Zod ---
//   const validation = VerifyCouponSchema.safeParse({ code, cart });
//   if (!validation.success) {
//       return { success: false, message: validation.error.issues[0].message };
//   }
//   // Use the sanitized and validated data from Zod
//   const { code: sanitizedCode, cart: validatedCart } = validation.data;

//   // --- Step 2: Perform security and business logic checks ---
//   const ip = ipAddress(req) || '127.0.0.1';
//   const { success: rateLimitSuccess } = await ratelimiter.limit(ip);
//   if (!rateLimitSuccess) {
//     return { success: false, message: "Too many requests. Please try again later." };
//   }
  
//   // The old manual checks for sanitizedCode are no longer needed.
//   const coupon = await client.fetch(GET_COUPON_BY_CODE, { code: sanitizedCode });

//   if (!coupon) {
//     return { success: false, message: "Invalid or expired coupon code." };
//   }

//   // Check #1: Total Usage Limit (Redis)
//   if (coupon.totalUsageLimit) {
//     const usageCount = await redis.get(`coupon:usage:${coupon.code}`);
//     if (usageCount !== null && Number(usageCount) >= coupon.totalUsageLimit) {
//       return { success: false, message: "This coupon has reached its maximum usage limit." };
//     }
//   }

//   // Check #2: Per-User Usage Limit (MongoDB)
//   if (coupon.usageLimitPerUser) {
//     await connectMongoose();
//     const userUsageCount = await Order.countDocuments({
//       userId: session.user.id,
//       "coupon.code": sanitizedCode
//     });
//     if (userUsageCount >= coupon.usageLimitPerUser) {
//       return { success: false, message: "You have already used this coupon the maximum number of times." };
//     }
//   }
  
//   // --- Validation Pipeline ---
//   const now = new Date();
//   if (coupon.startDate && new Date(coupon.startDate) > now) {
//     return { success: false, message: "This coupon is not active yet." };
//   }
//   if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
//     return { success: false, message: "This coupon has expired." };
//   }
//   if (coupon.minimumPurchaseAmount && validatedCart.subtotal < coupon.minimumPurchaseAmount) {
//     return { success: false, message: `Minimum purchase of Rs. ${coupon.minimumPurchaseAmount} is required.` };
//   }

//   // --- Applicability & Discount Calculation ---
//   let applicableSubtotal = 0;
//   if (coupon.applicableTo === 'entireOrder') {
//     applicableSubtotal = validatedCart.subtotal;
//   } else if (coupon.applicableTo === 'specificProducts') {
//     applicableSubtotal = validatedCart.items
//       .filter(item => coupon.applicableProductIds?.includes(item._id))
//       .reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   } else if (coupon.applicableTo === 'specificCategories') {
//     applicableSubtotal = validatedCart.items
//       .filter(item => item.categoryIds?.some((catId: string) => coupon.applicableCategoryIds?.includes(catId)))
//       .reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   }

//   if (applicableSubtotal === 0 && coupon.applicableTo !== 'entireOrder' && coupon.applicableTo !== undefined) {
//     return { success: false, message: "This coupon is not valid for the items in your cart." };
//   }

//   let discountAmount = 0;
//   if (coupon.discountType === 'percentage') {
//     discountAmount = (applicableSubtotal * coupon.discountValue) / 100;
//     if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
//       discountAmount = coupon.maximumDiscount;
//     }
//   } else if (coupon.discountType === 'fixed') {
//     discountAmount = coupon.discountValue;
//     if (discountAmount > applicableSubtotal) {
//         discountAmount = applicableSubtotal;
//     }
//   } else if (coupon.discountType === 'freeShipping') {
//     discountAmount = 0; 
//   }

//   if (discountAmount < 0) discountAmount = 0;
//   if (discountAmount === 0 && coupon.discountType !== 'freeShipping') {
//       return { success: false, message: "This coupon resulted in no discount." };
//   }

//    return {
//     success: true,
//     message: `Coupon "${sanitizedCode}" applied successfully!`,
//     finalDiscount: {
//       code: sanitizedCode,
//       amount: Math.round(discountAmount),
//       type: coupon.discountType,
//       value: coupon.discountValue,
//       maximumDiscount: coupon.maximumDiscount,
//     }
//   };
// }
"use server";

import { auth } from "@/app/auth";
// --- 🛑 OLD SANITY IMPORTS (Commented) ---
// import { client } from "@/sanity/lib/client";
// import { GET_COUPON_BY_CODE } from "@/sanity/lib/queries";

// --- ✅ NEW PAYLOAD IMPORTS (Active) ---
import { getPayload } from "payload";
import configPromise from '@payload-config';

import { ratelimiter, redis } from "@/app/lib/rate-limiter";
import { ipAddress } from '@vercel/functions';
import { NextRequest } from "next/server";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { z } from "zod";
import { VerifyCouponSchema } from "@/app/lib/zodSchemas";
import { ProductReview } from "@/sanity/types/product_types"; // ✅ Iss type ko use karne ke liye import kiya

// --- ✅ NEW INTERFACE: Payload Coupon Document ka Type ---
// Ye interface Payload se aane wale coupon data ko Sanity jaisa banayegi
// --- ✅ NEW INTERFACE: Payload Coupon Document ka Type ---
// Ye interface Payload se aane wale coupon data ko Sanity jaisa banayegi
interface PayloadCouponDoc {
  id: string; 
  code: string;
  description: string;
  isActive?: boolean | null; // ✅ FIX: isActive ko optional boolean ya null kiya
  discountType: 'percentage' | 'fixed' | 'freeShipping';
  discountValue?: number | null; // ✅ FIX: discountValue ko bhi optional number ya null kiya
  maximumDiscount?: number | null; // ✅ FIX: maximumDiscount ko bhi optional number ya null kiya
  minimumPurchaseAmount?: number | null; // ✅ FIX: minimumPurchaseAmount ko bhi optional number ya null kiya
  startDate?: string | null; // ✅ FIX: startDate ko bhi optional string ya null kiya
  expiryDate?: string | null; // ✅ FIX: expiryDate ko bhi optional string ya null kiya
  totalUsageLimit?: number | null; // ✅ FIX: totalUsageLimit ko bhi optional number ya null kiya
  usageLimitPerUser?: number | null; // ✅ FIX: usageLimitPerUser ko bhi optional number ya null kiya
  isStackable?: boolean | null; // ✅ FIX: isStackable ko bhi optional boolean ya null kiya
  applicableTo?: 'entireOrder' | 'specificProducts' | 'specificCategories' | null; // ✅ FIX: applicableTo ko bhi optional string ya null kiya
  applicableProducts?: (string | { id: string })[] | null; // ✅ FIX: applicableProducts ko bhi optional array ya null kiya
  applicableCategories?: (string | { id: string })[] | null; // ✅ FIX: applicableCategories ko bhi optional array ya null kiya
}

type Cart = z.infer<typeof VerifyCouponSchema>['cart'];

interface CouponValidationResult {
  success: boolean;
  message: string;
  finalDiscount?: {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed' | 'freeShipping';
    value?: number | null; // ✅ FIX: 'value' ko null allow kiya
    maximumDiscount?: number | null; // ✅ FIX: 'maximumDiscount' ko null allow kiya
  };
}

// ✅ HELPER FUNCTION: Payload coupon ko Sanity jaisa banana
const mapPayloadCouponToSanity = (payloadCoupon: PayloadCouponDoc) => {
  return {
    _id: payloadCoupon.id, // Payload 'id' ko Sanity '_id' banao
    ...payloadCoupon,
    // Payload mein applicableProducts/Categories sirf IDs hote hain
    // Yaqeen dila rahe hain ke ye array of string IDs hain
    applicableProductIds: payloadCoupon.applicableProducts?.map((p: any) => typeof p === 'object' ? p.id : p) || [],
    applicableCategoryIds: payloadCoupon.applicableCategories?.map((c: any) => typeof c === 'object' ? c.id : c) || [],
  };
};


export async function verifyAndApplyCoupon(
  code: string, 
  cart: Cart, 
  req: NextRequest
): Promise<CouponValidationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Please log in to apply a coupon." };
  }

  // --- Step 1: Validate all inputs with Zod ---
  const validation = VerifyCouponSchema.safeParse({ code, cart });
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const { code: sanitizedCode, cart: validatedCart } = validation.data;

  // --- Step 2: Perform security and business logic checks (Rate Limiting) ---
  const ip = ipAddress(req) || '127.0.0.1';
  const { success: rateLimitSuccess } = await ratelimiter.limit(ip);
  if (!rateLimitSuccess) {
    return { success: false, message: "Too many requests. Please try again later." };
  }
  
  // ================================================================
  // 🔥 CRITICAL CHANGE: Sanity se Payload par Coupon Fetching
  // ================================================================
  const payload = await getPayload({ config: configPromise });
  const couponResult = await payload.find({
    collection: 'coupons',
    where: { 
      code: { equals: sanitizedCode },
      isActive: { equals: true } // Sirf active coupons fetch karein
    },
    depth: 1, // Applicable Products/Categories ke IDs expand karein (agar objects hon)
    limit: 1, // Sirf ek coupon chahiye
  });

  const rawCoupon = couponResult.docs[0];
  if (!rawCoupon) {
    return { success: false, message: "Invalid or expired coupon code." };
  }
  // ✅ Payload coupon ko Sanity jaisa banaya
  const coupon = mapPayloadCouponToSanity(rawCoupon);
  // ================================================================

  // Check #1: Total Usage Limit (Redis)
  if (coupon.totalUsageLimit) {
    const usageCount = await redis.get(`coupon:usage:${coupon.code}`);
    if (usageCount !== null && Number(usageCount) >= coupon.totalUsageLimit) {
      return { success: false, message: "This coupon has reached its maximum usage limit." };
    }
  }

  // Check #2: Per-User Usage Limit (MongoDB)
  if (coupon.usageLimitPerUser) {
    await connectMongoose();
    const userUsageCount = await Order.countDocuments({
      userId: session.user.id,
      "coupon.code": sanitizedCode
    });
    if (userUsageCount >= coupon.usageLimitPerUser) {
      return { success: false, message: "You have already used this coupon the maximum number of times." };
    }
  }
  
  // --- Validation Pipeline ---
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { success: false, message: "This coupon is not active yet." };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { success: false, message: "This coupon has expired." };
  }
  if (coupon.minimumPurchaseAmount && validatedCart.subtotal < coupon.minimumPurchaseAmount) {
    return { success: false, message: `Minimum purchase of Rs. ${coupon.minimumPurchaseAmount} is required.` };
  }

  // --- Applicability & Discount Calculation ---
  let applicableSubtotal = 0;
  if (coupon.applicableTo === 'entireOrder') {
    applicableSubtotal = validatedCart.subtotal;
  } else if (coupon.applicableTo === 'specificProducts') {
    // ✅ Use mapPayloadCouponToSanity se aane wala 'applicableProductIds'
    applicableSubtotal = validatedCart.items
      .filter(item => coupon.applicableProductIds?.includes(item._id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  } else if (coupon.applicableTo === 'specificCategories') {
    // ✅ Use mapPayloadCouponToSanity se aane wala 'applicableCategoryIds'
    applicableSubtotal = validatedCart.items
      .filter(item => item.categoryIds?.some((catId: string) => coupon.applicableCategoryIds?.includes(catId)))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  if (applicableSubtotal === 0 && coupon.applicableTo !== 'entireOrder' && coupon.applicableTo !== undefined) {
    return { success: false, message: "This coupon is not valid for the items in your cart." };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (applicableSubtotal * (coupon.discountValue || 0)) / 100; // ✅ Add default 0
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = (coupon.discountValue || 0); // ✅ Add default 0
    if (discountAmount > applicableSubtotal) {
        discountAmount = applicableSubtotal;
    }
  } else if (coupon.discountType === 'freeShipping') {
    discountAmount = 0; 
  }

  if (discountAmount < 0) discountAmount = 0;
  if (discountAmount === 0 && coupon.discountType !== 'freeShipping') {
      return { success: false, message: "This coupon resulted in no discount." };
  }

   return {
    success: true,
    message: `Coupon "${sanitizedCode}" applied successfully!`,
    finalDiscount: {
      code: sanitizedCode,
      amount: Math.round(discountAmount),
      type: coupon.discountType,
      value: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount,
    }
  };
}