
"use client";

import { Dispatch, SetStateAction, memo } from "react";
import { ShippingRule } from "@/types";
import { PlusCircle, Trash2, Info } from "lucide-react";

// --- Type Definitions for Props ---
interface ShippingRulesTabProps {
  shippingRules: ShippingRule[];
  setShippingRules: Dispatch<SetStateAction<ShippingRule[]>>;
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
TextInput.displayName = "TextInput";

// === Main Tab Component ===
export default function ShippingRulesTab({
  shippingRules,
  setShippingRules,
  isPending,
}: ShippingRulesTabProps) {

  // ✅ UPDATED HANDLER: Handles Boolean, Number, and String
  const handleShippingChange = (
    index: number,
    field: keyof Omit<ShippingRule, "_id">,
    value: string | number | boolean
  ) => {
    const updatedRules = [...shippingRules];

    // Logic 1: Agar Cost/MinAmount change ho raha hai to number mein convert karo
    if (field === "cost" || field === "minAmount") {
      value = Number(value) >= 0 ? Number(value) : 0;
    }

    // Logic 2: Agar "On Call" tick kiya, to Cost ko 0 kardo
    if (field === 'isOnCall' && value === true) {
        (updatedRules[index] as any).cost = 0;
    }

    (updatedRules[index] as any)[field] = value;
    setShippingRules(updatedRules);
  };

  const addShippingRule = () => {
    setShippingRules((prevRules) => [
      ...prevRules,
      {
        _id: `new_${Date.now()}_${Math.random()}`,
        name: "",
        minAmount: 0,
        cost: 0,
        isOnCall: false, // ✅ Initialize new rule with isOnCall false
      },
    ]);
  };

  const removeShippingRule = (index: number) => {
    setShippingRules((prevRules) => prevRules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Shipping Costs</h2>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3 text-sm">
        <Info
          size={18}
          className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
        />
        <p>
          Rules are checked from highest to lowest subtotal. The first rule that
          matches will be applied.
        </p>
      </div>

      {shippingRules.map((rule, index) => (
        <div
          key={rule._id || `rule-${index}`}
          className="grid grid-cols-1 md:grid-cols-8 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600"
        >
          {/* Rule Name (3 cols) */}
          <div className="md:col-span-3">
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Rule Name
            </label>
            <TextInput
              value={rule.name}
              onChange={(e) =>
                handleShippingChange(index, "name", e.target.value)
              }
              placeholder="e.g., Standard, Heavy Items"
              disabled={isPending}
            />
          </div>

          {/* Min Subtotal (2 cols) */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Minimum Subtotal (Rs.)
            </label>
            <TextInput
              type="number"
              value={rule.minAmount}
              onChange={(e) =>
                handleShippingChange(index, "minAmount", e.target.value)
              }
              disabled={isPending}
            />
          </div>

          {/* Cost / On Call (2 cols) */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Cost (Rs.)
            </label>
            
            {rule.isOnCall ? (
                // ✅ Display when On Call is CHECKED
                <div className="h-10.5 flex items-center px-3 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500 cursor-not-allowed">
                    Calculated on Call
                </div>
            ) : (
                // ✅ Display when On Call is UNCHECKED
                <TextInput
                    type="number"
                    value={rule.cost}
                    onChange={(e) =>
                        handleShippingChange(index, "cost", e.target.value)
                    }
                    placeholder="0 for Free"
                    disabled={isPending}
                />
            )}

            {/* ✅ Checkbox Toggle */}
            <div className="mt-2 flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id={`onCall-${index}`}
                    checked={rule.isOnCall || false}
                    onChange={(e) => handleShippingChange(index, 'isOnCall', e.target.checked)}
                    className="w-4 h-4 text-brand-primary rounded cursor-pointer accent-brand-primary"
                    disabled={isPending}
                />
                <label htmlFor={`onCall-${index}`} className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                    Set as "Shipping on Call"
                </label>
            </div>
          </div>

          {/* Delete Button (1 col) */}
          <div className="md:col-span-1 flex items-start justify-center pt-6">
            <button
              onClick={() => removeShippingRule(index)}
              className="p-2.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors"
              disabled={isPending}
              aria-label="Remove Rule"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addShippingRule}
        className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline disabled:opacity-50 mt-2"
        disabled={isPending}
      >
        <PlusCircle size={16} /> Add New Rule
      </button>
    </div>
  );
}