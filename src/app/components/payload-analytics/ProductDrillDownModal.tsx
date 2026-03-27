"use client";

import React, { Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, ShoppingBag, Box, ArrowRight, ExternalLink, History } from 'lucide-react';
import Link from 'next/link';

export default function ProductDrillDownModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) {
  if (!data) return null;
  const { product, recentOrders } = data;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-9999" onClose={onClose}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
        
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md border-l dark:border-white/10">
                  <div className="flex h-full flex-col bg-white dark:bg-[#080808] shadow-2xl">
                    
                    {/* MODAL HEADER */}
                    <div className="p-8 border-b dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-[0.3em]">
                            <History size={14}/> Full Sku Audit
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-5">
                         <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-4xl border-2 border-brand-primary/20 p-2 shadow-inner">
                            <img src={product.variants?.[0]?.images?.[0]?.url} alt="" className="w-full h-full object-contain" />
                         </div>
                         <div className="min-w-0">
                            <h2 className="text-xl font-black dark:text-white truncate uppercase tracking-tight leading-tight">{product.title}</h2>
                            <Link href={`/admin/collections/products/${product.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-black text-brand-primary uppercase mt-2 hover:underline tracking-widest">
                                Open in Core Editor <ExternalLink size={10}/>
                            </Link>
                         </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-12">
                      
                      {/* 1. INVENTORY BREAKDOWN */}
                      <section>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-2 border-brand-primary pl-3">
                           <Box size={14} className="text-brand-primary"/> Inventory Distribution
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {product.variants?.map((v: any) => (
                                <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-white/10 transition-all">
                                    <span className="text-xs font-bold dark:text-gray-300">{v.name}</span>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${v.stock <= 5 ? 'text-red-500' : 'text-green-500'}`}>{v.stock} <small className="text-[8px] uppercase font-bold opacity-50">pcs</small></p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Rs. {v.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                      </section>

                      {/* 2. CUSTOMER TRACEABILITY */}
                      <section>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-2 border-brand-primary pl-3">
                           <ShoppingBag size={14} className="text-brand-primary"/> Recent Acquisition History
                        </h4>
                        <div className="space-y-3">
                            {recentOrders.length > 0 ? recentOrders.map((o: any) => (
                                <Link key={o.orderId} href={`/admin/orders/${o._id}`} className="group/order block p-5 bg-gray-50 dark:bg-white/5 rounded-4xl border border-transparent hover:border-brand-primary/30 transition-all shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Order #{o.orderId}</p>
                                            <p className="text-sm font-black dark:text-white mt-1 truncate">{o.shippingAddress.fullName}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-white/5 rounded-2xl group-hover/order:bg-brand-primary group-hover/order:text-white transition-all">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-10 opacity-30 italic">No order history for this period.</div>
                            )}
                        </div>
                      </section>
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="p-8 bg-gray-50 dark:bg-white/5 border-t dark:border-white/5">
                        <button onClick={onClose} className="w-full py-5 bg-brand-primary text-white font-black uppercase text-xs tracking-[0.3em] rounded-4xl hover:shadow-[0_0_25px_rgba(var(--brand-primary-rgb),0.4)] transition-all">
                            Terminate Audit
                        </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}