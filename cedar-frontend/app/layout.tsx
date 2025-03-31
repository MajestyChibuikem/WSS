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
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>
          <ProtectedRoute>
            <div className="overflow-hidden">
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
