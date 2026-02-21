// /src/app/Bismillah786/settings/_components/tabs/GeneralInfoTab.tsx

"use client";

import { Dispatch, SetStateAction, memo } from 'react';

// --- Type Definitions for Props ---
interface GeneralSettings {
  storeContactEmail: string;
  storePhoneNumber: string;
  storeAddress: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

interface GeneralInfoTabProps {
  generalSettings: GeneralSettings;
  setGeneralSettings: Dispatch<SetStateAction<GeneralSettings>>;
  isPending: boolean;
}

// --- Reusable, Memoized Input Component ---
const TextInput = memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type="text"
      {...props}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
    />
));
TextInput.displayName = 'TextInput';

// --- Reusable FormField Layout Component ---
const FormField = memo(({ label, children }: {label:string, children:React.ReactNode}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
));
FormField.displayName = 'FormField';

// === Main Tab Component ===
export default function GeneralInfoTab({ generalSettings, setGeneralSettings, isPending }: GeneralInfoTabProps) {

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  return (
    <div className='space-y-6'>
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Store Contact Information</h3>
        <div className="space-y-3">
          <FormField label="Contact Email">
            <TextInput name="storeContactEmail" value={generalSettings.storeContactEmail} onChange={handleGeneralChange} placeholder="contact@yourstore.com" disabled={isPending} />
          </FormField>
          <FormField label="Phone Number">
            <TextInput name="storePhoneNumber" value={generalSettings.storePhoneNumber} onChange={handleGeneralChange} placeholder="+92 300 1234567" disabled={isPending} />
          </FormField>
          <FormField label="Store Address">
            <TextInput name="storeAddress" value={generalSettings.storeAddress} onChange={handleGeneralChange} placeholder="123 Main Street, City, Country" disabled={isPending} />
          </FormField>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4">Social Media Links</h3>
        <div className="space-y-3">
          <FormField label="Facebook URL">
            <TextInput name="facebook" value={generalSettings.socialLinks.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/yourpage" disabled={isPending} />
          </FormField>
          <FormField label="Instagram URL">
            <TextInput name="instagram" value={generalSettings.socialLinks.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/yourhandle" disabled={isPending} />
          </FormField>
          <FormField label="Twitter (X) URL">
            <TextInput name="twitter" value={generalSettings.socialLinks.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/yourhandle" disabled={isPending} />
          </FormField>
        </div>
      </div>
    </div>
  );
}