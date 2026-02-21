// // payload.config.ts
// import { mongooseAdapter } from "@payloadcms/db-mongodb";
// import { lexicalEditor } from "@payloadcms/richtext-lexical";
// import path from "path";
// import { buildConfig } from "payload";
// import { fileURLToPath } from "url";
// import sharp from "sharp";
// import { Users } from "./src/collections/Users";

// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);

// // buildConfig ko directly export karein
// const finalConfig = buildConfig({
//   // Ek variable mein store kar lein agar console.log karna ho
//   admin: { user: "users" },
//   collections: [Users],
//   editor: lexicalEditor({}),
//   secret: process.env.PAYLOAD_SECRET || "",
//   db: mongooseAdapter({
//     url: process.env.PAYLOAD_MONGODB_URI || "",
//   }),
//   sharp,
//   typescript: {
//     outputFile: path.resolve(dirname, "payload-types.ts"),
//   },
// });

// // Console log sirf check karne ke liye. Ab yahan Promise { <pending> } nahi aana chahiye.
// console.log("payload.config.ts: The actual config object is:", finalConfig);

// export default finalConfig; // <-- DIRECT OBJECT EXPORT KAREIN
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { Users } from "./src/collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Direct export without extra console logs
export default buildConfig({
  admin: { user: "users" },
  collections: [Users],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.PAYLOAD_MONGODB_URI || "",
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});