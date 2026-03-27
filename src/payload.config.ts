import { mongooseAdapter } from "@payloadcms/db-mongodb"; // Hum MongoDB use karenge
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Brands } from "./collections/Brands";
import { Campaigns } from "./collections/Campaigns";
import { Products } from "./collections/Products";
import { Reviews } from "./collections/Reviews";
import { Coupons } from "./collections/Coupons";
import { Settings } from "./globals/Settings";
import { FAQ } from "./globals/FAQ";
import { Pages } from "./collections/Pages";
import { CouponBanners } from "./collections/CouponBanners";
import { Homepage } from "./globals/Homepage";
import { HeroCarousel } from "./collections/HeroCarousel";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },

    components: {
      // ✅ 1. Sidebar mein Product Explorer ka link add kiya
      afterNav: [
        "/app/components/admin/CustomNavLink",
        "/app/components/admin/CustomCategoryNavLink",
        "/app/components/admin/CustomDeletionNavLink",
        "/app/components/admin/CustomPaymentSettingsNavLink",
        "/app/components/payload-orders/CustomOrdersNavLink",
        "/app/components/payload-products/CustomProductsNavLink", // <--- Naya link
        "/app/components/payload-categories/CustomCategoryExplorerNavLink",
        "/app/components/payload-returns/CustomReturnsNavLink", // ✅ NEW
        "/app/components/payload-users/CustomUsersNavLink",
        "/app/components/payload-staff/CustomStaffNavLink", // ✅ NEW STAFF MANAGEMENT LINK
      ],

      views: {
        MarketingHub: {
          Component: "./app/(payload)/admin/views/MarketingHubView",
          path: "/marketing-hub",
        },
        ProductIntelligence: {
          Component: "./app/(payload)/admin/views/ProductIntelligenceView",
          path: "/product-intelligence",
        },
        InventoryRisk: {
          Component: "./app/(payload)/admin/views/InventoryRiskList",
          path: "/inventory-risk",
        },
        ImportProducts: {
          Component: "./app/(payload)/admin/views/ImportProducts",
          path: "/import-products",
        },
        ImportCategories: {
          Component: "./app/(payload)/admin/views/ImportCategories",
          path: "/import-categories",
        },
        PaymentSettings: {
          Component: "./app/(payload)/admin/views/PaymentSettings",
          path: "/payment-settings",
        },
        OrdersList: {
          Component: "./app/(payload)/admin/views/OrdersList",
          path: "/orders",
        },
        OrderDetail: {
          Component: "./app/(payload)/admin/views/OrderDetail",
          path: "/orders/:id",
        },

        // ✅ 2. Product Explorer View Register ki
        ProductExplorer: {
          Component: "./app/(payload)/admin/views/ProductsList",
          path: "/product-explorer", // Iska URL hoga: localhost:3000/admin/product-explorer
        },
        // 2. views object mein add karein:
        CategoryExplorer: {
          Component: "./app/(payload)/admin/views/CategoryExplorer",
          path: "/category-explorer",
        },
        // ✅ NEW RETURNS VIEWS
        ReturnsList: {
          Component: "./app/(payload)/admin/views/ReturnsList",
          path: "/returns",
        },
        ReturnDetail: {
          Component: "./app/(payload)/admin/views/ReturnDetail",
          path: "/returns/:id",
        },
        // views object mein:
        UsersExplorer: {
          Component: "./app/(payload)/admin/views/UsersList",
          path: "/users-explorer",
        },
        UserDetail: {
          Component: "./app/(payload)/admin/views/UserDetail", // Yeh hum aglay step mein banayenge
          path: "/users-explorer/:id",
        },
        dashboard: {
          Component: "./app/(payload)/admin/views/AnalyticsDashboard",
          path: "/", // Yeh root path handle karega
        },
        StaffManagement: {
          Component: "./app/(payload)/admin/views/StaffManagement",
          path: "/staff-management",
        },
      },
    },
  },
  editor: lexicalEditor({}), // Default settings
  db: mongooseAdapter({
    url: process.env.PAYLOAD_MONGODB_URI || "", // Aapka MongoDB Atlas URI
  }),
  collections: [
    Users,
    Categories,
    Media,
    Products,
    Brands,
    Campaigns,
    Reviews,
    Coupons,
    Pages,
    CouponBanners,
    HeroCarousel,
  ], // Yahan apni collections add karenge
  globals: [Settings, FAQ, Homepage],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
