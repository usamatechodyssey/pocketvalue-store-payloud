// /app/Bismillah786/page.tsx

import {
  getDashboardStats,
  getOrderStatusSummary,
} from "./_actions/dashboardActions";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

// --- Reusable StatCard Component (Redesigned for a professional look) ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  href?: string;
  color?: "green" | "blue" | "orange" | "red" | "indigo";
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color = "orange",
  subtitle,
}: StatCardProps) {
  const colorClasses = {
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };

  const content = (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-brand-primary dark:hover:border-brand-primary group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {href && (
          <ArrowRight
            size={16}
            className="text-gray-400 group-hover:text-brand-primary transition-transform group-hover:translate-x-1"
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

// --- Helper to get a dynamic welcome message ---
const getWelcomeMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// === Main Dashboard Page (Redesigned) ===
export default async function AdminDashboardPage() {
  // Fetch all required data in parallel for maximum speed
  const [stats, orderSummary] = await Promise.all([
    getDashboardStats(),
    getOrderStatusSummary(),
  ]);

  const ADMIN_BASE_PATH = "/Bismillah786";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {getWelcomeMessage()}, Admin!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here’s what’s happening with your store today,{" "}
          {format(new Date(), "MMMM d, yyyy")}.
        </p>
      </div>

      {/* Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Revenue (This Month)"
          value={`Rs. ${stats.monthRevenue.toLocaleString()}`}
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Average Order Value"
          value={`Rs. ${stats.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          href={`${ADMIN_BASE_PATH}/orders`}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          href={`${ADMIN_BASE_PATH}/users`}
        />
        <StatCard
          title="New Customers (This Month)"
          value={stats.monthNewCustomers.toLocaleString()}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Order Fulfillment Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Order Fulfillment
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Pending"
            value={orderSummary.Pending || 0}
            icon={Clock}
            href={`${ADMIN_BASE_PATH}/orders?status=Pending`}
          />
          <StatCard
            title="Processing"
            value={orderSummary.Processing || 0}
            icon={Clock}
            color="indigo"
            href={`${ADMIN_BASE_PATH}/orders?status=Processing`}
          />
          <StatCard
            title="Shipped"
            value={orderSummary.Shipped || 0}
            icon={Truck}
            color="blue"
            href={`${ADMIN_BASE_PATH}/orders?status=Shipped`}
          />
          <StatCard
            title="Delivered"
            value={orderSummary.Delivered || 0}
            icon={CheckCircle}
            color="green"
            href={`${ADMIN_BASE_PATH}/orders?status=Delivered`}
          />
          <StatCard
            title="Cancelled"
            value={orderSummary.Cancelled || 0}
            icon={XCircle}
            color="red"
            href={`${ADMIN_BASE_PATH}/orders?status=Cancelled`}
          />
        </div>
      </div>

      {/* Placeholder for future charts */}
      {/*
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Sales Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SalesChart data={...} />
              // Other charts can go here
          </div>
      </div>
      */}
    </div>
  );
}
