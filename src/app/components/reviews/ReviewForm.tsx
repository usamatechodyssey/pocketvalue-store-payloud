
// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { Star, Upload, X, Loader2 } from "lucide-react";
// import { submitReview } from "@/app/actions/reviewActions";
// import { toast } from "react-hot-toast";
// import Image from "next/image";
// import Link from "next/link"; // ✅ Import Link for fast navigation
// import { ProductReview } from "@/sanity/types/product_types";

// // Helper function for image upload (no change in logic)
// async function uploadImageToCloudinary(file: File): Promise<string> {
//   const formData = new FormData();
//   formData.append("file", file);
//   // IMPORTANT: Make sure this upload preset exists in your Cloudinary account
//   formData.append("upload_preset", "pocketvalue_reviews");
//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/darj7gvze/image/upload`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   );
//   const data = await response.json();
//   if (!response.ok)
//     throw new Error(data.error.message || "Image upload failed");
//   return data.secure_url;
// }

// interface ReviewFormProps {
//   productId: string;
//   onReviewSubmit: (review: ProductReview) => void;
// }

// export default function ReviewForm({
//   productId,
//   onReviewSubmit,
// }: ReviewFormProps) {
//   const { data: session } = useSession();
//   const [rating, setRating] = useState(0);
//   const [hoverRating, setHoverRating] = useState(0); // For hover effect on stars
//   const [comment, setComment] = useState("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   if (!session) {
//     return (
//       <p className="text-center py-6 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
//         Please{" "}
//         {/* ✅ FIX: Used Link component to prevent page reload */}
//         <Link
//           href="/login"
//           className="font-semibold text-brand-primary hover:underline"
//         >
//           log in
//         </Link>{" "}
//         to write a review.
//       </p>
//     );
//   }

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.size < 2 * 1024 * 1024) {
//       // 2MB size limit
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     } else if (file) {
//       toast.error("Image file must be less than 2MB.");
//     }
//   };

//   const removeImage = () => {
//     setImageFile(null);
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
//     setImagePreview(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (rating === 0) {
//       toast.error("Please select a star rating.");
//       return;
//     }
//     if (comment.trim().length < 10) {
//       toast.error("Comment must be at least 10 characters long.");
//       return;
//     }
//     setIsLoading(true);
//     let reviewImageUrl: string | undefined = undefined;

//     try {
//       if (imageFile) {
//         reviewImageUrl = await uploadImageToCloudinary(imageFile);
//       }

//       const result = await submitReview({
//         productId,
//         rating,
//         comment,
//         reviewImageUrl,
//       });

//       if (result.success && result.review) {
//         toast.success(result.message);
//         onReviewSubmit(result.review);
//         // Resetting form is handled by the modal closing
//       } else {
//         toast.error(result.message);
//       }
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "An unknown error occurred."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//           Your Rating*
//         </p>
//         <div
//           className="flex items-center space-x-1"
//           onMouseLeave={() => setHoverRating(0)}
//         >
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               type="button"
//               key={star}
//               onClick={() => setRating(star)}
//               onMouseEnter={() => setHoverRating(star)}
//               className="p-1"
//             >
//               <Star
//                 className={`w-7 h-7 cursor-pointer transition-colors duration-150 ${
//                   (hoverRating || rating) >= star
//                     ? "text-yellow-400 fill-yellow-400"
//                     : // Added a subtle hover effect for unselected stars
//                       "text-gray-300 dark:text-gray-600 hover:text-yellow-400/50"
//                 }`}
//               />
//             </button>
//           ))}
//         </div>
//       </div>
//       <div>
//         <label
//           htmlFor="comment"
//           className="font-medium text-gray-800 dark:text-gray-200 mb-2 block"
//         >
//           Your Comment*
//         </label>
//         <textarea
//           id="comment"
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//           rows={5}
//           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
//           placeholder="Share your thoughts on the product..."
//           required
//           minLength={10}
//         />
//       </div>
//       <div>
//         <label className="font-medium text-gray-800 dark:text-gray-200 mb-2 block">
//           Add a photo (optional)
//         </label>
//         {imagePreview ? (
//           <div className="relative w-28 h-28">
//             <Image
//               src={imagePreview}
//               alt="Review preview"
//               fill
//               sizes="112px"
//               className="rounded-md object-cover border border-gray-300 dark:border-gray-600"
//             />
//             <button
//               type="button"
//               onClick={removeImage}
//               className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
//               aria-label="Remove image"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         ) : (
//           <label className="w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//             <div className="text-center text-gray-500 dark:text-gray-400">
//               <Upload className="mx-auto h-8 w-8" />
//               <p className="mt-1 text-sm">
//                 Click to upload <br />{" "}
//                 <span className="text-xs">(Max 2MB)</span>
//               </p>
//             </div>
//             <input
//               type="file"
//               accept="image/png, image/jpeg, image/webp"
//               className="hidden"
//               onChange={handleImageChange}
//             />
//           </label>
//         )}
//       </div>
//       <button
//         type="submit"
//         disabled={isLoading}
//         className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//       >
//         {isLoading && <Loader2 className="animate-spin" size={20} />}
//         {isLoading ? "Submitting..." : "Submit Review"}
//       </button>
//     </form>
//   );
// }
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Upload, X, Loader2 } from "lucide-react";
import { submitReview } from "@/app/actions/reviewActions";
import { toastError, toastSuccess } from "@/app/_components/shared/CustomToasts"; // ✅ Custom Toast Use Kiya
import Image from "next/image";
import Link from "next/link"; 
import { ProductReview } from "@/sanity/types/product_types";

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: (review: ProductReview) => void;
}

export default function ReviewForm({
  productId,
  onReviewSubmit,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <p className="text-center py-6 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
        Please{" "}
        <Link href="/login" className="font-semibold text-brand-primary hover:underline">
          log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) {
      setImageFile(file);
      // Create preview
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toastError("Image file must be less than 2MB.");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  // 🔥 Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toastError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      toastError("Comment must be at least 10 characters long.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let base64Image = undefined;
      
      // ✅ Convert Image to Base64 before sending to Server Action
      if (imageFile) {
         base64Image = await fileToBase64(imageFile);
      }

      const result = await submitReview({
        productId,
        rating,
        comment,
        reviewImageUrl: base64Image, // ✅ Sending Base64 string
      });

      if (result.success && result.review) {
        toastSuccess(result.message);
        onReviewSubmit(result.review);
      } else {
        toastError(result.message);
      }
    } catch (error) {
      toastError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... (UI waisa hi rahega, usmein koi change nahi) ... */}
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Your Rating*
        </p>
        <div
          className="flex items-center space-x-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-1"
            >
              <Star
                className={`w-7 h-7 cursor-pointer transition-colors duration-150 ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600 hover:text-yellow-400/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="font-medium text-gray-800 dark:text-gray-200 mb-2 block">
          Your Comment*
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          placeholder="Share your thoughts..."
          required
          minLength={10}
        />
      </div>
      <div>
        <label className="font-medium text-gray-800 dark:text-gray-200 mb-2 block">
          Add a photo (optional)
        </label>
        {imagePreview ? (
          <div className="relative w-28 h-28">
            <Image src={imagePreview} alt="Review preview" fill className="rounded-md object-cover border border-gray-300" />
            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-red-600"><X size={16} /></button>
          </div>
        ) : (
          <label className="w-full flex items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100">
            <div className="text-center text-gray-500">
              <Upload className="mx-auto h-8 w-8" />
              <p className="mt-1 text-sm">Click to upload <span className="text-xs">(Max 2MB)</span></p>
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400">
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        {isLoading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}