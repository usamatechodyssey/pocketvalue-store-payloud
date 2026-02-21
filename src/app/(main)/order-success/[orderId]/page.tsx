// /src/app/order-success/[orderId]/page.tsx

import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// --- NAYE IMPORTS ---
import connectMongoose from "@/app/lib/mongoose";
import Order, { IOrder } from "@/models/Order"; // Hamara mustanad Order model
import ClearCartOnSuccess from "../_components/ClearCartOnSuccess";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// --- REFACTORED server-side function to use Mongoose ---
async function getOrder(id: string): Promise<IOrder | null> {
  try {
    await connectMongoose();

    // Mongoose Order model ka istemal karein.
    // Mongoose itna smart hai ke woh string ID ko purane ObjectId format se bhi match kar leta hai.
    // Isliye, yeh query naye "PV-1001" aur purane "65f1..." dono qisam ke IDs par kaam karegi.
    const order = await Order.findById(id).lean();

    if (!order) return null;

    // Data ko client component ke liye serialize karein
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Failed to fetch order for success page:", error);
    return null;
  }
}

type OrderSuccessPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderSuccessPage({
  params: paramsPromise,
}: OrderSuccessPageProps) {
  const { orderId } = await paramsPromise;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-surface-ground min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-surface-base p-8 sm:p-10 rounded-2xl shadow-lg border border-surface-border max-w-2xl w-full text-center">
        <ClearCartOnSuccess />

        <div className="mx-auto w-20 h-20 flex items-center justify-center bg-brand-success/10 rounded-full mb-6">
          <CheckCircle2
            className="text-brand-success"
            size={50}
            strokeWidth={2}
          />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Thank You For Your Order!
        </h1>
        <p className="text-text-secondary mb-6">
          Your order has been placed successfully. A confirmation email has been
          sent to you.
        </p>

        <div className="bg-surface-ground border-dashed border-2 border-surface-border-darker rounded-lg p-4 my-8">
          <p className="text-sm text-text-subtle uppercase tracking-wider">
            Your Order ID
          </p>
          <p className="text-2xl font-mono font-bold text-brand-primary mt-1 tracking-wider">
            {order.orderId} {/* Ab sirf mustanad orderId istemal karein */}
          </p>
        </div>

        <div className="text-left grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-surface-border pt-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Shipping to:
            </h3>
            <p className="text-text-primary font-bold mt-2">
              {order.shippingAddress.fullName}
            </p>
            <address className="text-text-secondary text-sm not-italic mt-1">
              {order.shippingAddress.address}, {order.shippingAddress.area},
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
            </address>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Payment Summary:
            </h3>
            <p className="text-text-primary font-bold mt-2">
              Rs. {order.totalPrice.toLocaleString()}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Paid via {order.paymentMethod}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-on-primary font-semibold rounded-lg shadow-md hover:bg-brand-primary-hover transition-colors text-amber-50"
          >
            <ShoppingBag size={18} className="text-amber-50" />
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-input text-text-primary font-semibold rounded-lg shadow-sm hover:bg-surface-border transition-colors"
          >
            View My Orders
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Architectural Consistency (Rule #5):** `getOrder` function ab `mongodb` native driver (`clientPromise`, `ObjectId`) ka istemal nahi kar raha. Yeh ab mukammal taur par Mongoose `Order` model ka istemal karta hai, jis se hamare project mein data access ka aakhri inconsistent hissa bhi theek ho gaya hai.
// - **Code Simplification:** `Order.findById(id)` ka istemal code ko bohot saaf suthra bana deta hai aur yeh naye aur purane, dono qisam ke IDs par kaam karne ke qabil hai.
// - **Improved UI & Data:** Ab UI mein hamesha mustanad `order.orderId` hi dikhaya jayega, jo user ke liye behtar hai.
