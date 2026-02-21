
// /src/app/Bismillah786/orders/[orderId]/page.tsx (UPDATED: NEXT.JS 16+ FIX)

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Package,
  Hash,
  Calendar,
  Mail,
  ShoppingCart,
} from "lucide-react";
import connectMongoose from "@/app/lib/mongoose";
import Order, { IOrder } from "@/models/Order";
import CopyButton from "../../_components/CopyButton";
import { getProductsStockStatus } from "@/sanity/lib/queries";
import UpdateOrderStatus from "../_components/UpdateOrderStatus";
import SendEmailModal from "../_components/SendEmailModal";
import StatusTimeline from "../_components/StatusTimeline";
import OrderDetailsProductCard from "./_components/OrderDetailsProductCard";

async function getSingleOrder(orderId: string): Promise<IOrder | null> {
  try {
    await connectMongoose();

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
    })
      .populate("userId", "name email")
      .lean();

    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) {
    console.error("Failed to fetch single admin order:", error);
    return null;
  }
}

const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

// NEXT.JS 16 FIX: params must be a Promise
type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  // NEXT.JS 16 FIX: Await params before accessing orderId
  const { orderId } = await params;
  
  const order = await getSingleOrder(orderId);

  if (!order) notFound();

  const productIdsInOrder = order.products.map((p) => p._id);
  const stockStatuses = await getProductsStockStatus(productIdsInOrder);
  const stockMap = new Map(stockStatuses.map((s) => [s._id, s]));

  // Safely access user details from the populated field or fallback to shipping address
  const user = order.userId as any; // Cast because lean() returns plain object
  const customerId = user?._id?.toString() || order.userId;
  const customerName = user?.name || order.shippingAddress.fullName;
  const customerEmail = user?.email || order.shippingAddress.email;

  const subtotal = order.subtotal;
  const shippingCost = order.shippingCost;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/Bismillah786/orders"
          className="flex items-center gap-2 text-sm font-semibold mb-4"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Hash size={14} /> {order.orderId}
            <CopyButton textToCopy={order.orderId} />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
          <Calendar size={14} />
          {new Date(order.createdAt).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <InfoCard icon={<ShoppingCart size={22} />} title="Order Summary">
            <StatusTimeline status={order.status} />
          </InfoCard>
          <InfoCard
            icon={<Package size={22} />}
            title={`Products (${order.products.length})`}
          >
            <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700 -mt-4">
              {order.products.map((p) => (
                <OrderDetailsProductCard
                  key={p.cartItemId}
                  product={p}
                  stockInfo={stockMap.get(p._id)}
                />
              ))}
            </div>
          </InfoCard>
          <UpdateOrderStatus
            orderId={order._id.toString()}
            currentStatus={order.status}
          />
        </div>

        <div className="space-y-8 lg:sticky lg:top-24">
          <InfoCard icon={<User size={22} />} title="Customer">
            <Link
              href={`/Bismillah786/users/${customerId}`}
              className="font-bold hover:underline"
            >
              {customerName}
            </Link>
            <a
              href={`mailto:${customerEmail}`}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1.5"
            >
              <Mail size={14} /> {customerEmail}
            </a>
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <MapPin size={16} /> Shipping Address
              </h3>
              <address className="text-sm not-italic">
                {order.shippingAddress.address}, {order.shippingAddress.area}
                <br />
                {order.shippingAddress.city}
                <br />
                Phone: {order.shippingAddress.phone}
              </address>
            </div>
            <div className="mt-6 border-t pt-4">
              <SendEmailModal
                customerId={customerId}
                customerName={customerName}
              />
            </div>
          </InfoCard>

          <InfoCard icon={<CreditCard size={22} />} title="Payment">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-semibold">{order.paymentStatus}</span>
              </div>
              <div className="border-t pt-3 mt-3 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="font-medium">
                    {shippingCost === 0
                      ? "FREE"
                      : `Rs. ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span className="text-base">Grand Total:</span>
                  <span>Rs. {order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}