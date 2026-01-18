"use client";
import { useState } from "react";
import {
  Activity,
  Banknote,
  ChartNoAxesGantt,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBasket,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Roles } from "../utils/types";
import { getRoleEnum } from "../utils/helpers";
import { useLogoutMutation } from "../store/slices/apiSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import logo from "../img/logo-black-white.png";

function Topbar() {
  const pathname = usePathname();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Toggle sidebar
  const dispatch = useDispatch();

  const links = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4" />,
      showFor: [Roles.ADMIN, Roles.STAFF, Roles.SUPER_USER],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: <ChartNoAxesGantt className="h-4" />,
      showFor: [Roles.ADMIN, Roles.STAFF, Roles.SUPER_USER],
    },
    // {
    //   name: "Cart",
    //   href: "/cart",
    //   icon: <ShoppingBasket className="h-4" />,
    //   showFor: [Roles.ADMIN, Roles.STAFF, Roles.SUPER_USER],
    // },
    {
      name: "Activity",
      href: "/activity",
      icon: <Activity className="h-4" />,
      showFor: [Roles.ADMIN],
    },
    {
      name: "Sales",
      href: "/sales",
      icon: <Banknote className="h-4" />,
      showFor: [Roles.ADMIN, Roles.STAFF, Roles.SUPER_USER],
    },
    {
      name: "Users",
      href: "/users",
      icon: <UsersRound className="h-4" />,
      showFor: [Roles.ADMIN, Roles.STAFF, Roles.SUPER_USER],
    },
  ];

  const userRole = getRoleEnum(
    localStorage.getItem("wineryUserRole")?.toLowerCase() ?? ""
  );

  return (
    <div className="w-full h-[5rem] relative z-20 bg-wBrand-background_dark">
      {/* Topbar */}
      <div className="w-full h-[5rem] flex items-center px-5 xl:px-10 bg-wBrand-background_dark justify-between fixed top-0 left-0">
        {/* Logo */}
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-center">
            <Image
              src={logo}
              alt="Logo"
              height={40}
              className="object-contain"
            />
            <span className="text-[10px] text-wBrand-foreground/50">
              powered by{" "}
              <a
                href="https://teminix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wBrand-accent hover:underline"
              >
                Teminix.com
              </a>
            </span>
          </div>
          <h1 className="font-medium text-2xl text-wBrand-accent">Store Star</h1>
        </div>

        {/* Desktop Links */}
        <ul className="hidden xl:flex h-full items-center space-x-4">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              userRole &&
              link.showFor.includes(userRole) && (
                <Link key={index} href={link.href}>
                  <li
                    className={`hover:bg-wBrand-accent/10 px-4 border py-1 flex items-center gap-2 text-sm rounded-full cursor-pointer ${
                      isActive
                        ? "bg-wBrand-accent/20 border-transparent"
                        : "text-wBrand-foreground/40 border-wBrand-foreground/40"
                    }`}
                  >
                    <span className="text-sm">{link.icon}</span>
                    {link.name}
                  </li>
                </Link>
              )
            );
          })}
        </ul>

        {/* Logout (Desktop) */}
        <div
          onClick={() => {
            try {
              toast("Logging out...");
              localStorage.removeItem("wineryAuthToken");
              localStorage.removeItem("wineryUserRole");
              localStorage.setItem("isAuth", "false");
              dispatch({ type: "RESET_APP" });
              logout();
              toast.success("Logout successful");
              router.push("/login");
            } catch (error) {
              toast.error("Can't log out at the moment, try again later");
            }
          }}
          className="hidden xl:flex gap-1 cursor-pointer text-sm border p-1 px-4 pl-3 rounded-full items-center hover:text-wBrand-accent hover:border-wBrand-accent"
        >
          <LogOut className="h-3" />
          <p>Logout</p>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="xl:hidden text-wBrand-foreground focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar (Mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-wBrand-background_dark shadow-md transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 xl:hidden`}
      >
        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-wBrand-foreground"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Sidebar Content */}
        <div className="flex flex-col mt-16 space-y-4 px-4">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              userRole &&
              link.showFor.includes(userRole) && (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer ${
                      isActive
                        ? "bg-wBrand-accent/20"
                        : "hover:bg-wBrand-accent/10"
                    }`}
                  >
                    {link.icon}
                    <span className="text-sm">{link.name}</span>
                  </div>
                </Link>
              )
            );
          })}

          {/* Logout (Mobile) */}
          <button
            onClick={() => {
              try {
                toast("Logging out...");
                localStorage.removeItem("wineryAuthToken");
                localStorage.removeItem("wineryUserRole");
                localStorage.setItem("isAuth", "false");
                dispatch({ type: "RESET_APP" });
                logout();
                toast.success("Logout successful");
                router.push("/login");
              } catch (error) {
                toast.error("Can't log out at the moment, try again later");
              }
            }}
            className="flex items-center gap-2 p-3 rounded-lg text-left hover:bg-wBrand-accent/10"
          >
            <LogOut className="h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
