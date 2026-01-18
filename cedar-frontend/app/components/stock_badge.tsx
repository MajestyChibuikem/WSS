"use client";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface StockBadgeProps {
  stock: number;
  lowStockThreshold?: number;
  className?: string;
  showLabel?: boolean;
}

export function StockBadge({
  stock,
  lowStockThreshold = 10,
  className,
  showLabel = true,
}: StockBadgeProps) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;

  if (!isOutOfStock && !isLowStock) {
    return null;
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        isOutOfStock
          ? "bg-red-500/20 text-red-400"
          : "bg-yellow-500/20 text-yellow-400",
        className
      )}
    >
      {isOutOfStock ? (
        <>
          <XCircle className="h-3 w-3" />
          {showLabel && <span>Out of Stock</span>}
        </>
      ) : (
        <>
          <AlertTriangle className="h-3 w-3" />
          {showLabel && <span>Low Stock ({stock})</span>}
        </>
      )}
    </div>
  );
}

export function StockIndicator({
  stock,
  lowStockThreshold = 10,
}: {
  stock: number;
  lowStockThreshold?: number;
}) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;
  const isHealthy = stock > lowStockThreshold;

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "h-2 w-2 rounded-full",
          isOutOfStock && "bg-red-500",
          isLowStock && "bg-yellow-500",
          isHealthy && "bg-green-500"
        )}
      />
      <span
        className={clsx(
          "text-xs",
          isOutOfStock && "text-red-400",
          isLowStock && "text-yellow-400",
          isHealthy && "text-gray-200"
        )}
      >
        {stock}
      </span>
    </div>
  );
}
