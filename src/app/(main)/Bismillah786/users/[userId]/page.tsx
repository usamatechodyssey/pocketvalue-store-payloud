
// /app/Bismillah786/users/[userId]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSingleUserForAdmin } from "../_actions/userActions";
import { ArrowLeft, Mail, Phone, ShoppingCart, DollarSign, Power } from "lucide-react";

// Helper to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "processing": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"; // Pending
  }
};

// --- FINAL FIX: Correctly handle async params from Next.js 15+ ---
export default async function UserDetailPage({ params: paramsPromise }: { params: Promise<{ userId: string }> }) {
  const params = await paramsPromise;
  const data = await getSingleUserForAdmin(params.userId);

  if (!data) {
    notFound();
  }

  const { user, stats, recentOrders } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <Link href="/Bismillah786/users" className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft size={16}/> Back to Customers
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 rounded-full bg-gray-200">
                <Image src={user.image || '/default-avatar.png'} alt={user.name} fill sizes="80px" className="rounded-full object-cover"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h1>
                <p className="text-sm text-gray-500">Customer since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Recent Order History</h2>
                    {/* --- IMPROVEMENT: Link to a dedicated, paginated orders page --- */}
                    {stats.totalOrders > 5 && (
                        <Link href={`/Bismillah786/users/${user._id}/orders`} className="text-sm font-semibold text-brand-primary hover:underline">
                            View All ({stats.totalOrders})
                        </Link>
                    )}
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr><th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Date</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Total</th></tr></thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-3 font-mono"><Link href={`/Bismillah786/orders/${order._id}`} className="text-brand-primary hover:underline">#{order._id.slice(-6).toUpperCase()}</Link></td>
                                        <td className="p-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td className="p-3 text-right font-semibold">Rs. {order.totalPrice.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // ✅ FIX: 'hasn't' -> 'hasn&apos;t'
                    <p className="text-center text-gray-500 py-8">This customer hasn&apos;t placed any orders yet.</p>
                )}
            </div>
        </div>

        {/* Right Column (Sticky Sidebar) */}
        <div className="space-y-8 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Customer Overview</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400"/><a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></div>
                    <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400"/><span>{user.phone || 'Not provided'}</span></div>
                    <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-3">
                        <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><DollarSign size={16}/> Lifetime Spend</span><span className="font-bold text-lg">Rs. {stats.totalSpend.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-2"><ShoppingCart size={16}/> Total Orders</span><span className="font-bold text-lg">{stats.totalOrders}</span></div>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Address Book</h2>
                {user.addresses.length > 0 ? (
                    <div className="space-y-4">
                        {user.addresses.map((addr: any, index: number) => (
                            <div key={index} className="border-b dark:border-gray-700 pb-2 last:border-b-0">
                                <address className="text-sm text-gray-600 dark:text-gray-400 not-italic">
                                    <span className="font-bold block">{addr.fullName} {addr.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Default</span>}</span>
                                    {addr.address}, {addr.area}<br/>
                                    {addr.city}, {addr.province}<br/>
                                    Phone: {addr.phone}
                                </address>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No addresses found.</p>
                )}
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Danger Zone</h3>
                <button className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                    <Power size={16}/> Disable Customer Account
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}