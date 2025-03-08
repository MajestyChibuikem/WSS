"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      console.log("token in here", token);
      if (!token) {
        router.push("/login"); // Redirect if not authenticated
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth); // Listen for changes in localStorage
    return () => window.removeEventListener("storage", checkAuth);
  }, [router]);

  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }

  return <>{children}</>;
}
