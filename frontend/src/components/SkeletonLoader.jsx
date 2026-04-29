import React from 'react';
import { motion } from 'framer-motion';

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-200/70 before:absolute before:inset-0 before:-translate-x-full before:animate-skeleton-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/65 before:to-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-10">
        <div className="mb-12 space-y-4">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-10 w-full max-w-xl rounded-lg" />
          <SkeletonBlock className="h-4 w-full max-w-md" />
        </div>
        <SkeletonCardGrid count={6} />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
          className="w-full max-w-[320px]"
        >
          <div className="rounded-[2rem] bg-[#f5f5f5] p-4">
            <SkeletonBlock className="aspect-square rounded-[1.65rem] bg-slate-100" />
          </div>
          <div className="mt-4 space-y-3 px-2">
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-9 w-full rounded-lg" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="border-b bg-gray-50 px-4 py-3">
        <SkeletonBlock className="h-4 w-44 rounded-md" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <SkeletonBlock
                key={columnIndex}
                className={`h-4 rounded-md ${columnIndex === 0 ? 'w-4/5' : columnIndex === columns - 1 ? 'w-2/3 justify-self-end' : 'w-full'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
          className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-4 w-36 rounded-md" />
              <SkeletonBlock className="h-4 w-56 rounded-md" />
            </div>
            <SkeletonBlock className="hidden h-8 w-24 rounded-full sm:block" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
