
"use client";

import { ShippingInfo } from "./NewAddressForm";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface AddressInputFieldsProps {
  shippingInfo: ShippingInfo;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value?: string) => void;
  inputStyles: string;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
  getErrorStyles: (hasError: boolean) => string;
  disabled?: boolean;
}

// --- CUSTOM COMPONENT (OFFICIAL CDN SVG) ---
const CustomCountrySelect = ({ icon, ...rest }: any) => {
  return (
    <div className="flex items-center pl-3 pr-2 pointer-events-none">
      <img 
        src="https://flagcdn.com/pk.svg" 
        alt="Pakistan Flag"
        className="w-6 h-4 object-cover border border-gray-200 shadow-sm rounded-xs"
      />
      <span className="text-gray-500 font-semibold text-sm ml-2">+92</span>
    </div>
  );
};

export default function AddressInputFields({
  shippingInfo,
  handleInputChange,
  onPhoneChange,
  inputStyles,
  errors,
  getErrorStyles,
  disabled = false, 
}: AddressInputFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={shippingInfo.fullName}
            onChange={handleInputChange}
            required
            className={`${inputStyles} ${getErrorStyles(!!errors.fullName)}`}
          />
        </div>

        {/* Phone Number Field */}
        {/* 🔴 CHANGE 1: Disabled logic hata di taake input hamesha open rahe */}
        <div className={`phone-input-container`}> 
        {/* Original was: className={`phone-input-container ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}`} */}
          
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <PhoneInput
            defaultCountry="PK"
            countries={['PK']} 
            international={false}
            withCountryCallingCode={false}
            countrySelectComponent={CustomCountrySelect} 
            value={shippingInfo.phone}
            onChange={onPhoneChange}
            
            // 🔴 CHANGE 2: Disabled prop ko force 'false' kar diya
            // disabled={disabled}  <-- Purana Code (Commented)
            disabled={false}      // <-- Naya Code (Always Editable)
            
            // Parent Styling
            className={`${inputStyles} ${getErrorStyles(!!errors.phone)} flex items-center py-0! px-0! overflow-hidden bg-white dark:bg-gray-900`} 
            // Input Styling
            numberInputProps={{
                className: "bg-transparent border-none focus:ring-0 grow h-full py-2.5 pl-2 pr-3 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 w-full",
                required: true,
                placeholder: "300 1234567",
                maxLength: 12 
            }}
          />
        </div>
      </div>

      {/* Area / Locality Field */}
      <div>
        <label htmlFor="area" className="block text-sm font-medium mb-1">
          Area / Locality
        </label>
        <input
          id="area"
          name="area"
          type="text"
          value={shippingInfo.area}
          onChange={handleInputChange}
          required
          className={`${inputStyles}`}
          placeholder="e.g. DHA Phase 6, Johar Town"
        />
      </div>

      {/* Address Field */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Street Address & House No.
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={shippingInfo.address}
          onChange={handleInputChange}
          required
          className={`${inputStyles} ${getErrorStyles(!!errors.address)}`}
          placeholder="e.g. House #123, Street 4"
        />
      </div>

      <style jsx global>{`
        .PhoneInputCountrySelectArrow { display: none !important; }
        .PhoneInputInput { outline: none; border: none; }
      `}</style>
    </div>
  );
}