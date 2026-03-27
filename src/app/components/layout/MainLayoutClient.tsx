// // // // /src/app/components/layout/MainLayoutClient.tsx

// // // "use client";

// // // import { useState, useEffect, ReactNode } from "react";
// // // import { SanityCategory } from "@/sanity/types/product_types";
// // // import NewSidebar from "./NewSidebar";
// // // import NewHeader from "./NewHeader";
// // // import NewRightDock from "./NewRightDock";
// // // import MainFooter from "./Footer";
// // // import MegaMenu from "./MegaMenu";
// // // import TopActionBar from "@/app/components/ui/ActionBar";
// // // import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// // // import BottomNav from "./BottomMobileNav";
// // // import MobileMenu from "./MobileMenu";
// // // import SearchPanel from "../ui/MobileSearchPanel";
// // // import { GlobalSettings } from "@/sanity/lib/queries"; // <-- IMPORT THE NEW TYPE

// // // // --- PROPS INTERFACE UPDATED ---
// // // interface SearchSuggestions {
// // //   trendingKeywords: string[];
// // //   popularCategories: SanityCategory[];
// // // }

// // // interface MainLayoutClientProps {
// // //   categories: SanityCategory[];
// // //   children: ReactNode;
// // //   searchSuggestions: SearchSuggestions;
// // //   globalSettings: GlobalSettings; // <-- ADD THE NEW PROP
// // // }

// // // // Heights (No change)
// // // const TOP_ACTION_BAR_HEIGHT = 18;
// // // const HEADER_HEIGHT_DESKTOP = 87;
// // // const HEADER_HEIGHT_MOBILE = 70;
// // // const SECONDARY_NAV_HEIGHT = 40;
// // // const DESKTOP_UNSCROLLED_HEIGHT =
// // //   TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// // // const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;

// // // export default function MainLayoutClient({
// // //   categories,
// // //   children,
// // //   searchSuggestions,
// // //   globalSettings, // <-- RECEIVE THE NEW PROP
// // // }: MainLayoutClientProps) {
// // //   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(
// // //     null
// // //   );
// // //   const [isScrolled, setIsScrolled] = useState(false);
// // //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// // //   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

// // //   useEffect(() => {
// // //     const handleScroll = () => setIsScrolled(window.scrollY > 50);
// // //     window.addEventListener("scroll", handleScroll);
// // //     return () => window.removeEventListener("scroll", handleScroll);
// // //   }, []);

// // //   const handleToggleMenu = () => {
// // //     if (isSearchPanelOpen) setIsSearchPanelOpen(false);
// // //     setIsMobileMenuOpen((prev) => !prev);
// // //   };

// // //   const handleToggleSearch = () => {
// // //     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
// // //     setIsSearchPanelOpen((prev) => !prev);
// // //   };

// // //   const handleClosePanels = () => {
// // //     setIsMobileMenuOpen(false);
// // //     setIsSearchPanelOpen(false);
// // //   };

// // //   const topOffsetDesktop = isScrolled
// // //     ? HEADER_HEIGHT_DESKTOP
// // //     : DESKTOP_UNSCROLLED_HEIGHT;

// // //   return (
// // //     <div className="bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
// // //       <style>{`
// // //         :root {
// // //             --header-height-unscrolled: ${MOBILE_UNSCROLLED_HEIGHT}px;
// // //             --header-height-scrolled: ${HEADER_HEIGHT_MOBILE}px;
// // //         }
// // //         @media (min-width: 768px) {
// // //             :root {
// // //                 --header-height-unscrolled: ${DESKTOP_UNSCROLLED_HEIGHT}px;
// // //                 --header-height-scrolled: ${HEADER_HEIGHT_DESKTOP}px;
// // //             }
// // //         }
// // //       `}</style>

// // //       {/* Fixed Headers */}
// // //       <div
// // //         className="fixed top-0 w-full z-40 bg-white dark:bg-gray-900 shadow-sm"
// // //         style={{
// // //           transform: isScrolled
// // //             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
// // //             : "translateY(0)",
// // //           transition: "transform 0.3s ease-out",
// // //         }}
// // //       >
// // //         <TopActionBar />
// // //         <NewHeader
// // //           categories={categories}
// // //           onMenuClick={handleToggleMenu}
// // //           searchSuggestions={searchSuggestions}
// // //         />
// // //         <SecondaryNavBar isVisible={!isScrolled} />
// // //       </div>

// // //       <div
// // //         className="hidden lg:flex fixed left-0 z-30 transition-all duration-300 ease-out"
// // //         style={{
// // //           top: `${topOffsetDesktop}px`,
// // //           height: `calc(100vh - ${topOffsetDesktop}px)`,
// // //         }}
// // //         onMouseLeave={() => setHoveredCategory(null)}
// // //       >
// // //         <NewSidebar
// // //           categories={categories}
// // //           onCategoryHover={setHoveredCategory}
// // //         />
// // //         <div className="absolute left-16 top-0 h-full">
// // //           <MegaMenu category={hoveredCategory} />
// // //         </div>
// // //       </div>
// // //       <NewRightDock topOffset={topOffsetDesktop} />

// // //       {/* Mobile Panels */}
// // //       <MobileMenu
// // //         categories={categories}
// // //         isOpen={isMobileMenuOpen}
// // //         onClose={handleClosePanels}
// // //       />
// // //       <SearchPanel
// // //         isOpen={isSearchPanelOpen}
// // //         onClose={handleClosePanels}
// // //         trendingKeywords={searchSuggestions.trendingKeywords}
// // //         popularCategories={searchSuggestions.popularCategories}
// // //       />
// // //       <BottomNav
// // //         onCategoriesClick={handleToggleMenu}
// // //         onSearchClick={handleToggleSearch}
// // //       />

// // //       {/* Main Content */}
// // //       <div className="relative flex flex-col min-h-screen">
// // //         <main
// // //           className="grow transition-all duration-300 ease-out lg:pl-16 lg:pr-16 pb-20 md:pb-0"
// // //           style={{
// // //             paddingTop: isScrolled
// // //               ? `var(--header-height-scrolled)`
// // //               : `var(--header-height-unscrolled)`,
// // //           }}
// // //         >
// // //           {children}
// // //         </main>
// // //         {/* --- DATA IS PASSED TO THE FOOTER --- */}
// // //         <MainFooter settings={globalSettings} />
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // "use client";

// // import { useState, useEffect, ReactNode } from "react";
// // import { SanityCategory } from "@/sanity/types/product_types";
// // import NewSidebar from "./NewSidebar";
// // import NewHeader from "./NewHeader";
// // import NewRightDock from "./NewRightDock";
// // import MainFooter from "./Footer";
// // import MegaMenu from "./MegaMenu";
// // import TopActionBar from "@/app/components/ui/ActionBar";
// // import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// // import BottomNav from "./BottomMobileNav";
// // import MobileMenu from "./MobileMenu";
// // import SearchPanel from "../ui/MobileSearchPanel";
// // // === THE FIX IS HERE: Use 'import type' ===
// // import type { GlobalSettings } from "@/sanity/lib/queries";
// // import BackToTopButton from "../ui/BackToTopButton";

// // // --- INTERFACES ---
// // interface SearchSuggestions {
// //   trendingKeywords: string[];
// //   popularCategories: SanityCategory[];
// // }

// // interface MainLayoutClientProps {
// //   categories: SanityCategory[];
// //   children: ReactNode;
// //   searchSuggestions: SearchSuggestions;
// //   globalSettings: GlobalSettings;
// // }

// // // === DIMENSIONS CONFIGURATION ===
// // const TOP_ACTION_BAR_HEIGHT = 18;
// // const HEADER_HEIGHT_DESKTOP = 84;
// // const HEADER_HEIGHT_MOBILE = 72;
// // const SECONDARY_NAV_HEIGHT = 40;

// // const DESKTOP_UNSCROLLED_HEIGHT =
// //   TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// // const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;

// // export default function MainLayoutClient({
// //   categories,
// //   children,
// //   searchSuggestions,
// //   globalSettings,
// // }: MainLayoutClientProps) {
// //   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(
// //     null
// //   );
// //   const [isScrolled, setIsScrolled] = useState(false);
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

// //   useEffect(() => {
// //     const handleScroll = () => setIsScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   const handleToggleMenu = () => {
// //     if (isSearchPanelOpen) setIsSearchPanelOpen(false);
// //     setIsMobileMenuOpen((prev) => !prev);
// //   };

// //   const handleToggleSearch = () => {
// //     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
// //     setIsSearchPanelOpen((prev) => !prev);
// //   };

// //   const handleClosePanels = () => {
// //     setIsMobileMenuOpen(false);
// //     setIsSearchPanelOpen(false);
// //   };

// //   const topOffsetDesktop = isScrolled
// //     ? HEADER_HEIGHT_DESKTOP
// //     : DESKTOP_UNSCROLLED_HEIGHT;

// //   return (
// //     <div className="bg-gray-50 dark:bg-gray-950 overflow-x-hidden min-h-screen flex flex-col">
// //       <style>{`
// //         :root {
// //             --header-height-unscrolled: ${MOBILE_UNSCROLLED_HEIGHT}px;
// //             --header-height-scrolled: ${HEADER_HEIGHT_MOBILE}px;
// //         }
// //         @media (min-width: 768px) {
// //             :root {
// //                 --header-height-unscrolled: ${DESKTOP_UNSCROLLED_HEIGHT}px;
// //                 --header-height-scrolled: ${HEADER_HEIGHT_DESKTOP}px;
// //             }
// //         }
// //       `}</style>

// //       {/* === FIXED HEADER STACK === */}
// //       <div
// //         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out"
// //         style={{
// //           transform: isScrolled
// //             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
// //             : "translateY(0)",
// //         }}
// //       >
// //         {/* Dynamic Data passed here */}
// //         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

// //         <NewHeader
// //           categories={categories}
// //           onMenuClick={handleToggleMenu}
// //           searchSuggestions={searchSuggestions}
// //         />

// //         <div
// //           className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}
// //         >
// //           {/* 🔥 UPDATE: PASSING THE MENU CLICK HANDLER HERE */}
// //            <SecondaryNavBar 
// //               isVisible={!isScrolled} 
// //               links={globalSettings?.secondaryNavLinks}
// //               onCategoryClick={handleToggleMenu}
// //            />
// //         </div>
// //       </div>

// //       {/* === LEFT SIDEBAR (DESKTOP ONLY) === */}
// //       <div
// //         className="hidden lg:flex fixed left-0 z-30 transition-all duration-300 ease-out"
// //         style={{
// //           top: `${topOffsetDesktop}px`,
// //           height: `calc(100vh - ${topOffsetDesktop}px)`,
// //         }}
// //         onMouseLeave={() => setHoveredCategory(null)}
// //       >
// //         <NewSidebar
// //           categories={categories}
// //           onCategoryHover={setHoveredCategory}
// //         />
// //         <div className="absolute left-16 top-0 h-full">
// //           <MegaMenu category={hoveredCategory} />
// //         </div>
// //       </div>

// //       {/* === RIGHT DOCK (DESKTOP ONLY) === */}
// //       <NewRightDock topOffset={topOffsetDesktop} />

// //       {/* === MOBILE PANELS & NAV === */}
// //       <MobileMenu
// //         categories={categories}
// //         isOpen={isMobileMenuOpen}
// //         onClose={handleClosePanels}
// //       />
// //       <SearchPanel
// //         isOpen={isSearchPanelOpen}
// //         onClose={handleClosePanels}
// //         trendingKeywords={searchSuggestions.trendingKeywords}
// //         popularCategories={searchSuggestions.popularCategories}
// //       />
// //       <BottomNav
// //         onCategoriesClick={handleToggleMenu}
// //         onSearchClick={handleToggleSearch}
// //       />

// //       {/* === MAIN CONTENT AREA === */}
// //       <div className="relative flex flex-col min-h-screen w-full">
// //         <main
// //           className="grow transition-all duration-300 ease-out lg:pl-16 lg:pr-16 pb-24 md:pb-0"
// //           style={{
// //             paddingTop: isScrolled
// //               ? `var(--header-height-scrolled)`
// //               : `var(--header-height-unscrolled)`,
// //           }}
// //         >
// //           {children}
// //         </main>
// //  {/* 🔥 GLOBAL BACK TO TOP BUTTON (Visible on all screens) */}
// //     <div className="fixed bottom-20 right-4 z-40 lg:hidden">
// //         <BackToTopButton /> 
// //     </div>

// //         <div className="lg:pl-16 lg:pr-16 pb-20 md:pb-0">
// //           <MainFooter settings={globalSettings} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // "use client";

// // import { useState, useEffect, ReactNode } from "react";
// // import { usePathname } from "next/navigation";
// // import { SanityCategory } from "@/sanity/types/product_types";
// // import NewSidebar from "./NewSidebar";
// // import NewHeader from "./NewHeader";
// // import NewRightDock from "./NewRightDock";
// // import MainFooter from "./Footer";
// // import MegaMenu from "./MegaMenu";
// // import TopActionBar from "@/app/components/ui/ActionBar";
// // import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// // import BottomNav from "./BottomMobileNav";
// // import MobileMenu from "./MobileMenu";
// // import SearchPanel from "../ui/MobileSearchPanel";
// // import MobileProfileSidebar from "./MobileProfileSidebar"; 
// // import type { GlobalSettings } from "@/sanity/lib/queries";
// // import BackToTopButton from "../ui/BackToTopButton";
// // import { useStateContext } from "@/app/context/StateContext";

// // interface SearchSuggestions {
// //   trendingKeywords: string[];
// //   popularCategories: SanityCategory[];
// // }

// // interface MainLayoutClientProps {
// //   categories: SanityCategory[];
// //   children: ReactNode;
// //   searchSuggestions: SearchSuggestions;
// //   globalSettings: GlobalSettings;
// // }
// // const TOP_ACTION_BAR_HEIGHT = 18;
// // const HEADER_HEIGHT_DESKTOP = 87;
// // const HEADER_HEIGHT_MOBILE = 70;
// // const SECONDARY_NAV_HEIGHT = 40;
// // // // Heights Configuration
// // // const TOP_ACTION_BAR_HEIGHT = 18; // Matches Action Bar Height
// // // const HEADER_HEIGHT_DESKTOP = 88; // Matches NewHeader Desktop Height
// // // const HEADER_HEIGHT_MOBILE = 80;   // Matches NewHeader Mobile Height
// // // const SECONDARY_NAV_HEIGHT = 40;   // Matches Secondary Nav

// // // Calculations
// // const DESKTOP_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// // const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;

// // export default function MainLayoutClient({
// //   categories,
// //   children,
// //   searchSuggestions,
// //   globalSettings,
// // }: MainLayoutClientProps) {
// //   const pathname = usePathname();
// //   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
// //   const [isScrolled, setIsScrolled] = useState(false);
  
// //   // Local UI States
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
// //   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

// //   // Check if current page is Checkout
// //   const isCheckoutPage = pathname?.startsWith("/checkout");

// //   // === ⚡ PERFORMANCE OPTIMIZED SCROLL LISTENER ===
// //   useEffect(() => {
// //     let ticking = false;
    
// //     const handleScroll = () => {
// //       if (!ticking) {
// //         window.requestAnimationFrame(() => {
// //           setIsScrolled(window.scrollY > 50);
// //           ticking = false;
// //         });
// //         ticking = true;
// //       }
// //     };

// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   const closeAllPanels = () => {
// //     setIsMobileMenuOpen(false);
// //     setIsSearchPanelOpen(false);
// //     setIsProfileSidebarOpen(false);
// //     if (typeof window !== 'undefined') {
// //         window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
// //     }
// //   };

// //   const handleToggleMenu = () => {
// //     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
// //     else { closeAllPanels(); setIsMobileMenuOpen(true); }
// //   };

// //   const handleToggleSearch = () => {
// //     if (isSearchPanelOpen) setIsSearchPanelOpen(false);
// //     else { closeAllPanels(); setIsSearchPanelOpen(true); }
// //   };

// //   const handleToggleProfile = () => {
// //      if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
// //      else { closeAllPanels(); setIsProfileSidebarOpen(true); }
// //   };

// //   const topOffsetDesktop = isScrolled ? HEADER_HEIGHT_DESKTOP : DESKTOP_UNSCROLLED_HEIGHT;

// //   // === CLEAN LAYOUT FOR CHECKOUT ===
// //   if (isCheckoutPage) {
// //       return (
// //           <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
// //               {children}
// //           </div>
// //       );
// //   }

// //   // === MAIN LAYOUT ===
// //   return (
// //     <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
      
// //       {/* CSS Variables for smooth padding calculation */}
// //       <style>{`
// //         :root {
// //             --header-height-unscrolled: ${MOBILE_UNSCROLLED_HEIGHT}px;
// //             --header-height-scrolled: ${HEADER_HEIGHT_MOBILE}px;
// //         }
// //         @media (min-width: 768px) {
// //             :root {
// //                 --header-height-unscrolled: ${DESKTOP_UNSCROLLED_HEIGHT}px;
// //                 --header-height-scrolled: ${HEADER_HEIGHT_DESKTOP}px;
// //             }
// //         }
// //       `}</style>

// //       {/* HEADER STACK (Fixed Top) */}
// //       <div
// //         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
// //         style={{
// //           transform: isScrolled
// //             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
// //             : "translateY(0)",
// //         }}
// //       >
// //         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

// //         <NewHeader
// //           categories={categories}
// //           onMenuClick={handleToggleMenu}
// //           searchSuggestions={searchSuggestions}
// //         />

// //         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
// //            <SecondaryNavBar 
// //               isVisible={!isScrolled} 
// //               links={globalSettings?.secondaryNavLinks}
// //               onCategoryClick={handleToggleMenu}
// //            />
// //         </div>
// //       </div>

// //       {/* SIDEBARS (Desktop) */}
// //       <div 
// //         className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]" 
// //         style={{ top: `${topOffsetDesktop}px`, height: `calc(100vh - ${topOffsetDesktop}px)` }} 
// //         onMouseLeave={() => setHoveredCategory(null)}
// //       >
// //         <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
// //         <div className="absolute left-16 top-0 h-full"><MegaMenu category={hoveredCategory} /></div>
// //       </div>
      
// //       <NewRightDock topOffset={topOffsetDesktop} />

// //       {/* MOBILE DRAWERS */}
// //       <MobileMenu categories={categories} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
// //       <MobileProfileSidebar isOpen={isProfileSidebarOpen} onClose={() => setIsProfileSidebarOpen(false)} />
// //       <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} trendingKeywords={searchSuggestions.trendingKeywords} popularCategories={searchSuggestions.popularCategories} />
      
// //       <BottomNav onCategoriesClick={handleToggleMenu} onSearchClick={handleToggleSearch} onProfileClick={handleToggleProfile} />

// //       {/* === MAIN CONTENT AREA === */}
// //       <div className="relative flex flex-col min-h-screen w-full">
        
// //         {/* 
// //             🔥 CLS FIX APPLIED HERE:
// //             1. transition-[padding-top]: Smooths the jump.
// //             2. will-change-[padding-top]: Optimizes rendering.
// //             3. duration-300: Syncs with Header animation.
// //         */}
// //         <main
// //           className="grow transition-[padding-top] duration-300 ease-out will-change-[padding-top] lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]"
// //           style={{ paddingTop: isScrolled ? `var(--header-height-scrolled)` : `var(--header-height-unscrolled)` }}
// //         >
// //           {children}
// //         </main>
        
// //         {/* Global Back To Top (Positioned above Bottom Nav) */}
// //         <div className="fixed bottom-24 right-4 z-30 lg:hidden">
// //             <BackToTopButton /> 
// //         </div>

// //         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
// //           <MainFooter settings={globalSettings} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useEffect, ReactNode } from "react";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/sanity/types/product_types";
// import NewSidebar from "./NewSidebar";
// import NewHeader from "./NewHeader";
// import NewRightDock from "./NewRightDock";
// import MainFooter from "./Footer";
// import MegaMenu from "./MegaMenu";
// import TopActionBar from "@/app/components/ui/ActionBar";
// import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// import BottomNav from "./BottomMobileNav";
// import MobileMenu from "./MobileMenu";
// import SearchPanel from "../ui/MobileSearchPanel";
// import MobileProfileSidebar from "./MobileProfileSidebar"; 
// import type { GlobalSettings } from "@/sanity/lib/queries";
// import BackToTopButton from "../ui/BackToTopButton";
// import ScrollToTop from "../ui/ScrollToTop"; // ✅ Import karein
// // import { useStateContext } from "@/app/context/StateContext"; // Unused import removed

// interface SearchSuggestions {
//   trendingKeywords: string[];
//   popularCategories: SanityCategory[];
// }

// interface MainLayoutClientProps {
//   categories: SanityCategory[];
//   children: ReactNode;
//   searchSuggestions: SearchSuggestions;
//   globalSettings: GlobalSettings;
// }

// const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const HEADER_HEIGHT_MOBILE = 70;
// const SECONDARY_NAV_HEIGHT = 40;

// const DESKTOP_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;
// const HEADER_HEIGHT_SCROLLED_DESKTOP = HEADER_HEIGHT_DESKTOP;
// const HEADER_HEIGHT_SCROLLED_MOBILE = HEADER_HEIGHT_MOBILE;


// export default function MainLayoutClient({
//   categories,
//   children,
//   searchSuggestions,
//   globalSettings,
// }: MainLayoutClientProps) {
//   const pathname = usePathname();
//   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobile, setIsMobile] = useState(false); // ✅ NEW: State for Mobile/Desktop status
  
//   // Local UI States
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
//   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

//   // Check if current page is Checkout
//   const isCheckoutPage = pathname?.startsWith("/checkout");

//   // ✅ FIX 1: Set Mobile/Desktop status and listen to resize
//   useEffect(() => {
//     const checkMobile = () => {
//       // isMobile will be true if window width < 768px
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile(); // Initial check
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // === ⚡ PERFORMANCE OPTIMIZED SCROLL LISTENER ===
//   useEffect(() => {
//     // Initial scroll check (for a faster paint)
//     setIsScrolled(window.scrollY > 50);

//     let ticking = false;
    
//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           const newScrolled = window.scrollY > 50;
//           if (newScrolled !== isScrolled) {
//             setIsScrolled(newScrolled);
//           }
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isScrolled]); // isScrolled dependency is key for the state change check

//   const closeAllPanels = () => {
//     setIsMobileMenuOpen(false);
//     setIsSearchPanelOpen(false);
//     setIsProfileSidebarOpen(false);
//     if (typeof window !== 'undefined') {
//         window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
//     }
//   };

//   const handleToggleMenu = () => {
//     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
//     else { closeAllPanels(); setIsMobileMenuOpen(true); }
//   };

//   const handleToggleSearch = () => {
//     if (isSearchPanelOpen) setIsSearchPanelOpen(false);
//     else { closeAllPanels(); setIsSearchPanelOpen(true); }
//   };

//   const handleToggleProfile = () => {
//      if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
//      else { closeAllPanels(); setIsProfileSidebarOpen(true); }
//   };

//   const topOffsetDesktop = isScrolled ? HEADER_HEIGHT_SCROLLED_DESKTOP : DESKTOP_UNSCROLLED_HEIGHT;

//   // ✅ FIX 2 & 3: Calculate current height dynamically using JS state (for no CSS errors)
//   const currentUnscrolledHeight = isMobile ? MOBILE_UNSCROLLED_HEIGHT : DESKTOP_UNSCROLLED_HEIGHT;
//   const currentScrolledHeight = isMobile ? HEADER_HEIGHT_SCROLLED_MOBILE : HEADER_HEIGHT_SCROLLED_DESKTOP;
  
//   const contentPaddingTop = isScrolled
//     ? currentScrolledHeight
//     : currentUnscrolledHeight;
    
//   // === CLEAN LAYOUT FOR CHECKOUT ===
//   if (isCheckoutPage) {
//       return (
//           <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
//               {children}
//           </div>
//       );
//   }

//   // === MAIN LAYOUT ===
//   return (
//     <div 
//       className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col"
//       // ✅ FIX 4: No more <style> tag or unsupported inline media queries.
//     >
//         <ScrollToTop /> {/* ✅ NEW: ScrollToTop component added */}
//       {/* HEADER STACK (Fixed Top) */}
//       <div
//         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
//         style={{
//           transform: isScrolled
//             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
//             : "translateY(0)",
//         }}
//       >
//         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

//         <NewHeader
//           categories={categories}
//           onMenuClick={handleToggleMenu}
//           searchSuggestions={searchSuggestions}
//         />

//         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
//            <SecondaryNavBar 
//               isVisible={!isScrolled} 
//               links={globalSettings?.secondaryNavLinks}
//               onCategoryClick={handleToggleMenu}
//            />
//         </div>
//       </div>

//       {/* SIDEBARS (Desktop) */}
//       <div 
//         className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]" 
//         style={{ top: `${topOffsetDesktop}px`, height: `calc(100vh - ${topOffsetDesktop}px)` }} 
//         onMouseLeave={() => setHoveredCategory(null)}
//       >
//         <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
//         <div className="absolute left-16 top-0 h-full"><MegaMenu category={hoveredCategory} /></div>
//       </div>
      
//       <NewRightDock topOffset={topOffsetDesktop} />

//       {/* MOBILE DRAWERS */}
//       <MobileMenu categories={categories} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
//       <MobileProfileSidebar isOpen={isProfileSidebarOpen} onClose={() => setIsProfileSidebarOpen(false)} />
//       <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} trendingKeywords={searchSuggestions.trendingKeywords} popularCategories={searchSuggestions.popularCategories} />
      
//       <BottomNav onCategoriesClick={handleToggleMenu} onSearchClick={handleToggleSearch} onProfileClick={handleToggleProfile} />

//       {/* === MAIN CONTENT AREA === */}
//       <div className="relative flex flex-col min-h-screen w-full">
        
//         <main
//           className="grow transition-[padding-top] duration-300 ease-out will-change-[padding-top] lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]"
//           style={{ paddingTop: `${contentPaddingTop}px` }} // ✅ Dynamic padding-top from JS
//         >
//           {children}
//         </main>
        
//         {/* Global Back To Top (Positioned above Bottom Nav) */}
//         <div className="fixed bottom-24 right-4 z-30 lg:hidden">
//             <BackToTopButton /> 
//         </div>

//         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
//           <MainFooter settings={globalSettings} />
//         </div>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // import { useState, useEffect, ReactNode } from "react";
// // import { usePathname } from "next/navigation"; // 🔥 IMPORT THIS
// // import { SanityCategory } from "@/sanity/types/product_types";
// // import NewSidebar from "./NewSidebar";
// // import NewHeader from "./NewHeader";
// // import NewRightDock from "./NewRightDock";
// // import MainFooter from "./Footer";
// // import MegaMenu from "./MegaMenu";
// // import TopActionBar from "@/app/components/ui/ActionBar";
// // import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// // import BottomNav from "./BottomMobileNav";
// // import MobileMenu from "./MobileMenu";
// // import SearchPanel from "../ui/MobileSearchPanel";
// // import MobileProfileSidebar from "./MobileProfileSidebar"; 
// // import type { GlobalSettings } from "@/sanity/lib/queries";
// // import BackToTopButton from "../ui/BackToTopButton";

// // interface SearchSuggestions {
// //   trendingKeywords: string[];
// //   popularCategories: SanityCategory[];
// // }

// // interface MainLayoutClientProps {
// //   categories: SanityCategory[];
// //   children: ReactNode;
// //   searchSuggestions: SearchSuggestions;
// //   globalSettings: GlobalSettings;
// // }

// // const TOP_ACTION_BAR_HEIGHT = 18;
// // const HEADER_HEIGHT_DESKTOP = 87;
// // const HEADER_HEIGHT_MOBILE = 70;
// // const SECONDARY_NAV_HEIGHT = 40;



// // const DESKTOP_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// // const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;

// // export default function MainLayoutClient({
// //   categories,
// //   children,
// //   searchSuggestions,
// //   globalSettings,
// // }: MainLayoutClientProps) {
// //   const pathname = usePathname(); // 🔥 GET CURRENT PATH
// //   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
// //   const [isScrolled, setIsScrolled] = useState(false);
  
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
// //   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

// //   // 🔥 CHECKOUT DETECTION
// //   // Agar URL mein '/checkout' hai, to hum Header/Footer/Nav ko hide kar denge
// //   const isCheckoutPage = pathname?.startsWith("/checkout");

// //   useEffect(() => {
// //     const handleScroll = () => setIsScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   const closeAllPanels = () => {
// //     setIsMobileMenuOpen(false);
// //     setIsSearchPanelOpen(false);
// //     setIsProfileSidebarOpen(false);
// //     if (typeof window !== 'undefined') {
// //         window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
// //     }
// //   };

// //   const handleToggleMenu = () => {
// //     if (isMobileMenuOpen) setIsMobileMenuOpen(false);
// //     else { closeAllPanels(); setIsMobileMenuOpen(true); }
// //   };

// //   const handleToggleSearch = () => {
// //     if (isSearchPanelOpen) setIsSearchPanelOpen(false);
// //     else { closeAllPanels(); setIsSearchPanelOpen(true); }
// //   };

// //   const handleToggleProfile = () => {
// //      if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
// //      else { closeAllPanels(); setIsProfileSidebarOpen(true); }
// //   };

// //   const topOffsetDesktop = isScrolled ? HEADER_HEIGHT_DESKTOP : DESKTOP_UNSCROLLED_HEIGHT;

// //   // === 🔥 CLEAN LAYOUT FOR CHECKOUT PAGE 🔥 ===
// //   if (isCheckoutPage) {
// //       return (
// //           <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
// //               {children}
// //           </div>
// //       );
// //   }

// //   // === NORMAL LAYOUT FOR OTHER PAGES ===
// //   return (
// //     <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
// //       <style>{`
// //         :root {
// //             --header-height-unscrolled: ${MOBILE_UNSCROLLED_HEIGHT}px;
// //             --header-height-scrolled: ${HEADER_HEIGHT_MOBILE}px;
// //         }
// //         @media (min-width: 768px) {
// //             :root {
// //                 --header-height-unscrolled: ${DESKTOP_UNSCROLLED_HEIGHT}px;
// //                 --header-height-scrolled: ${HEADER_HEIGHT_DESKTOP}px;
// //             }
// //         }
// //       `}</style>

// //       {/* HEADER STACK */}
// //       <div
// //         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out"
// //         style={{
// //           transform: isScrolled
// //             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
// //             : "translateY(0)",
// //         }}
// //       >
// //         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

// //         <NewHeader
// //           categories={categories}
// //           onMenuClick={handleToggleMenu}
// //           searchSuggestions={searchSuggestions}
// //         />

// //         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
// //            <SecondaryNavBar 
// //               isVisible={!isScrolled} 
// //               links={globalSettings?.secondaryNavLinks}
// //               onCategoryClick={handleToggleMenu}
// //            />
// //         </div>
// //       </div>

// //       {/* SIDEBARS & MENUS */}
// //       <div className="hidden lg:flex fixed left-0 z-30 transition-all duration-300 ease-out" style={{ top: `${topOffsetDesktop}px`, height: `calc(100vh - ${topOffsetDesktop}px)` }} onMouseLeave={() => setHoveredCategory(null)}>
// //         <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
// //         <div className="absolute left-16 top-0 h-full"><MegaMenu category={hoveredCategory} /></div>
// //       </div>
// //       <NewRightDock topOffset={topOffsetDesktop} />

// //       <MobileMenu categories={categories} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
// //       <MobileProfileSidebar isOpen={isProfileSidebarOpen} onClose={() => setIsProfileSidebarOpen(false)} />
// //       <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} trendingKeywords={searchSuggestions.trendingKeywords} popularCategories={searchSuggestions.popularCategories} />
      
// //       <BottomNav onCategoriesClick={handleToggleMenu} onSearchClick={handleToggleSearch} onProfileClick={handleToggleProfile} />

// //       {/* MAIN CONTENT */}
// //       <div className="relative flex flex-col min-h-screen w-full">
// //         <main
// //           className="grow transition-all duration-300 ease-out lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]"
// //           style={{ paddingTop: isScrolled ? `var(--header-height-scrolled)` : `var(--header-height-unscrolled)` }}
// //         >
// //           {children}
// //         </main>
        
// //         <div className="fixed bottom-34 right-4 z-40 lg:hidden">
// //             <BackToTopButton /> 
// //         </div>

// //         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
// //           <MainFooter settings={globalSettings} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // "use client";

// // import { useState, useEffect, ReactNode } from "react";
// // import { SanityCategory } from "@/sanity/types/product_types";
// // import NewSidebar from "./NewSidebar";
// // import NewHeader from "./NewHeader";
// // import NewRightDock from "./NewRightDock";
// // import MainFooter from "./Footer";
// // import MegaMenu from "./MegaMenu";
// // import TopActionBar from "@/app/components/ui/ActionBar";
// // import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// // import BottomNav from "./BottomMobileNav";
// // import MobileMenu from "./MobileMenu";
// // import SearchPanel from "../ui/MobileSearchPanel";
// // import MobileProfileSidebar from "./MobileProfileSidebar"; 
// // import type { GlobalSettings } from "@/sanity/lib/queries";
// // import BackToTopButton from "../ui/BackToTopButton";

// // // Interfaces
// // interface SearchSuggestions {
// //   trendingKeywords: string[];
// //   popularCategories: SanityCategory[];
// // }

// // interface MainLayoutClientProps {
// //   categories: SanityCategory[];
// //   children: ReactNode;
// //   searchSuggestions: SearchSuggestions;
// //   globalSettings: GlobalSettings;
// // }

// // // Dimensions
// // const TOP_ACTION_BAR_HEIGHT = 28;
// // const HEADER_HEIGHT_DESKTOP = 112;
// // const HEADER_HEIGHT_MOBILE = 80;
// // const SECONDARY_NAV_HEIGHT = 40;

// // const DESKTOP_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
// // const MOBILE_UNSCROLLED_HEIGHT = TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_MOBILE;

// // export default function MainLayoutClient({
// //   categories,
// //   children,
// //   searchSuggestions,
// //   globalSettings,
// // }: MainLayoutClientProps) {
// //   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
// //   const [isScrolled, setIsScrolled] = useState(false);
  
// //   // === ALL LOCAL STATES (FAST PERFORMANCE) ===
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
// //   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false); // 🔥 Now Local

// //   useEffect(() => {
// //     const handleScroll = () => setIsScrolled(window.scrollY > 50);
// //     window.addEventListener("scroll", handleScroll);
// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   // === CLOSE ALL PANELS HELPER ===
// //   const closeAllPanels = () => {
// //     setIsMobileMenuOpen(false);
// //     setIsSearchPanelOpen(false);
// //     setIsProfileSidebarOpen(false);
// //       // Dispatch Event to close Filter Sidebar (if open)
// //     if (typeof window !== 'undefined') {
// //         window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
// //     }
// //   };

// //   // 1. Toggle Catalog (Menu)
// //   const handleToggleMenu = () => {
// //     if (isMobileMenuOpen) {
// //        setIsMobileMenuOpen(false);
// //     } else {
// //        closeAllPanels();
// //        setIsMobileMenuOpen(true);
// //     }
// //   };

// //   // 2. Toggle Search
// //   const handleToggleSearch = () => {
// //     if (isSearchPanelOpen) {
// //        setIsSearchPanelOpen(false);
// //     } else {
// //        closeAllPanels();
// //        setIsSearchPanelOpen(true);
// //     }
// //   };

// //   // 3. Toggle Profile (Fast Local State)
// //   const handleToggleProfile = () => {
// //      if (isProfileSidebarOpen) {
// //         setIsProfileSidebarOpen(false);
// //      } else {
// //         closeAllPanels();
// //         setIsProfileSidebarOpen(true);
// //      }
// //   };

// //   const topOffsetDesktop = isScrolled ? HEADER_HEIGHT_DESKTOP : DESKTOP_UNSCROLLED_HEIGHT;

// //   return (
// //     <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
// //       <style>{`
// //         :root {
// //             --header-height-unscrolled: ${MOBILE_UNSCROLLED_HEIGHT}px;
// //             --header-height-scrolled: ${HEADER_HEIGHT_MOBILE}px;
// //         }
// //         @media (min-width: 768px) {
// //             :root {
// //                 --header-height-unscrolled: ${DESKTOP_UNSCROLLED_HEIGHT}px;
// //                 --header-height-scrolled: ${HEADER_HEIGHT_DESKTOP}px;
// //             }
// //         }
// //       `}</style>

// //       {/* HEADER STACK */}
// //       <div
// //         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out"
// //         style={{
// //           transform: isScrolled
// //             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
// //             : "translateY(0)",
// //         }}
// //       >
// //         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

// //         <NewHeader
// //           categories={categories}
// //           onMenuClick={handleToggleMenu}
// //           searchSuggestions={searchSuggestions}
// //         />

// //         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
// //            <SecondaryNavBar 
// //               isVisible={!isScrolled} 
// //               links={globalSettings?.secondaryNavLinks}
// //               onCategoryClick={handleToggleMenu}
// //            />
// //         </div>
// //       </div>

// //       {/* DESKTOP SIDEBAR & DOCK */}
// //       <div className="hidden lg:flex fixed left-0 z-30 transition-all duration-300 ease-out" style={{ top: `${topOffsetDesktop}px`, height: `calc(100vh - ${topOffsetDesktop}px)` }} onMouseLeave={() => setHoveredCategory(null)}>
// //         <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
// //         <div className="absolute left-16 top-0 h-full"><MegaMenu category={hoveredCategory} /></div>
// //       </div>
// //       <NewRightDock topOffset={topOffsetDesktop} />

// //       {/* === MOBILE PANELS (All Props Passed) === */}
// //       <MobileMenu
// //         categories={categories}
// //         isOpen={isMobileMenuOpen}
// //         onClose={() => setIsMobileMenuOpen(false)}
// //       />
      
// //       {/* 🔥 DIRECT PROPS PASSING */}
// //       <MobileProfileSidebar 
// //           isOpen={isProfileSidebarOpen}
// //           onClose={() => setIsProfileSidebarOpen(false)}
// //       />

// //       <SearchPanel
// //         isOpen={isSearchPanelOpen}
// //         onClose={() => setIsSearchPanelOpen(false)}
// //         trendingKeywords={searchSuggestions.trendingKeywords}
// //         popularCategories={searchSuggestions.popularCategories}
// //       />
      
// //       {/* === BOTTOM NAV === */}
// //       <BottomNav
// //         onCategoriesClick={handleToggleMenu}
// //         onSearchClick={handleToggleSearch}
// //         onProfileClick={handleToggleProfile}
// //       />

// //       {/* MAIN CONTENT */}
// //       <div className="relative flex flex-col min-h-screen w-full">
// //         <main
// //           className="grow transition-all duration-300 ease-out lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]"
// //           style={{ paddingTop: isScrolled ? `var(--header-height-scrolled)` : `var(--header-height-unscrolled)` }}
// //         >
// //           {children}
// //         </main>
        
// //         <div className="fixed bottom-24 right-4 z-40 lg:hidden">
// //             <BackToTopButton /> 
// //         </div>

// //         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
// //           <MainFooter settings={globalSettings} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// src/app/components/layout/MainLayoutClient.tsx

"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SanityCategory } from "@/sanity/types/product_types";
import NewSidebar from "./NewSidebar";
import NewHeader from "./NewHeader";
import NewRightDock from "./NewRightDock";
import MainFooter from "./Footer";
import MegaMenu from "./MegaMenu";
import TopActionBar from "@/app/components/ui/ActionBar";
import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
import BottomNav from "./BottomMobileNav";
import MobileMenu from "./MobileMenu";
import SearchPanel from "../ui/MobileSearchPanel";
import MobileProfileSidebar from "./MobileProfileSidebar"; 
import type { GlobalSettings } from "@/sanity/lib/queries";
import BackToTopButton from "../ui/BackToTopButton";
import ScrollToTop from "../ui/ScrollToTop"; 

interface SearchSuggestions {
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}

interface MainLayoutClientProps {
  categories: SanityCategory[];
  children: ReactNode;
  searchSuggestions: SearchSuggestions;
  globalSettings: GlobalSettings;
}

// CONSTANTS (Reference ke liye)
const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const HEADER_HEIGHT_MOBILE = 70;
// const SECONDARY_NAV_HEIGHT = 40;

const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

export default function MainLayoutClient({
  categories,
  children,
  searchSuggestions,
  globalSettings,
}: MainLayoutClientProps) {
  const pathname = usePathname();
  const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
   // 🔥 FIX 1: isMobile state ko wapas layein aur shuru mein 'null' rakhein
  const [isMobile, setIsMobile] = useState<boolean | null>(null); 
  // Local UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Check if current page is Checkout
  const isCheckoutPage = pathname?.startsWith("/checkout");

  // === SCROLL LISTENER ===
  useEffect(() => {
    setIsScrolled(window.scrollY > 50);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const newScrolled = window.scrollY > 50;
          if (newScrolled !== isScrolled) {
            setIsScrolled(newScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  
  // 🔥 FIX 2: Check Mobile status on mount
  useEffect(() => {
    // isMobile will be true if window width < 768px
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); 
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // [] is important here to run only once


  const closeAllPanels = () => {
    setIsMobileMenuOpen(false);
    setIsSearchPanelOpen(false);
    setIsProfileSidebarOpen(false);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
    }
  };

  const handleToggleMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    else { closeAllPanels(); setIsMobileMenuOpen(true); }
  };

  const handleToggleSearch = () => {
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
    else { closeAllPanels(); setIsSearchPanelOpen(true); }
  };

  const handleToggleProfile = () => {
     if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
     else { closeAllPanels(); setIsProfileSidebarOpen(true); }
  };

  // ✅ Sidebar top offset calculation (Desktop Only)
  const topOffsetDesktop = isScrolled ? HEADER_HEIGHT_SCROLLED_DESKTOP : (18 + 87 + 40); // 145px

  if (isCheckoutPage) {
      return (
          <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
              {children}
          </div>
      );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
        <ScrollToTop />
        
      {/* HEADER STACK (Fixed Top) */}
      <div
        className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: isScrolled
            ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
            : "translateY(0)",
        }}
      >
        <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

        <NewHeader
          categories={categories}
          onMenuClick={handleToggleMenu}
          searchSuggestions={searchSuggestions}
        />

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
           <SecondaryNavBar 
              isVisible={!isScrolled} 
              links={globalSettings?.secondaryNavLinks}
              onCategoryClick={handleToggleMenu}
           />
        </div>
      </div>

      {/* SIDEBARS (Desktop) */}
      <div 
        className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]" 
        style={{ top: `${topOffsetDesktop}px`, height: `calc(100vh - ${topOffsetDesktop}px)` }} 
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
        <div className="absolute left-16 top-0 h-full"><MegaMenu category={hoveredCategory} /></div>
      </div>
      
      <NewRightDock topOffset={topOffsetDesktop} />

      {/* MOBILE DRAWERS */}
      <MobileMenu categories={categories} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <MobileProfileSidebar isOpen={isProfileSidebarOpen} onClose={() => setIsProfileSidebarOpen(false)} />
      <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} trendingKeywords={searchSuggestions.trendingKeywords} popularCategories={searchSuggestions.popularCategories} />
      
      <BottomNav onCategoriesClick={handleToggleMenu} onSearchClick={handleToggleSearch} onProfileClick={handleToggleProfile} />

      {/* === MAIN CONTENT AREA === */}
      <div className="relative flex flex-col min-h-screen w-full">
        
        
        <main
          className={`
            grow w-full
            transition-[padding-top] duration-300 ease-out will-change-[padding-top]
            lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
            ${isScrolled 
                ? "pt-17.5 lg:pt-21.75" 
                : "pt-22 lg:pt-36.25"
            }
          `}
        >
          {children}
        </main>
        
        {/* Global Back To Top */}
        <div>
            <BackToTopButton /> 
        </div>

        <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
            {/* 🔥 FIX 3: Pass isMobile prop here */}
          <MainFooter settings={globalSettings} isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
}