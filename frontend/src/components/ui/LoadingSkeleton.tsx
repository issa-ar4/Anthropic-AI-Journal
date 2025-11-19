import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const EntryCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-2" />
    <Skeleton className="h-4 w-4/6 mb-4" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className="h-5 w-32" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export const CanvasSkeleton: React.FC = () => (
  <div className="bg-gray-50 rounded-lg border border-gray-200 p-8">
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
        <Skeleton className="h-4 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  </div>
);
