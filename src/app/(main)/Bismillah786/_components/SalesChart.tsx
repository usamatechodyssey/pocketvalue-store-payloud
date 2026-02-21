// /src/app/Bismillah786/_components/SalesChart.tsx (The Dynamic Wrapper)

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// ✅ FIX: Dynamic load the heavy chart library!
const DynamicChart = dynamic(
  // Use the new path for the actual chart content
  () => import('./charts/SalesChartContent'), 
  {
    ssr: false, // Charts never need Server-Side Rendering
    loading: () => (
        <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
    ),
  }
);

interface SalesChartProps {
  data: { name: string; sales: number }[];
}

export default function SalesChart(props: SalesChartProps) {
  // Ye wrapper code chota hai, aur recharts ko sirf Admin page par load karega
  return <DynamicChart {...props} />;
}