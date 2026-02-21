
// /app/Bismillah786/analytics/page.tsx (FINAL WITH DYNAMIC CHART FIX)
"use client";

import { useState, useEffect, useTransition } from "react";
import { getAnalyticsData, AnalyticsData } from "./_actions/analyticsActions";

// ✅ FIX: Recharts ke imports hata diye (ab wo dynamic wrapper se aayenge)
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"; 

import dynamic from 'next/dynamic'; // ✅ Dynamic import
import { Loader2, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

// ✅ FIX: Dynamic Wrapper for Sales Chart (Replaces the big chart import)
// Ye SalesChart.tsx file ko load karega, jo khud recharts ko lazy load karega
const SalesChart = dynamic(
  // Pura path check karein: yeh wrapper _components folder mein hoga
  () => import('../_components/SalesChart'), 
  {
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    ),
  }
);


const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "orange",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: "green" | "blue" | "orange" | "indigo";
}) => {
  const colorClasses = {
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
};

const ChartContainer = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96">
    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

// ✅ FIX: CustomTooltip ko rehne dein ya hata dein agar ye sirf BarChart mein use ho raha hai.
// Ab main isay rehne de raha hu taake code intact rahe.
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {label}
        </p>
        <p className="text-brand-primary font-semibold">
          Sales: Rs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg"
        ></div>
      ))}
    </div>
    <ChartContainer title="">
      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </ChartContainer>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-72"></div>
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState(30);

  useEffect(() => {
    startTransition(async () => {
      const analyticsData = await getAnalyticsData(days);
      setData(analyticsData);
    });
  }, [days]);

  if (isPending || !data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Growth Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Showing data for the last {days} days.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${days === d ? "bg-white dark:bg-gray-800 text-brand-primary shadow" : "text-gray-600 dark:text-gray-300 hover:bg-white/50"}`}
            >
              Last {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`Rs. ${data.overall.totalSales.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={data.overall.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="New Customers"
          value={data.newUsers.toLocaleString()}
          icon={Users}
          color="orange"
        />
        <StatCard
          title="Avg. Order Value"
          value={`Rs. ${data.overall.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      <ChartContainer title="Sales Trend (Last 7 Days)">
        {/* ✅ FIX: Naya Dynamic Chart Wrapper use kiya */}
        <SalesChart data={data.salesTrend} />
      </ChartContainer>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
          Top Selling Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-right">Quantity Sold</th>
                <th className="p-3 text-right">Total Sales (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.topProducts.map((item) => (
                <tr
                  key={item.productId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-3 font-medium">
                    <Link
                      href={`/Bismillah786/products/edit-by-id/${item.productId}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    {item.totalQuantity.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    {item.totalSales.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}