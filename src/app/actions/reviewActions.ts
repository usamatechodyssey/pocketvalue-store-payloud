
"use server";

import { auth } from "@/app/auth";
// ✅ CHANGE: Import writeClient along with client
import { client, writeClient } from "@/sanity/lib/client"; 
import { revalidatePath } from "next/cache";
import { ProductReview } from "@/sanity/types/product_types";
import { z } from "zod";
import { SubmitReviewSchema } from "@/app/lib/zodSchemas";

// Infer the ReviewData type directly from the Zod schema
type ReviewData = z.infer<typeof SubmitReviewSchema>;

export async function submitReview(data: ReviewData): Promise<{
    success: boolean;
    message: string;
    review?: ProductReview;
}> {
  const session = await auth();
  if (!session?.user?.id || !session.user.name) {
    return { success: false, message: "You must be logged in to post a review." };
  }

  // --- Step 1: Validate with Zod ---
  const validatedFields = SubmitReviewSchema.safeParse(data);
  if (!validatedFields.success) {
      return {
          success: false,
          message: validatedFields.error.issues[0].message,
      };
  }
  
  const { productId, rating, comment, reviewImageUrl } = validatedFields.data;

  try {
    let reviewImagePayload;
    if (reviewImageUrl) { 
      // ✅ FIX: Use 'writeClient' for uploading assets
      const imageAsset = await writeClient.assets.upload('image', await fetch(reviewImageUrl).then(res => res.blob()));
      reviewImagePayload = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id }
      };
    }

    const newReview = {
      _type: 'review',
      user: {
        _type: 'object',
        id: session.user.id,
        name: session.user.name,
        image: session.user.image || undefined,
      },
      product: {
        _type: 'reference',
        _ref: productId, 
      },
      rating: rating, 
      comment: comment, 
      ...(reviewImagePayload && { reviewImage: reviewImagePayload }),
      isApproved: true, // Auto-approve or set to false if you want admin moderation
    };

    // ✅ FIX: Use 'writeClient' to create the document
    const createdReview = await writeClient.create(newReview);

    // Fetch product slug for revalidation (Client is fine for reading)
    const product = await client.getDocument(productId);
    if (product && 'slug' in product && typeof (product as any).slug.current === 'string') {
      revalidatePath(`/product/${(product as any).slug.current}`);
    }

    return {
      success: true,
      message: "Thank you! Your review has been submitted.",
      review: createdReview as ProductReview,
    };

  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, message: "Failed to submit review. Please try again." };
  }
}