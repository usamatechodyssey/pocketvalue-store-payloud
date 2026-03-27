"use client";

import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import AnalyticsStatCard from "./AnalyticsStatCard";
import SalesPerformanceChart from "./SalesPerformanceChart";
import TopProductsList from "./TopProductsList";
import TrafficSourceChart from "./TrafficSourceChart";
import OperationalIntelligence from "./OperationalIntelligence";
import UserBehavioralIntent from "./UserBehavioralIntent";
import PriceAnatomySurgeon from "./PriceAnatomySurgeon";
import InventoryForecaster from "./InventoryForecaster";
import { ExecutiveSummary } from "@/app/actions/payloadAnalyticsActions";
import GeospatialIntelligence from "./GeospatialIntelligence";
import LoyaltyIntelligence from "./LoyaltyIntelligence";
import AISentinel from "./AISentinel";
import Link from "next/link";

interface DashboardContentProps {
  data: ExecutiveSummary;
  chartData: any[];
  topProducts: any[];
  trafficData: any[];
  operationalData: any;
  behavioralData: any;
  financialData: any;
  forecastData: any[];
  geoData: any[];
  loyaltyData: any;
  sentinelData: any;
}

export default function AnalyticsDashboardContent({
  data,
  chartData,
  topProducts,
  trafficData,
  operationalData,
  behavioralData,
  financialData,
  forecastData,
  geoData,
  loyaltyData,
  sentinelData,
}: DashboardContentProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* 1. EXECUTIVE METRICS GRID (Top Row) - Responsive 1 to 4 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard
          title="Gross Revenue (Today)"
          value={`Rs. ${data.revenue.gross.toLocaleString()}`}
          icon={DollarSign}
          trend={data.revenue.growthPercentage}
          subtext={`Est. Profit: Rs. ${data.revenue.netProfitEstimate.toLocaleString()}`}
          colorVariant="success"
        />
        <AnalyticsStatCard
          title="Orders Pulse"
          value={data.orders.total}
          icon={ShoppingBag}
          subtext={`${data.orders.velocity} orders / hr velocity`}
          colorVariant="primary"
        />
        <AnalyticsStatCard
          title="Active Customers"
          value={data.customers.total.toLocaleString()}
          icon={Users}
          subtext={`${data.customers.newToday} new today`}
          colorVariant="info"
        />
      <Link href="/admin/inventory-risk" className="block no-underline" > {/* ✅ Wrap in Link */}
    <AnalyticsStatCard 
      title="Inventory Risk"
      value={data.inventory.criticalStockCount}
      icon={AlertTriangle}
      subtext={`${data.inventory.outOfStockCount} variants depleted`}
      colorVariant={data.inventory.criticalStockCount > 0 ? 'error' : 'warning'}
    />
</Link>
      </div>

      {/* 2. MAIN VISUAL INTELLIGENCE ROW - Responsive 1 to 12 col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sales Performance - min-w-0 fix for charts */}
        <div className="xl:col-span-8 min-w-0">
          <SalesPerformanceChart data={chartData} />
        </div>

        {/* Inventory Forecaster */}
        <div className="xl:col-span-4 min-w-0">
          <InventoryForecaster data={forecastData} />
        </div>
      </div>

      {/* 3. SECONDARY INTELLIGENCE ROW - Responsive 1 to 3 cols */}
      {/* ✅ ROW 3: OPERATIONAL OVERVIEW (Now with 4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="min-w-0">
          <TrafficSourceChart data={trafficData} />
        </div>

        <div className="min-w-0">
          <TopProductsList products={topProducts} />
        </div>

        <div className="min-w-0">
          <GeospatialIntelligence data={geoData} /> {/* ✅ NEW COMPONENT */}
        </div>

        <div className="min-w-0">
          <OperationalIntelligence data={operationalData} />
        </div>
      </div>

      {/* 4. BEHAVIORAL & FINANCIAL SURGERY - Responsive 1 to 2 cols */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="xl:col-span-1 min-w-0">
          <UserBehavioralIntent data={behavioralData} />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <LoyaltyIntelligence data={loyaltyData} /> {/* ✅ NEW COMPONENT */}
        </div>
        <div className="min-w-0">
          <AISentinel data={sentinelData} /> {/* ✅ FINAL PHASE ADDED */}
        </div>
        <div className="xl:col-span-1 min-w-0">
          {financialData && <PriceAnatomySurgeon data={financialData} />}
        </div>
      </div>

      {/* 5. STRATEGIC INSIGHTS BANNER */}
      <div className="bg-linear-to-br from-gray-900 to-black dark:from-brand-primary/10 dark:to-black p-6 md:p-10 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 hidden md:block">
          <Zap size={140} className="text-brand-primary" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
            <Zap className="text-brand-primary fill-brand-primary" />
            Strategic AI Insight
          </h2>
          <p className="text-gray-400 mt-4 max-w-3xl text-sm md:text-base font-medium leading-relaxed">
            {data.inventory.criticalStockCount > 0
              ? `Urgent: Stock burn rate is accelerating. Your ${data.inventory.criticalStockCount} most popular variants will be depleted within 72 hours. Immediate reorder recommended to avoid revenue loss.`
              : `Performance Insight: Average Order Value is stable at Rs. ${data.orders.avgOrderValue?.toFixed(0) || 0}. Revenue efficiency is at ${financialData?.marginPercent?.toFixed(1) || 0}%. Customer retention metrics are healthy.`}
          </p>
          <div className="mt-8">
            <button className="px-8 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.4)] transition-all flex items-center gap-2">
              Open Inventory Audit <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
