
// /src/app/api/filter/route.ts

import { searchProducts } from "@/sanity/lib/queries";
import { NextRequest, NextResponse } from "next/server";

interface FilterRequestBody {
  page?: number;
  sortOrder?: string;
  filters?: {
    brands?: string[];
    categories?: string[];
    isFeatured?: boolean;
    availability?: string[]; // ✨ ADDED
    isOnSale?: boolean;      // ✨ ADDED
    minRating?: number;      // ✨ ADDED
    [key: string]: any;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  context: {
    type: 'category' | 'search' | 'deals';
    value?: string;
    sort?: string;
    filter?: string;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FilterRequestBody = await request.json();
    
    const sortOrder = body.sortOrder || body.context.sort || 'best-match';
    const filters = body.filters || {};
    
    // Legacy context filter support
    if (body.context.filter === 'isFeatured') {
      filters.isFeatured = true;
    }

    const options: any = { 
      searchTerm: body.context.type === 'search' ? body.context.value : undefined,
      categorySlug: body.context.type === 'category' ? body.context.value : undefined,
      
      // Legacy Deals Logic
      isDeal: body.context.type === 'deals' && !body.context.value, 
      // Campaign Logic
      campaignSlug: body.context.type === 'deals' ? body.context.value : undefined,
      
      // Pass the Full Filters Object (including new fields)
      filters: filters,
      
      minPrice: body.priceRange?.min,
      maxPrice: body.priceRange?.max,
      sortOrder: sortOrder,
      page: body.page || 1,
    };

    const results = await searchProducts(options);
    return NextResponse.json(results);

  } catch (error) {
    console.error("API Filter Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(
      JSON.stringify({ message: "Error processing filter request.", error: errorMessage }),
      { status: 500 }
    );
  }
}