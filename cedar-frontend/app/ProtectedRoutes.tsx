"use client";
import { LoaderCircle } from "lucide-react";
import useCheckAuthAndRedirect from "./hooks/useCheckAuthAndRedirect";
import Topbar from "./components/topbar";
import Page from "./login/page";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useCheckAuthAndRedirect();

  const isAuth = localStorage.getItem("isAuth");

  if (isLoading)
    return (
      <div className="h-[85vh] gap-4 w-full flex justify-center items-center">
        <LoaderCircle className="text-wBrand-accent animate-spin h-10 w-10" />
        <p>Checking authentication...</p>
      </div>
    );

  return (
    <>
      {isAuth == "true" && <Topbar />}
      {isAuth == "true" && children}
      {isAuth == "false" && <Page />}
    </>
  );
}
