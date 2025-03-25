"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCheckTokenQuery } from "./store/slices/apiSlice";
import { LoaderCircle } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data, error, isLoading } = useCheckTokenQuery();

  const [checked, setChecked] = useState(false); // Prevents unnecessary re-renders

  useEffect(() => {
    if (!isLoading && !checked) {
      setChecked(true); // Ensures this logic runs only once per render cycle

      if (
        (error || data?.message !== "Token is valid") &&
        pathname !== "/login"
      ) {
        window.location.href = "/login";
      } else if (data?.message === "Token is valid" && pathname === "/login") {
        window.location.href = "/";
      }
    }
  }, [data, error, isLoading, pathname, checked]);

  if (isLoading || !checked)
    return (
      <div className="h-[85vh] gap-4 w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin h-10 w-10" />
        <p>Checking authentication...</p>
      </div>
    );

  return <>{children}</>;
}
