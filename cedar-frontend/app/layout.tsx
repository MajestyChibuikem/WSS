import NewWineSideBar from "./components/new_wine_sidebar";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import "./globals.css";
import ProviderWrapper from "./components/ProviderWrapper";
import ProtectedRoute from "./ProtectedRoutes";

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
          <div className="flex">
            {typeof window !== "undefined" &&
            window.location.pathname === "/login" ? (
              <div>{children}</div> // Show login page without protection
            ) : (
              <ProtectedRoute>
                <div>
                  <Topbar />
                  {children}
                </div>
              </ProtectedRoute>
            )}
          </div>
        </ProviderWrapper>
      </body>
    </html>
  );
}
