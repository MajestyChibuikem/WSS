"use client";
import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-wBrand-foreground/10 rounded",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 bg-wBrand-background_light/30 rounded-xl">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function SkeletonProductRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-wBrand-background_light/30 rounded-xl">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-6 p-3 px-8 rounded-xl">
      <Skeleton className="h-4 w-[10%]" />
      <Skeleton className="h-4 w-[30%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[20%]" />
      <Skeleton className="h-4 w-[10%]" />
      <Skeleton className="h-8 w-[10%] rounded" />
    </div>
  );
}

export function SkeletonDashboardCard() {
  return (
    <div className="w-full sm:w-[13rem] h-[6rem] flex flex-col justify-center border border-wBrand-foreground/30 bg-wBrand-background rounded-xl p-3 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-20" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function SkeletonUserCard() {
  return (
    <div className="p-6 bg-wBrand-background_light/30 rounded-xl space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonActivityCard() {
  return (
    <div className="flex items-center gap-3 p-3 bg-wBrand-background_light/20 rounded-lg">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonCartItem() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-8" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

// Loading states for different pages
export function InventoryPageSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <SkeletonProductRow key={i} />
      ))}
    </div>
  );
}

export function SalesPageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex w-full gap-x-6 max-w-full bg-wBrand-background_light/60 text-wBrand-accent text-xs p-3 font-semibold px-8 rounded-xl">
        <div className="w-[10%]">ID</div>
        <div className="w-[30%]">ITEM</div>
        <div className="w-[20%]">BY</div>
        <div className="w-[20%]">DATE</div>
        <div className="w-[10%] text-right">COST</div>
        <div className="w-[10%] text-center">RECEIPT</div>
      </div>
      {[...Array(6)].map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Revenue skeleton */}
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Cards skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <SkeletonDashboardCard />
        <SkeletonDashboardCard />
      </div>

      {/* Bottom section skeleton */}
      <div className="flex flex-col lg:flex-row gap-10 pt-10">
        <div className="w-full lg:w-1/2 space-y-4">
          <Skeleton className="h-6 w-24" />
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="w-full lg:w-1/2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonActivityCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonCartItem key={i} />
        ))}
      </div>
      <div className="w-full lg:w-80 border border-wBrand-foreground/30 rounded-xl p-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="border-t border-wBrand-foreground/10 pt-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <SkeletonUserCard key={i} />
      ))}
    </div>
  );
}
