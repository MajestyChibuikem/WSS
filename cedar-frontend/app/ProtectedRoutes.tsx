"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckTokenQuery } from "./store/slices/apiSlice";
import Page from "./login/page";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data, error, isLoading } = useCheckTokenQuery(); // Call the query

  useEffect(() => {
    if (!isLoading) {
      if (error || data?.message !== "Token is valid") {
        console.log("Token is invalid or expired");
      }

      if (data?.message == "Token is valid") {
        console.log("Token is valid, expires at:", data.expires_at);
        setIsAuthenticated(true);
        router.push("/");
      }
    }
  }, [data, error, isLoading, router]);

  if (isLoading) return <p>Checking authentication...</p>;

  return isAuthenticated ? <>{children}</> : <Page />;
}
