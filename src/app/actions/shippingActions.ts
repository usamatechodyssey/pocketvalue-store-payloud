// "use server";

// import { client } from "@/sanity/lib/client";
// import { ShippingRule } from "@/types";
// import groq from "groq";

// // ✅ FIX: Is query mein 'isOnCall' add karna zaroori tha
// const GET_SHIPPING_RULES_QUERY = groq`
//   *[_type == "settings" && _id == "settings"][0] {
//     "shippingRules": shippingRules[]{
//       "_id": _key, 
//       name,
//       minAmount,
//       cost,
//       isOnCall  
//     }
//   }
// `;

// /**
//  * A Server Action that can be safely called from the StateContext on initial load
//  * to fetch all available shipping rules from the CMS.
//  * @returns An array of ShippingRule objects.
//  */
// export async function getShippingRulesAction(): Promise<ShippingRule[]> {
//     try {
//         const result = await client.fetch(GET_SHIPPING_RULES_QUERY);
//         if (!result || !result.shippingRules) {
//             console.warn("No shipping rules found in Sanity settings.");
//             return [];
//         }
        
//         const sortedRules = result.shippingRules.sort(
//             (a: ShippingRule, b: ShippingRule) => b.minAmount - a.minAmount
//         );
//         return sortedRules;

//     } catch (error) {
//         console.error("Error in getShippingRulesAction:", error);
//         return [];
//     }
// }
"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ShippingRule } from "@/types";

// 🛑 OLD SANITY IMPORTS (Commented out for reference)
// import { client } from "@/sanity/lib/client";
// import groq from "groq";

/**
 * A Server Action that fetches available shipping rules from Payload CMS Globals.
 * It replaces the old Sanity query logic.
 * @returns An array of ShippingRule objects.
 */
export async function getShippingRulesAction(): Promise<ShippingRule[]> {
    try {
        const payload = await getPayload({ config: configPromise });
        
        // Fetch Settings Global from Payload
        // Note: Payload mein Settings ek 'Global' hai, Collection nahi.
        const settings = await payload.findGlobal({
            slug: 'settings',
        });

        // Validation: Agar settings ya rules nahi mile to empty array bhejo
        if (!settings || !settings.shippingRules || settings.shippingRules.length === 0) {
            console.warn("No shipping rules found in Payload settings.");
            return [];
        }
        
        // Map Payload Array to expected ShippingRule Interface
        // Payload array items ko 'id' deta hai, humein '_id' chahiye frontend ke liye
        const mappedRules: ShippingRule[] = settings.shippingRules.map((rule: any) => ({
            _id: rule.id || Math.random().toString(), 
            name: rule.name,
            minAmount: rule.minAmount,
            cost: rule.cost,
            isOnCall: rule.isOnCall || false, // Default false agar value na ho
        }));

        // Sort descending by minAmount (Highest amount first)
        // Ye wahi logic hai jo aapke purane code mein thi
        const sortedRules = mappedRules.sort(
            (a: ShippingRule, b: ShippingRule) => b.minAmount - a.minAmount
        );
        
        return sortedRules;

    } catch (error) {
        console.error("Error in getShippingRulesAction (Payload):", error);
        return [];
    }
}