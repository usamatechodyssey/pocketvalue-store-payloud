
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import SanityProduct, {
  ProductReview,
  ProductVariant,
  SanityImageObject,
} from "@/sanity/types/product_types";

import ProductInfo from "@/app/components/product/ProductInfo";
import ReviewsSection from "@/app/components/reviews/ReviewsSection";
import ProductDetailsTabs from "@/app/components/product/ProductDetailsTabs";
import ProductGallery from "@/app/components/product/ProductGallery";
import { fetchGlobalSettingsAction } from "@/app/actions/globalSettingsActions";

interface Props {
  product: SanityProduct;
}

export default function ProductClientManager({
  product: initialProduct,
}: Props) {
  const router = useRouter();
  
  // 🔥 FIX: No need for useEffect here.
  // We initialize state ONCE. If product changes, the parent component
  // should change the 'key' prop to force a re-mount.
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.defaultVariant || null
  );
  
  const [reviews, setReviews] = useState<ProductReview[]>(
    initialProduct.reviews || []
  );

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  };

  const imagesToShow: SanityImageObject[] = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.images && selectedVariant.images.length > 0)
      return selectedVariant.images;
    const colorAttribute = selectedVariant?.attributes.find(
      (attr) => attr.name.toLowerCase() === "color"
    );
    if (colorAttribute) {
      const variantWithImages = product.variants.find(
        (v) =>
          v.images &&
          v.images.length > 0 &&
          v.attributes.some(
            (a) =>
              a.name.toLowerCase() === "color" &&
              a.value === colorAttribute.value
          )
      );
      if (variantWithImages?.images) return variantWithImages.images;
    }
    return product.defaultVariant?.images || [];
  }, [selectedVariant, product]);

  const handleNewReview = (newReviewFromAction: ProductReview) => {
    const consistentNewReview: ProductReview = {
      ...newReviewFromAction,
      _id: newReviewFromAction._id || `temp-${Date.now()}`,
      _createdAt: newReviewFromAction._createdAt || new Date().toISOString(),
      reviewImage: newReviewFromAction.reviewImage || undefined,
      user: {
        name: newReviewFromAction.user?.name || "You",
        image: newReviewFromAction.user?.image || undefined,
      },
    };

    const updatedReviews = [consistentNewReview, ...reviews];
    setReviews(updatedReviews);

    const newTotal = updatedReviews.length;
    const newSum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAverage = newSum / newTotal;
    setProduct((prev) => ({
      ...prev,
      rating: newAverage,
      reviewCount: newTotal,
    }));
    
    setTimeout(() => {
      router.refresh();
    }, 500);
  };

  const averageRating = product.rating || 0;
  const totalReviews = product.reviewCount || reviews.length;
  // 🔥 NEW LOGIC: Low Stock Threshold fetch karein
  
  // 🔥 FIX: Low Stock Threshold ab Server Action se aayega
  const [lowStockThreshold, setLowStockThreshold] = useState(5); // Default value

  useEffect(() => {
    async function fetchThreshold() {
      // 🛑 OLD: const settings = await getPayloadGlobalSettings();
      // ✅ NEW: Server Action call karein
      const settings = await fetchGlobalSettingsAction();
      setLowStockThreshold(settings.inventorySettings?.lowStockThreshold || 5);
    }
    fetchThreshold();
  }, []);



  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery
          images={imagesToShow}
          videoUrl={product.videoUrl}
          productTitle={product.title}
        />
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
          averageRating={averageRating}
          totalReviews={totalReviews}
          lowStockThreshold={lowStockThreshold} // ✅ Prop pass ki
        />
      </div>

      <ProductDetailsTabs product={product} selectedVariant={selectedVariant} />
      
      <ReviewsSection
        productId={product._id}
        allReviews={reviews}
        onNewReview={handleNewReview}
      />
    </>
  );
}