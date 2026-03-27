export interface GlobalSettings {
  siteName?: string;
  siteLogo?: any; // SanityImageObject ya URL string ho sakta hai
  storeContactEmail?: string;
  storePhoneNumber?: string;
  storeAddress?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  topBarAnnouncements?: string[];
  secondaryNavLinks?: {
    label: string;
    url: string;
    position: 'left' | 'right';
    isHighlight: boolean;
  }[];
  // 🔥 FIX: inventorySettings add kiya
  inventorySettings?: {
    lowStockThreshold?: number;
    alertRecipientEmail?: string;
  };
  // 🔥 FIX: searchSettings add kiya
  searchSettings?: {
    trendingKeywords?: string[];
    popularCategories?: {
      _id: string;
      name: string;
      slug: string;
      image?: string;
      parent?: any; // SanityCategory type ke mutabiq
      subCategories?: any[];
    }[];
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}