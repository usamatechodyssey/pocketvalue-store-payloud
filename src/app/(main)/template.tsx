"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Thora kam distance
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        ease: "easeOut", 
        duration: 0.25 // Pehle 0.35 tha, ab 0.25 (Tez) kar diya
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}