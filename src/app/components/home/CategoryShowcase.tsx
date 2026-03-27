
import { SanityCategory } from "@/sanity/types/product_types";
import CategoryCarousel from "./CategoryCarousel"; 
import MobileCategoryList from "./MobileCategoryList"; 

interface Props {
  title: string;
  categories: SanityCategory[];
}

export default function CategoryShowcase({ title, categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full py-4 md:py-8">
      
      {/* === MOBILE VIEW (No Changes) === */}
      <div className="md:hidden pt-2">
        <MobileCategoryList categories={categories} />
      </div>

      {/* === DESKTOP VIEW (YAHAN CHANGE HAI) === */}
      <div className="hidden md:block px-8">
        
        {/* 🔥 FIX: Is div ko center karne ke liye 'text-center' class add ki gayi hai */}
        <div className="mb-8 text-center">
            
            {/* 🔥 FIX: Isko thoda aur bold karne ke liye 'font-extrabold' kiya gaya hai */}
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {title || "Shop by Category"}
            </h2>

        </div>

        {/* Is component ko nahi chherna hai, yeh sirf circles dikhata hai */}
        <CategoryCarousel categories={categories} title="" />
      </div>

    </section>
  );
}