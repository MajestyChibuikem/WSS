import NewWineSideBar from "./components/new_wine_sidebar";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Topbar />
        <div className="flex">
          {/* <Sidebar /> */}
          <div>{children}</div>
          {/* <NewWineSideBar /> */}
        </div>
      </body>
    </html>
  );
}
