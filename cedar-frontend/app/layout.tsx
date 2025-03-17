import NewWineSideBar from "./components/new_wine_sidebar";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import "./globals.css";
import ProviderWrapper from "./components/ProviderWrapper";
import ProtectedRoute from "./ProtectedRoutes";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  typeof window !== "undefined" && console.log(window.location.pathname);
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>
          <ProtectedRoute>
            <div className="">
              <Topbar />
              {children}
            </div>
          </ProtectedRoute>
        </ProviderWrapper>
        <ToastContainer />
      </body>
    </html>
  );
}
