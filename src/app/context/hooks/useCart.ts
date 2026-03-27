// "use client";

// import { useState, useEffect, useMemo, useRef } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter, usePathname } from 'next/navigation';
// import SanityProduct, { CleanCartItem, ProductVariant, SanityImageObject } from '@/sanity/types/product_types';
// import { toastSuccess, toastError } from '@/app/_components/shared/CustomToasts';

// export function useCart() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();

//   // --- STATES ---
//   const [mainCartItems, setMainCartItems] = useState<CleanCartItem[]>([]);
//   const [buyNowItem, setBuyNowItem] = useState<CleanCartItem | null>(null);
//   const [isCartLoaded, setIsCartLoaded] = useState(false);
//   const [isBuyNowMode, setIsBuyNowMode] = useState(false);
//   const isNavigatingToCheckout = useRef(false);

//   // === 1. LOAD DATA ===
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       try {
//         const cartData = localStorage.getItem("PocketValue_cart");
//         if (cartData) {
//           const parsedCart = JSON.parse(cartData);
//           setMainCartItems(parsedCart.items || []);
//         }

//         const buyNowData = localStorage.getItem("PocketValue_buyNow");
//         const buyNowFlag = localStorage.getItem("PocketValue_isBuyNowMode") === "true";

//         if (buyNowData && buyNowFlag) {
//           setBuyNowItem(JSON.parse(buyNowData));
//           setIsBuyNowMode(true);
//         }

//       } catch (error) {
//         console.error("Failed to parse cart data", error);
//       } finally {
//         setIsCartLoaded(true);
//       }
//     }
//   }, []);

//   // === 2. SAVE MAIN CART ===
//   useEffect(() => {
//     if (isCartLoaded) {
//       const mainTotals = mainCartItems.reduce(
//         (acc, item) => ({
//           sub: acc.sub + item.price * item.quantity,
//           qty: acc.qty + item.quantity
//         }),
//         { sub: 0, qty: 0 }
//       );

//       localStorage.setItem("PocketValue_cart", JSON.stringify({
//           items: mainCartItems,
//           subtotal: mainTotals.sub,
//           totalQuantities: mainTotals.qty
//       }));
//     }
//   }, [mainCartItems, isCartLoaded]);

//   // === 3. SAVE BUY NOW ITEM ===
//   useEffect(() => {
//     if (isCartLoaded) {
//       if (buyNowItem) {
//         localStorage.setItem("PocketValue_buyNow", JSON.stringify(buyNowItem));
//       } else {
//         localStorage.removeItem("PocketValue_buyNow");
//       }
//     }
//   }, [buyNowItem, isCartLoaded]);

//   // === 4. CHECKOUT TYPE TRACKER ===
//   useEffect(() => {
//     if (!isCartLoaded) return;

//     if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
//         if (!isBuyNowMode) {
//             localStorage.setItem("PocketValue_isMainCartCheckout", "true");
//         }
//     }

//     // CLEANUP LOGIC
//     const isCheckoutFlow =
//       pathname === '/checkout' ||
//       pathname.startsWith('/checkout/') ||
//       pathname === '/payment' ||
//       pathname.startsWith('/order-success');

//     // 🔥 FIX STARTS HERE: Explicitly check for Cart Page
//     const isCartPage = pathname === '/cart';

//     if (isCheckoutFlow) {
//         // Agar hum checkout flow mein hain, to reset ref
//         isNavigatingToCheckout.current = false;
//     }

//     // Agar hum Checkout Flow se bahar hain OR hum Cart Page par hain
//     if ((!isCheckoutFlow || isCartPage) && !isNavigatingToCheckout.current) {

//         // Agar user Cart Page par hai ya bahar nikal gaya hai, Buy Now Mode khatam karo
//         if (buyNowItem || isBuyNowMode) {
//             setBuyNowItem(null);
//             setIsBuyNowMode(false);
//             localStorage.removeItem("PocketValue_isBuyNowMode");
//         }

//         // Main Cart Flag bhi hata do
//         localStorage.removeItem("PocketValue_isMainCartCheckout");
//     }

//   }, [pathname, isBuyNowMode, buyNowItem, isCartLoaded]);

//   // === 5. DECIDE WHICH CART TO SHOW (UI LOGIC FIX) ===

//   // 🔥 IMPORTANT FIX:
//   // Agar user '/cart' page par hai, to hum Buy Now items dikhana 'Forcefully' band kar denge.
//   // Chahe flag true bhi ho, Cart Page sirf Main Cart ke liye hai.
//   const showBuyNow = isBuyNowMode && pathname !== '/cart';

//   const activeCartItems = showBuyNow
//     ? (buyNowItem ? [buyNowItem] : [])
//     : mainCartItems;

//   const { subtotal, totalQuantities } = useMemo(() => {
//     return activeCartItems.reduce(
//       (acc, item) => ({
//         subtotal: acc.subtotal + item.price * item.quantity,
//         totalQuantities: acc.totalQuantities + item.quantity,
//       }),
//       { subtotal: 0, totalQuantities: 0 }
//     );
//   }, [activeCartItems]);

//   // === ACTIONS ===

//   const onAdd = (product: SanityProduct, variant: ProductVariant, quantity: number): boolean => {
//     if (buyNowItem || isBuyNowMode) {
//         setBuyNowItem(null);
//         setIsBuyNowMode(false);
//         localStorage.removeItem("PocketValue_isBuyNowMode");
//         localStorage.removeItem("PocketValue_isMainCartCheckout");
//     }

//     if (!session) {
//       toastError("Please log in to add items to your cart.");
//       router.push("/login?callbackUrl=" + window.location.pathname);
//       return false;
//     }

//     const cartItemId = `${product._id}-${variant._key}`;
//     const checkProductInCart = mainCartItems.find(item => item.cartItemId === cartItemId);

//     if (checkProductInCart) {
//       setMainCartItems(prev => prev.map(item =>
//         item.cartItemId === cartItemId
//           ? { ...item, quantity: item.quantity + quantity }
//           : item
//       ));
//     } else {
//       const effectivePrice = variant.salePrice ?? variant.price;
//       const effectiveImage = (variant.images?.[0] || product.defaultVariant.images?.[0]) as SanityImageObject;
//       const effectiveName = `${product.title} (${variant.name})`;

//       const newCartItem: CleanCartItem = {
//         _id: product._id, cartItemId, name: effectiveName, price: effectivePrice,
//         quantity, slug: product.slug, image: effectiveImage,
//         variant: { _key: variant._key, name: variant.name }, categoryIds: product.categoryIds,
//       };
//       setMainCartItems(prev => [...prev, newCartItem]);
//     }
//     const effectiveName = `${product.title} (${variant.name})`;
//     toastSuccess(`${quantity} x ${effectiveName} added to cart.`, "Item Added");
//     return true;
//   };

//   const onRemove = (itemToRemove: CleanCartItem) => {
//     if (isBuyNowMode || (buyNowItem && buyNowItem.cartItemId === itemToRemove.cartItemId)) {
//         setBuyNowItem(null);
//         setIsBuyNowMode(false);
//         localStorage.removeItem("PocketValue_isBuyNowMode");
//         localStorage.removeItem("PocketValue_isMainCartCheckout");
//         return;
//     }
//     setMainCartItems(prev => prev.filter(item => item.cartItemId !== itemToRemove.cartItemId));
//     toastError(`${itemToRemove.name} removed from cart.`, "Item Removed");
//   };

//   const toggleCartItemQuantity = (cartItemId: string, value: "inc" | "dec") => {
//     if (isBuyNowMode && buyNowItem && buyNowItem.cartItemId === cartItemId) {
//         if (value === "dec" && buyNowItem.quantity <= 1) {
//             setBuyNowItem(null);
//             setIsBuyNowMode(false);
//             localStorage.removeItem("PocketValue_isBuyNowMode");
//             localStorage.removeItem("PocketValue_isMainCartCheckout");
//             return;
//         }
//         setBuyNowItem(prev => prev ? ({
//             ...prev,
//             quantity: value === "inc" ? prev.quantity + 1 : prev.quantity - 1
//         }) : null);
//         return;
//     }

//     const foundProduct = mainCartItems.find((item) => item.cartItemId === cartItemId);
//     if (!foundProduct) return;

//     if (value === "dec" && foundProduct.quantity <= 1) {
//       onRemove(foundProduct);
//       return;
//     }

//     setMainCartItems(prev => prev.map(item =>
//       item.cartItemId === cartItemId
//         ? { ...item, quantity: value === "inc" ? item.quantity + 1 : item.quantity - 1 }
//         : item
//     ));
//   };

//   const clearCart = () => {
//     if (!isCartLoaded) return;

//     const isBuyNow = localStorage.getItem("PocketValue_isBuyNowMode") === "true";
//     const isMainCheckout = localStorage.getItem("PocketValue_isMainCartCheckout") === "true";

//     if (isBuyNow) {
//         setBuyNowItem(null);
//         setIsBuyNowMode(false);
//         localStorage.removeItem("PocketValue_isBuyNowMode");
//         localStorage.removeItem("PocketValue_isMainCartCheckout");
//     } else if (isMainCheckout) {
//         setMainCartItems([]);
//         localStorage.removeItem("PocketValue_isMainCartCheckout");
//         localStorage.removeItem("PocketValue_isBuyNowMode");
//     } else {
//         console.log("No active checkout flags found. Preserving cart data on reload.");
//     }
//   };

//   const buyNow = (product: SanityProduct, variant: ProductVariant, quantity: number) => {
//     if (!session) {
//       toastError("Please log in to buy this item.");
//       router.push("/login?callbackUrl=" + window.location.pathname);
//       return;
//     }

//     const effectivePrice = variant.salePrice ?? variant.price;
//     const effectiveImage = (variant.images?.[0] || product.defaultVariant.images?.[0]) as SanityImageObject;
//     const effectiveName = `${product.title} (${variant.name})`;
//     const cartItemId = `${product._id}-${variant._key}`;

//     const tempItem: CleanCartItem = {
//         _id: product._id, cartItemId, name: effectiveName, price: effectivePrice,
//         quantity, slug: product.slug, image: effectiveImage,
//         variant: { _key: variant._key, name: variant.name }, categoryIds: product.categoryIds,
//     };

//     setBuyNowItem(tempItem);
//     setIsBuyNowMode(true);

//     localStorage.setItem("PocketValue_isBuyNowMode", "true");
//     localStorage.removeItem("PocketValue_isMainCartCheckout");

//     isNavigatingToCheckout.current = true;
//     router.push('/checkout');
//   };

//   return {
//     cartItems: activeCartItems,
//     subtotal,
//     totalQuantities,
//     onAdd,
//     onRemove,
//     toggleCartItemQuantity,
//     clearCart,
//     buyNow,
//     isBuyNowMode: showBuyNow, // Return the calculated value, not just state
//     isCartLoaded
//   };
// }
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import SanityProduct, {
  CleanCartItem,
  ProductVariant,
  SanityImageObject,
} from "@/sanity/types/product_types";
import {
  toastSuccess,
  toastError,
} from "@/app/_components/shared/CustomToasts";

// Interface extension for internal stock tracking within the hook
export interface CartItemWithStock extends CleanCartItem {
  variantStock?: number; // Payload se aane wala live stock limit
}

export function useCart() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mainCartItems, setMainCartItems] = useState<CartItemWithStock[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItemWithStock | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const isNavigatingToCheckout = useRef(false);

  // === 1. LOAD DATA ===
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cartData = localStorage.getItem("PocketValue_cart");
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          setMainCartItems(parsedCart.items || []);
        }

        const buyNowData = localStorage.getItem("PocketValue_buyNow");
        const buyNowFlag =
          localStorage.getItem("PocketValue_isBuyNowMode") === "true";

        if (buyNowData && buyNowFlag) {
          setBuyNowItem(JSON.parse(buyNowData));
          setIsBuyNowMode(true);
        }
      } catch (error) {
        console.error("Failed to parse cart data", error);
      } finally {
        setIsCartLoaded(true);
      }
    }
  }, []);

  // === 2. PERSISTENCE ===
  useEffect(() => {
    if (isCartLoaded) {
      const mainTotals = mainCartItems.reduce(
        (acc, item) => ({
          sub: acc.sub + item.price * item.quantity,
          qty: acc.qty + item.quantity,
        }),
        { sub: 0, qty: 0 },
      );
      localStorage.setItem(
        "PocketValue_cart",
        JSON.stringify({
          items: mainCartItems,
          subtotal: mainTotals.sub,
          totalQuantities: mainTotals.qty,
        }),
      );
    }
  }, [mainCartItems, isCartLoaded]);

  useEffect(() => {
    if (isCartLoaded) {
      if (buyNowItem) {
        localStorage.setItem("PocketValue_buyNow", JSON.stringify(buyNowItem));
      } else {
        localStorage.removeItem("PocketValue_buyNow");
      }
    }
  }, [buyNowItem, isCartLoaded]);

  // === 3. CHECKOUT CLEANUP ===
  useEffect(() => {
    if (!isCartLoaded) return;
    const isCheckoutFlow =
      pathname === "/checkout" ||
      pathname.startsWith("/checkout/") ||
      pathname === "/payment" ||
      pathname.startsWith("/order-success");
    const isCartPage = pathname === "/cart";

    if (isCheckoutFlow) {
      isNavigatingToCheckout.current = false;
    }

    if ((!isCheckoutFlow || isCartPage) && !isNavigatingToCheckout.current) {
      if (buyNowItem || isBuyNowMode) {
        setBuyNowItem(null);
        setIsBuyNowMode(false);
        localStorage.removeItem("PocketValue_isBuyNowMode");
      }
      localStorage.removeItem("PocketValue_isMainCartCheckout");
    }
  }, [pathname, isBuyNowMode, buyNowItem, isCartLoaded]);

  const showBuyNow = isBuyNowMode && pathname !== "/cart";
  const activeCartItems = showBuyNow
    ? buyNowItem
      ? [buyNowItem]
      : []
    : mainCartItems;

  const { subtotal, totalQuantities } = useMemo(() => {
    return activeCartItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.price * item.quantity,
        totalQuantities: acc.totalQuantities + item.quantity,
      }),
      { subtotal: 0, totalQuantities: 0 },
    );
  }, [activeCartItems]);

  // === ACTIONS WITH STOCK ENFORCEMENT ===

  const onAdd = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
  ): boolean => {
    if (!session) {
      toastError("Please log in to add items.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return false;
    }

    const stockLimit = variant.stock ?? 999; // Payload stock
    const cartItemId = `${product._id}-${variant._key}`;
    const existingItem = mainCartItems.find(
      (item) => item.cartItemId === cartItemId,
    );
    const newQty = (existingItem?.quantity || 0) + quantity;

    // 🔥 STOCK CHECK 1: Addition logic
    if (newQty > stockLimit) {
      toastError(
        `Cannot add more. Total in cart (${newQty}) exceeds available stock (${stockLimit}).`,
      );
      return false;
    }

    if (existingItem) {
      setMainCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
    } else {
      const effectivePrice = variant.salePrice ?? variant.price;
      const effectiveImage = (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject;

      const newCartItem: CartItemWithStock = {
        _id: product._id,
        cartItemId,
        name: `${product.title} (${variant.name})`,
        price: effectivePrice,
        quantity,
        slug: product.slug,
        image: effectiveImage,
        variant: { _key: variant._key, name: variant.name },
        categoryIds: product.categoryIds,
        variantStock: stockLimit, // ✅ Save stock limit for later UI checks
      };
      setMainCartItems((prev) => [...prev, newCartItem]);
    }
    toastSuccess(`${quantity} x ${product.title} added.`);
    return true;
  };

  const toggleCartItemQuantity = (cartItemId: string, value: "inc" | "dec") => {
    // 1. BUY NOW MODE Logic
    if (isBuyNowMode && buyNowItem && buyNowItem.cartItemId === cartItemId) {
      if (value === "dec" && buyNowItem.quantity <= 1) return; // Use onRemove for removal

      // 🔥 STOCK CHECK 2: Buy Now Increment
      if (value === "inc") {
        const limit = buyNowItem.variantStock ?? 999;
        if (buyNowItem.quantity >= limit) {
          toastError(`Limit reached. Only ${limit} available.`);
          return;
        }
      }

      setBuyNowItem((prev) =>
        prev
          ? {
              ...prev,
              quantity: value === "inc" ? prev.quantity + 1 : prev.quantity - 1,
            }
          : null,
      );
      return;
    }

    // 2. MAIN CART Logic
    const item = mainCartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    if (value === "dec" && item.quantity <= 1) return;

    // 🔥 STOCK CHECK 3: Cart Increment
    if (value === "inc") {
      const limit = item.variantStock ?? 999;
      if (item.quantity >= limit) {
        toastError(`Maximum available stock (${limit}) reached.`);
        return;
      }
    }

    setMainCartItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId
          ? {
              ...i,
              quantity: value === "inc" ? i.quantity + 1 : i.quantity - 1,
            }
          : i,
      ),
    );
  };

  const buyNow = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
  ) => {
    if (!session) {
      toastError("Please log in to buy.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return;
    }

    const stockLimit = variant.stock ?? 999;
    if (quantity > stockLimit) {
      toastError(`Only ${stockLimit} units available.`);
      return;
    }

    const tempItem: CartItemWithStock = {
      _id: product._id,
      cartItemId: `${product._id}-${variant._key}`,
      name: `${product.title} (${variant.name})`,
      price: variant.salePrice ?? variant.price,
      quantity,
      slug: product.slug,
      image: (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject,
      variant: { _key: variant._key, name: variant.name },
      categoryIds: product.categoryIds,
      variantStock: stockLimit,
    };

    setBuyNowItem(tempItem);
    setIsBuyNowMode(true);
    localStorage.setItem("PocketValue_isBuyNowMode", "true");
    isNavigatingToCheckout.current = true;
    router.push("/checkout");
  };

  const onRemove = (item: CleanCartItem) => {
    setMainCartItems((prev) =>
      prev.filter((i) => i.cartItemId !== item.cartItemId),
    );
    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    }
  };

  const clearCart = () => {
    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    } else {
      setMainCartItems([]);
    }
    localStorage.removeItem("PocketValue_isMainCartCheckout");
  };

  return {
    cartItems: activeCartItems,
    subtotal,
    totalQuantities,
    onAdd,
    onRemove,
    toggleCartItemQuantity,
    clearCart,
    buyNow,
    isBuyNowMode: showBuyNow,
    isCartLoaded,
  };
}
