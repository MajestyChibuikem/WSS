"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCheckTokenQuery } from "./store/slices/apiSlice";
import { LoaderCircle } from "lucide-react";
import useCheckAuthAndRedirect from "./hooks/useCheckAuthAndRedirect";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useCheckAuthAndRedirect();

  if (isLoading)
    return (
      <div className="h-[85vh] gap-4 w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin h-10 w-10" />
        <p>Checking authentication...</p>
      </div>
    );

  return <>{children}</>;
}
