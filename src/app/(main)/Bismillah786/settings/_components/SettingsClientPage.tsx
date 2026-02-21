// /src/app/Bismillah786/settings/_components/SettingsClientPage.tsx

"use client";

import { useState, useTransition, memo } from 'react';
import { toast } from 'react-hot-toast';
import { updateSanitySettings, updatePaymentGateways } from '../_actions/settingsActions';
import { ShippingRule } from '@/types';
import { IGateway } from '@/models/Setting';
import { Loader2 } from 'lucide-react';

// Import the new tab components
import ShippingRulesTab from './tabs/ShippingRulesTab';
import PaymentGatewaysTab from './tabs/PaymentGatewaysTab';
import GeneralInfoTab from './tabs/GeneralInfoTab';

// --- Type Definitions (No change) ---
interface SanitySettingsData {
  shippingRules?: ShippingRule[]; storeContactEmail?: string; storePhoneNumber?: string;
  storeAddress?: string; socialLinks?: { facebook?: string; instagram?: string; twitter?: string; };
}
interface SettingsClientPageProps {
  initialSanitySettings: SanitySettingsData;
  initialPaymentGateways: IGateway[];
}
type Tab = 'shipping' | 'payment' | 'general';

// Memoized TabButton to prevent re-renders
const TabButton = memo(({ tab, label, activeTab, setActiveTab }: { tab: Tab, label: string, activeTab: Tab, setActiveTab: (tab: Tab) => void }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
      activeTab === tab
        ? 'bg-white dark:bg-gray-800 border-x border-t border-gray-200 dark:border-gray-700 text-brand-primary'
        : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
));
TabButton.displayName = 'TabButton';


// === Main Container Component ===
export default function SettingsClientPage({ initialSanitySettings, initialPaymentGateways }: SettingsClientPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('shipping');
  const [isPending, startTransition] = useTransition();

  // --- State for each tab (managed by the parent) ---
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>(() => JSON.parse(JSON.stringify(initialSanitySettings.shippingRules || [])));
  const [paymentGateways, setPaymentGateways] = useState<IGateway[]>(() => JSON.parse(JSON.stringify(initialPaymentGateways || [])));
  const [generalSettings, setGeneralSettings] = useState({
    storeContactEmail: initialSanitySettings.storeContactEmail || '',
    storePhoneNumber: initialSanitySettings.storePhoneNumber || '',
    storeAddress: initialSanitySettings.storeAddress || '',
    socialLinks: {
      facebook: initialSanitySettings.socialLinks?.facebook || '',
      instagram: initialSanitySettings.socialLinks?.instagram || '',
      twitter: initialSanitySettings.socialLinks?.twitter || '',
    },
  });

  // --- Save Handler ---
  const handleSave = () => {
    startTransition(async () => {
      let result;
      toast.loading("Saving settings...");
      
      if (activeTab === 'shipping') {
        const hasBaseRule = shippingRules.some(rule => rule.minAmount === 0);
        if (!hasBaseRule) { 
            toast.dismiss(); 
            toast.error('You must have a fallback rule with a "Minimum Subtotal" of 0.'); 
            return; 
        }

        // ✅ FIX IS HERE: Added check (_id && _id.startsWith...)
        const preparedRules = shippingRules.map(({ _id, ...rest }) => ({ 
            ...rest, 
            // Agar _id exist karta hai AUR wo 'new_' se shuru hota hai, tabhi use karo.
            // Warna undefined rehne do (Sanity khud handle karega).
            _key: (_id && _id.startsWith('new_')) ? _id : undefined 
        }));

        result = await updateSanitySettings({ shippingRules: preparedRules as any });

      } else if (activeTab === 'payment') {
        result = await updatePaymentGateways(paymentGateways);
      } else if (activeTab === 'general') {
        result = await updateSanitySettings({ ...generalSettings, shippingRules: initialSanitySettings.shippingRules });
      }

      toast.dismiss();
      if (result?.success) { toast.success(result.message); } 
      else { toast.error(result?.message || "An unknown error occurred."); }
    });
  };
  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {/* === THE FIX IS HERE: Added a unique `key` to each button === */}
        <TabButton key="shipping" tab="shipping" label="Shipping Rules" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton key="payment" tab="payment" label="Payment Gateways" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton key="general" tab="general" label="General Information" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-b-lg shadow-md border-x border-b dark:border-gray-700">
        <div className="min-h-100">
          {activeTab === 'shipping' && <ShippingRulesTab shippingRules={shippingRules} setShippingRules={setShippingRules} isPending={isPending} />}
          {activeTab === 'payment' && <PaymentGatewaysTab paymentGateways={paymentGateways} setPaymentGateways={setPaymentGateways} isPending={isPending} />}
          {activeTab === 'general' && <GeneralInfoTab generalSettings={generalSettings} setGeneralSettings={setGeneralSettings} isPending={isPending} />}
        </div>
        
        <div className="flex justify-end pt-6 border-t dark:border-gray-700 mt-8">
            <button onClick={handleSave} disabled={isPending} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {isPending && <Loader2 className="animate-spin" size={20}/>}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}