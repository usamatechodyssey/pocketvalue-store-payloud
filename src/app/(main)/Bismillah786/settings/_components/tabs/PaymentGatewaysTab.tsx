
"use client";

import { Dispatch, SetStateAction, memo } from 'react';
import { IGateway } from '@/models/Setting';

// --- Type Definitions for Props ---
interface PaymentGatewaysTabProps {
  paymentGateways: IGateway[];
  setPaymentGateways: Dispatch<SetStateAction<IGateway[]>>;
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

// --- Memoized Child Component for a single Gateway ---
const GatewayEditor = memo(({ gateway, index, onGatewayChange, isPending }: {
  gateway: IGateway;
  index: number;
  onGatewayChange: (index: number, field: string, value: string | boolean) => void;
  isPending: boolean;
}) => {
  
  // ✅ FIX: Safe access to credentials. If null/undefined, use empty object {}.
  const safeCredentials = gateway.credentials || {};
  const hasCredentials = Object.keys(safeCredentials).length > 0;

  return (
    <div className="p-4 border-b dark:border-gray-700 last:border-b-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{gateway.name}</h3>
        <label className="flex items-center cursor-pointer">
          <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">{gateway.enabled ? 'Enabled' : 'Disabled'}</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={gateway.enabled}
              onChange={e => onGatewayChange(index, 'enabled', e.target.checked)}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>

      {/* Only show inputs if enabled AND credentials exist */}
      {gateway.enabled && (
        <div className="space-y-3">
          {hasCredentials ? (
            Object.entries(safeCredentials).map(([key, value]) => (
              <FormField key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>
                <TextInput
                  value={value as string}
                  onChange={(e) => onGatewayChange(index, `credentials.${key}`, e.target.value)}
                  placeholder={`Enter ${key}`}
                  disabled={isPending}
                />
              </FormField>
            ))
          ) : (
            // Message for gateways like COD that have no API keys
            <p className="text-sm text-gray-500 italic">
              No additional settings required for this payment method.
            </p>
          )}
        </div>
      )}
    </div>
  );
});
GatewayEditor.displayName = 'GatewayEditor';

// === Main Tab Component ===
export default function PaymentGatewaysTab({ paymentGateways, setPaymentGateways, isPending }: PaymentGatewaysTabProps) {

  const handleGatewayChange = (index: number, field: string, value: string | boolean) => {
    setPaymentGateways(prevGateways => {
        const updatedGateways = [...prevGateways];
        const gatewayToUpdate = { ...updatedGateways[index] };
        
        // Ensure credentials object exists before updating
        if (!gatewayToUpdate.credentials) {
            gatewayToUpdate.credentials = {};
        }

        const path = field.split('.');

        if (path.length > 1) {
            gatewayToUpdate.credentials = { ...gatewayToUpdate.credentials, [path[1]]: value };
        } else {
            (gatewayToUpdate as any)[path[0]] = value;
        }
        updatedGateways[index] = gatewayToUpdate;
        return updatedGateways;
    });
  };

  return (
    <div className='space-y-6'>
      {paymentGateways.map((gw, index) => (
        <GatewayEditor
          key={gw.key}
          gateway={gw}
          index={index}
          onGatewayChange={handleGatewayChange}
          isPending={isPending}
        />
      ))}
    </div>
  );
}