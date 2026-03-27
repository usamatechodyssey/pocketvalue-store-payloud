// src/app/(payload)/admin/views/ProductIntelligenceView.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import { getProductIntelligencePayload } from "@/app/actions/payloadProductIntelligenceActions";

import AnalyticsDateRangePicker from "@/app/components/payload-analytics/AnalyticsDateRangePicker";
import Pagination from "@/app/_components/shared/Pagination";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { ArrowLeft, BrainCircuit, SearchX } from 'lucide-react';
import Link from 'next/link';
import ProductIntelligenceFilters from '@/app/components/payload-analytics/ProductIntelligenceFilters';
import ProductIntelligenceContent from '@/app/components/payload-analytics/ProductIntelligenceContent';

export default async function ProductIntelligenceView(props: any) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const payload = props.payload || initPageResult?.req?.payload;

  // 1. Prepare Date Range
  const range = {
    from: searchParams?.from ? startOfDay(parseISO(searchParams.from)) : startOfDay(new Date()),
    to: searchParams?.to ? endOfDay(parseISO(searchParams.to)) : endOfDay(new Date())
  };

  const currentPage = Number(searchParams?.page) || 1;

  // 2. Fetch Intelligence & Categories Parallelly
  const [intelResult, categoriesRes] = await Promise.all([
    getProductIntelligencePayload(range, currentPage, 50, {
      categoryId: searchParams?.category,
      trend: searchParams?.trend
    }),
    payload.find({ collection: 'categories', limit: 100, depth: 0 })
  ]);

  const { data, totalDocs, totalPages } = intelResult;
  const categories = categoriesRes.docs.map((c: any) => ({ id: c.id, name: c.name }));

  // 3. Extract safe UI props
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const safePayload = props.payload || initPageResult?.req?.payload;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  return (
    <DefaultTemplate i18n={i18n} locale={locale} params={params} payload={safePayload} permissions={permissions} searchParams={searchParams} user={user} visibleEntities={visibleEntities}>
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-8 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-2">
                <Link href="/admin" className="flex items-center gap-2 text-xs font-black text-brand-primary hover:underline uppercase tracking-widest mb-4">
                    <ArrowLeft size={14}/> Back to Hub
                </Link>
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-4">
                  <BrainCircuit size={48} className="text-brand-primary" />
                  Product Intelligence
                </h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-70">
                    Surgical Audit: {format(range.from, 'MMM dd')} — {format(range.to, 'MMM dd')} | {totalDocs} Total Matches
                </p>
            </div>
            <AnalyticsDateRangePicker />
        </div>

        {/* SEARCH & FILTERS BAR */}
        <ProductIntelligenceFilters categories={categories} />

        {/* CORE DATA TABLE */}
        <div className="min-w-0">
            {data.length > 0 ? (
                <div className="space-y-10">
                    <ProductIntelligenceContent data={data} />
                    {totalPages > 1 && (
                        <div className="flex justify-center border-t dark:border-gray-800 pt-8">
                            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={() => {}} isPending={false} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed dark:border-gray-800 text-gray-500">
                    <SearchX size={64} className="mb-6 opacity-20" />
                    <h3 className="text-xl font-black uppercase tracking-widest">No Strategic Data Found</h3>
                    <p className="text-sm opacity-60 mt-2">Adjust your filters or date range to scan deeper.</p>
                </div>
            )}
        </div>

        <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                Neural Pattern Recognition Engine Engaged
            </p>
        </div>
      </div>
    </DefaultTemplate>
  );
}