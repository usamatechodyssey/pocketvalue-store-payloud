// /app/admin/products/_components/form-tabs/VariantImageUploader.tsx

"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { writeClient } from "@/sanity/lib/client";
import { SanityImageObject } from "@/sanity/types/product_types";

interface UploadedSanityAsset {
  _id: string;
}

interface VariantImageUploaderProps {
  images?: SanityImageObject[];
  onImagesChange: (images: SanityImageObject[]) => void;
}

export default function VariantImageUploader({
  images = [],
  onImagesChange,
}: VariantImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      const toastId = toast.loading(
        `Uploading ${acceptedFiles.length} image(s)...`
      );
      try {
        const uploadPromises = acceptedFiles.map((file) =>
          writeClient.assets.upload("image", file)
        );
        const uploadedAssets: UploadedSanityAsset[] =
          await Promise.all(uploadPromises);
        const newImages: SanityImageObject[] = uploadedAssets.map((asset) => ({
          _key: `img_${Date.now()}_${Math.random()}`,
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        }));
        onImagesChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded!`, {
          id: toastId,
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Image upload failed.", { id: toastId });
      } finally {
        setIsUploading(false);
      }
    },
    [images, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading,
  });
  const handleRemoveImage = (refToRemove: string) =>
    onImagesChange(images.filter((img) => img.asset._ref !== refToRemove));
  return (
    <div>
      <div
        {...getRootProps()}
        className={`mt-2 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isUploading
            ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            : isDragActive
              ? "border-brand-primary bg-brand-primary/10"
              : "border-gray-300 dark:border-gray-600 hover:border-brand-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          {isUploading ? (
            <Loader2 size={32} className="animate-spin text-brand-primary" />
          ) : (
            <UploadCloud
              size={32}
              className={isDragActive ? "text-brand-primary" : ""}
            />
          )}
          <p className="font-semibold mt-1 text-sm">
            {isUploading
              ? "Uploading..."
              : isDragActive
                ? "Drop files here"
                : "Click or drag 'n' drop"}
          </p>
          <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <li
                key={image.asset._ref}
                className="relative aspect-square border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 group"
              >
                <Image
                  src={urlFor(image).width(200).height(200).url()}
                  alt="Variant preview"
                  fill
                  sizes="120px"
                  className="object-cover rounded-md p-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.asset._ref)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Remove image"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **TypeScript Error Fix:** Removed the incorrect `import { SanityAsset } ...`.
// - **Local Type Definition:** Created a new local interface `UploadedSanityAsset` which defines the only property we need (`_id`). This makes our code type-safe without relying on non-exported types from the Sanity library.
// - **Type Application:** The result of `Promise.all(uploadPromises)` is now correctly typed as `UploadedSanityAsset[]`, which satisfies Typ
