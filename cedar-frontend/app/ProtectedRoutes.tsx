"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCheckTokenQuery } from "./store/slices/apiSlice";
import Page from "./login/page";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, error, isLoading } = useCheckTokenQuery(); // Call the query

  useEffect(() => {
    if (!isLoading) {
      if (
        (error || data?.message !== "Token is valid") &&
        window.location.pathname != "/login"
      ) {
        window.location.href = "/login";
      }

      if (
        data?.message == "Token is valid" &&
        window.location.pathname == "/login"
      ) {
        window.location.href = "/";
      }
    }
  }, [data, error, isLoading, router]);

  if (isLoading)
    return (
      <div className="h-[85vh] gap-4 w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin h-10 w-10" />
        <p>Checking authentication...</p>
      </div>
    );

  return <>{children}</>;
}
