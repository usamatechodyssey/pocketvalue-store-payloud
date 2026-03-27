"use client";

import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
} from "lucide-react";
import { ProductFrictionItem } from "@/app/actions/payloadMarketingActions";
import Image from "next/image";

export default function ProductFrictionExplorer({
  data,
}: {
  data: ProductFrictionItem[];
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      <div className="p-8">
        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
          <Target className="text-brand-primary" /> Product Friction Matrix
        </h3>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
          Diagnostic Analysis: Why they browse vs Why they buy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 border-t dark:border-white/5 bg-gray-50 dark:bg-white/5">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-900 p-6 flex flex-col justify-between group hover:z-10 transition-all hover:shadow-2xl"
          >
            <div className="flex gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black dark:text-white truncate uppercase">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.alert === "WINNER" && (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black rounded-full italic animate-pulse">
                      🔥 SCALING WINNER
                    </span>
                  )}
                  {item.alert === "PRICE_BARRIER" && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded-full italic">
                      ⚠️ PRICE/TAX BARRIER
                    </span>
                  )}
                  {item.alert === "LOW_INTEREST" && (
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black rounded-full italic">
                      👀 WEAK CONVICTION
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Interest (V2C)
                </p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-xl font-black dark:text-white">
                    {item.viewToCartRatio}%
                  </span>
                  {item.viewToCartRatio > 10 ? (
                    <TrendingUp size={14} className="text-green-500 mb-1" />
                  ) : (
                    <TrendingDown size={14} className="text-red-400 mb-1" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Closing (C2O)
                </p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-xl font-black dark:text-white">
                    {item.cartToOrderRatio}%
                  </span>
                  <Zap
                    size={14}
                    className={
                      item.cartToOrderRatio > 15
                        ? "text-brand-primary mb-1"
                        : "text-gray-300 mb-1"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-white/5 flex justify-between items-center">
              <div className="flex gap-4 text-[10px] font-black text-gray-500">
                <span>{item.views} VIEWS</span>
                <span>{item.orders} SALES</span>
              </div>
              <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.frictionScore > 70 ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${100 - item.frictionScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
