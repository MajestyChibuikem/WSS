import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCheckTokenQuery } from "../store/slices/apiSlice";

const useCheckAuthAndRedirect = () => {
  const pathname = usePathname();
  const { data, error, isLoading } = useCheckTokenQuery();
  const [checked, setChecked] = useState(false); // Prevents unnecessary re-renders

  useEffect(() => {
    const token = localStorage.getItem("wineryAuthToken");

    if (!token && pathname !== "/login") {
      window.location.href = "/login";
      return;
    }

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

  return { isLoading, error, data }; // Return any useful state if needed
};

export default useCheckAuthAndRedirect;
