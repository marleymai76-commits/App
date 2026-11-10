import { motion } from "motion/react";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <motion.div 
          className="h-8 w-1/3 bg-gray-200 rounded-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="h-10 w-32 bg-gray-200 rounded-lg border-b-2 border-amber-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            className="h-40 bg-gray-100 rounded-xl border border-gray-200 p-4 space-y-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-4 w-1/2 bg-gray-300 rounded" />
            <div className="h-8 w-3/4 bg-gray-300 rounded" />
            <div className="h-4 w-1/3 bg-amber-200 rounded" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <motion.div 
        className="h-64 bg-gray-100 rounded-xl border border-gray-200 p-6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-6 w-1/4 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full bg-gray-200 rounded" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
