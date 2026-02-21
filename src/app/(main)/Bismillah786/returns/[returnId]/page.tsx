
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  Hash,
  Calendar,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import { getSingleReturnRequest } from "../_actions/returnActions";
import CopyButton from "../../_components/CopyButton";
import UpdateReturnStatus from "../_components/UpdateReturnStatus";
import ReturnDetailsProductCard from "../_components/ReturnDetailsProductCard";

// Reusable InfoCard Component
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

// --- THE FIX IS HERE ---
// 1. Correctly type the props for an async Server Component.
export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  // 2. Await the params promise before accessing its properties.
  const { returnId } = await params;
  const request = await getSingleReturnRequest(returnId);

  if (!request) {
    notFound();
  }

  const customerId = request.userDetails?._id || "";
  const customerName = request.userDetails?.name || "N/A";
  const customerEmail = request.userDetails?.email || "N/A";
  const shippingAddress = request.originalOrder?.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/Bismillah786/returns"
          className="flex items-center gap-2 text-sm font-semibold mb-4"
        >
          <ArrowLeft size={16} /> Back to Return Requests
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-3xl font-bold">Return Request Details</h1>
          <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Hash size={14} /> #{request._id.slice(-6).toUpperCase()}{" "}
            <CopyButton textToCopy={request._id} />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
          <Calendar size={14} />{" "}
          {new Date(request.createdAt).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <InfoCard icon={<FileText size={22} />} title="Request Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-semibold">{request.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Original Order:</span>
                <Link
                  href={`/Bismillah786/orders/${request.orderId}`}
                  className="font-semibold text-brand-primary hover:underline"
                >
                  {request.orderNumber}
                </Link>
              </div>
              {request.resolution && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Resolution:</span>
                  <span className="font-semibold">{request.resolution}</span>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard
            icon={<Package size={22} />}
            title={`Items to Return (${request.items.length})`}
          >
            <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700 -mt-4">
              {request.items.map((item) => (
                <ReturnDetailsProductCard key={item.variantKey} item={item} />
              ))}
            </div>
          </InfoCard>

          {request.customerComments && (
            <InfoCard
              icon={<MessageSquare size={22} />}
              title="Customer Comments"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {/* ✅ FIX: Replaced " with &quot; */}
                &quot;{request.customerComments}&quot;
              </p>
            </InfoCard>
          )}
        </div>

        {/* Right Column (Sidebar) */}
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
            {shippingAddress && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <MapPin size={16} /> Original Shipping Address
                </h3>
                <address className="text-sm not-italic">
                  {shippingAddress.address}, {shippingAddress.area}
                  <br />
                  {shippingAddress.city}
                  <br />
                  Phone: {shippingAddress.phone}
                </address>
              </div>
            )}
          </InfoCard>

          <UpdateReturnStatus
            returnId={request._id}
            currentStatus={request.status}
          />
        </div>
      </div>
    </div>
  );
}