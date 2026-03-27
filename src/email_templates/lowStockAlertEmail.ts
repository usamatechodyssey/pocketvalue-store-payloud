
// /src/email_templates/lowStockAlertEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface LowStockItem {
  _id: string; // Yeh Payload ki ID hogi (24-char hex)
  title: string;
  slug: string;
  variant: {
    name: string;
    sku?: string;
    stock: number;
  };
}

interface LowStockAlertProps {
  lowStockItems: LowStockItem[];
}

export const createLowStockAlertHtml = ({
  lowStockItems,
}: LowStockAlertProps): string => {
  // ✅ FIX: Ab link seedha Payload Admin ke Product Editor par jayega
  const adminBaseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/collections/products`;

  const bodyHtml = `
        <p style="margin-bottom: 20px; color: #4B5563;">The following items in your inventory have reached the low stock threshold and require immediate attention.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
            <thead>
                <tr style="background-color: #F9FAFB;">
                    <th style="padding: 12px; border-bottom: 2px solid #E5E7EB; color: #1F2937;">Product & Variant</th>
                    <th style="padding: 12px; border-bottom: 2px solid #E5E7EB; text-align: center; color: #1F2937;">Stock</th>
                    <th style="padding: 12px; border-bottom: 2px solid #E5E7EB; text-align: center; color: #1F2937;">Action</th>
                </tr>
            </thead>
            <tbody>
                ${lowStockItems
                  .map(
                    (item) => `
                    <tr style="border-bottom: 1px solid #F3F4F6;">
                        <td style="padding: 15px 12px;">
                            <p style="margin: 0; font-weight: bold; color: #111827;">${item.title}</p>
                            <p style="margin: 4px 0 0; font-size: 12px; color: #6B7280;">Variant: ${item.variant.name}</p>
                            <p style="margin: 4px 0 0; font-size: 11px; font-family: monospace; color: #9CA3AF;">SKU: ${item.variant.sku || "N/A"}</p>
                        </td>
                        <td style="padding: 15px 12px; text-align: center;">
                            <span style="display: inline-block; padding: 4px 10px; background-color: #FEE2E2; color: #B91C1C; border-radius: 99px; font-weight: bold; font-size: 14px;">
                                ${item.variant.stock}
                            </span>
                        </td>
                        <td style="padding: 15px 12px; text-align: center;">
                            <!-- ✅ FIX: Redirecting to Payload Editor using _id -->
                            <a href="${adminBaseUrl}/${item._id}" target="_blank" style="background-color: #F97316; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                                Update
                            </a>
                        </td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </tbody>
    `;

  return createMasterEmailLayout({
    preheaderText: `Inventory Alert: ${lowStockItems.length} items are running low.`,
    headerText: "Low Stock Critical Alert",
    bodyHtml: bodyHtml,
  });
};
