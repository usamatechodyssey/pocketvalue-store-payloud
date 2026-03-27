
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCarouselSlide } from "@/sanity/types/carouselTypes";

export default function HeroCarousel({
  banners,
}: {
  banners: HeroCarouselSlide[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      initial: 0,
      drag: true,
      created: () => setLoaded(true),
      slideChanged: (s) => setCurrentSlide(s.track.details.rel),
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;
        function clearNextTimeout() { clearTimeout(timeout); }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => { slider.next(); }, 6000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
          slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  if (!banners || banners.length === 0) return null;

  return (
    <section className="w-full bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
      <div className="relative w-full aspect-4/5 md:aspect-3/1">
        
        <div ref={sliderRef} className="keen-slider h-full w-full absolute inset-0">
          {banners.map((banner, idx) => (
            <div 
              key={banner._id} 
              className="keen-slider__slide relative w-full h-full min-w-full"
            >
              <Link
                href={banner.link || "#"}
                className="block w-full h-full relative cursor-pointer"
                aria-label={`View Offer: ${banner.title}`}
              >
                {/* DESKTOP IMAGE */}
                <div className="hidden md:block w-full h-full relative">
                  <Image
                    src={banner.desktopImage}
                    alt={banner.title || "Hero Banner"}
                    fill
                    priority={idx === 0}
                    sizes="90vw"
                    quality={95}
                    className="object-cover"
                  />
                </div>

                {/* MOBILE IMAGE */}
                <div className="block md:hidden w-full h-full relative">
                  <Image
                    src={banner.mobileImage}
                    alt={banner.title || "Hero Banner"}
                    fill
                    priority={idx === 0}
                    sizes="90vw"
                    quality={90}
                    className="object-cover"
                  />
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
              </Link>
            </div>
          ))}
        </div>

        {loaded && banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
              // ✅ ARIA-LABEL ADDED
              aria-label="Previous Slide"
              className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="mr-0.5" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
              // ✅ ARIA-LABEL ADDED
              aria-label="Next Slide"
              className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
            >
              <ChevronRight size={24} strokeWidth={2.5} className="ml-0.5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  // ✅ ARIA-LABEL ADDED (Dynamic)
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-500 rounded-full ${
                    currentSlide === idx
                      ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}