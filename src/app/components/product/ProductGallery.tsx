
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageObject } from "@/sanity/types/product_types";
import { PlayCircle, ZoomIn, ChevronUp, ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { type Swiper as SwiperType } from "swiper"; // ✅ Type Import kiya
import {
  FreeMode,
  Navigation,
  Thumbs,
  Mousewheel,
  Pagination,
} from "swiper/modules";


import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface GalleryItem {
  type: "image" | "video";
  image?: SanityImageObject;
  videoUrl?: string;
  altText: string;
}
interface ProductGalleryProps {
  images: SanityImageObject[];
  videoUrl?: string;
  productTitle: string;
}

export default function ProductGallery({
  images,
  videoUrl,
  productTitle,
}: ProductGalleryProps) {
  // ✅ FIX: 'any' ki jagah proper Type use kiya
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const galleryItems = useMemo(() => {
    const items: GalleryItem[] = [];
    if (videoUrl)
      items.push({
        type: "video",
        videoUrl,
        image: images?.[0], // Video thumbnail ke liye first image
        altText: `${productTitle} video`,
      });
    if (images)
      images.forEach((img, i) =>
        items.push({
          type: "image",
          image: img,
          altText: `${productTitle} image ${i + 1}`,
        }),
      );
    return items;
  }, [images, videoUrl, productTitle]);

  const lightboxSlides = galleryItems
    .filter((item) => item.type === "image" && item.image)
    .map((item) => ({ src: urlFor(item.image!).url() }));

  // Helper to sync arrow state
  useEffect(() => {
    if (thumbsSwiper && !thumbsSwiper.destroyed) {
      const updateArrowState = () => {
        setIsBeginning(thumbsSwiper.isBeginning);
        setIsEnd(thumbsSwiper.isEnd);
      };
      thumbsSwiper.on("fromEdge", updateArrowState);
      thumbsSwiper.on("toEdge", updateArrowState);
      thumbsSwiper.on("slideChange", updateArrowState);
      updateArrowState();
      return () => {
        thumbsSwiper.off("fromEdge", updateArrowState);
        thumbsSwiper.off("toEdge", updateArrowState);
        thumbsSwiper.off("slideChange", updateArrowState);
      };
    }
  }, [thumbsSwiper]);

  if (galleryItems.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No media found</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .product-gallery-thumbs.swiper-vertical .swiper-wrapper {
          height: auto;
          justify-content: flex-start;
        }
        .product-gallery-thumbs .swiper-slide {
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        .product-gallery-thumbs .swiper-slide-thumb-active {
          opacity: 1;
        }
        .product-gallery-thumbs .swiper-slide-thumb-active .thumb-border {
          border-color: #f97316; /* Brand Orange */
        }
        .thumb-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 32px;
          height: 32px;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          color: #333;
          transition: all 0.2s ease;
        }
        .thumb-arrow:hover {
          background-color: #f97316;
          color: white;
        }
        .thumb-arrow.disabled {
          opacity: 0.3;
          pointer-events: none;
        }
        .swiper-pagination-bullet {
          background: #9ca3af;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #f97316;
          opacity: 1;
        }
      `}</style>

      <div className="relative w-full aspect-4/5 md:aspect-auto md:h-125 lg:h-137.5">
        <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
          {/* Thumbnails Sidebar (Hidden on Mobile) */}
          <div className="hidden md:block w-24 shrink-0 relative">
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
              mousewheel={true}
              navigation={{
                nextEl: ".thumb-arrow-next",
                prevEl: ".thumb-arrow-prev",
              }}
              className="product-gallery-thumbs h-full"
            >
              {galleryItems.map((item, index) => (
                <SwiperSlide key={index} className="cursor-pointer h-24!">
                  <div className="thumb-border relative w-full aspect-square bg-white dark:bg-gray-700 rounded-md border-2 border-transparent overflow-hidden">
                    {item.image && (
                      <Image
                        src={urlFor(item.image).width(150).height(150).url()}
                        alt={item.altText}
                        fill
                        sizes="10vw" // Thumbs ke liye size optimize kiya
                        className="object-contain p-1"
                      />
                    )}
                    {item.type === "video" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <PlayCircle className="text-white w-6 h-6" />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows for Thumbs */}
            {galleryItems.length > 5 && (
              <>
                <button
                  onClick={() => thumbsSwiper?.slidePrev()}
                  className={`thumb-arrow thumb-arrow-prev hidden md:flex items-center justify-center ${isBeginning ? "disabled" : ""}`}
                  style={{ top: "-10px" }}
                  aria-label="Previous thumbnail"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => thumbsSwiper?.slideNext()}
                  className={`thumb-arrow thumb-arrow-next hidden md:flex items-center justify-center ${isEnd ? "disabled" : ""}`}
                  style={{ bottom: "-10px" }}
                  aria-label="Next thumbnail"
                >
                  <ChevronDown size={20} />
                </button>
              </>
            )}
          </div>

          {/* Main Slider */}
          <div className="relative w-full h-full md:flex-1 overflow-hidden group rounded-none md:rounded-2xl border-0 md:border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
            <Swiper
              modules={[Thumbs, Pagination]}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              pagination={{ clickable: true }}
              className="w-full h-full"
              onSlideChange={(swiper) =>
                setActiveSlideIndex(swiper.activeIndex)
              }
            >
              {galleryItems.map((item, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`relative w-full h-full ${
                      item.type === "image" ? "cursor-zoom-in" : ""
                    }`}
                    onClick={() => {
                      // Sirf Image par click karne se lightbox khulega
                      if (item.type === "image") {
                        setLightboxOpen(true);
                      }
                    }}
                  >
                    {item.type === "image" && item.image ? (
                      <Image
                        src={urlFor(item.image).url()}
                        alt={item.altText}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0} // Pehli image fast load hogi
                        className="object-contain p-0 md:p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <video
                          src={item.videoUrl}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay={false}
                          muted
                          onContextMenu={(e) => e.preventDefault()}
                          controlsList="nodownload"
                          playsInline
                        />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Floating Magnifier Icon (Desktop Only) */}
            {galleryItems[activeSlideIndex]?.type === "image" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="hidden md:flex absolute top-4 right-4 z-10 p-2.5 bg-white/70 backdrop-blur-sm rounded-full shadow-lg text-gray-700 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          plugins={[Zoom]}
          zoom={{ maxZoomPixelRatio: 3 }}
          // Logic: Agar video pehle number par hai, to index adjust karo taake image sahi khule
          index={Math.max(0, activeSlideIndex - (videoUrl ? 1 : 0))}
        />
      </div>
    </>
  );
}
