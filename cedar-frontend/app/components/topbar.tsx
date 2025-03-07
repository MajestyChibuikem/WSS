"use client";
import {
  Activity,
  ChartNoAxesGantt,
  LayoutDashboard,
  ShoppingBasket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

//Inventory
//
function Topbar() {
  const pathname = usePathname();
  const links = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4" />,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: <ChartNoAxesGantt className="h-4" />,
    },
    { name: "Cart", href: "/cart", icon: <ShoppingBasket className="h-4" /> },
    { name: "Activity", href: "/activity", icon: <Activity className="h-4" /> },
    { name: "Users", href: "/users", icon: <UsersRound className="h-4" /> },
  ];

  return (
    <div className="w-full h-[5rem] bg-background">
      <div className="w-full h-[5rem] flex items-center px-10 bg-background justify-between fixed top-0 left-0">
        <div className="text-sm flex gap-x-4 items-center">
          <div className="p-2 text-2xl text-background stroke-4 bg-accent rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-wine"
            >
              <path d="M8 22h8" />
              <path d="M7 10h10" />
              <path d="M12 15v7" />
              <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
            </svg>
          </div>
          <h1 className="font-medium text-2xl text-accent">WINERY</h1>
        </div>
        <ul className="px-4 flex h-full items-center space-x-2">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link href={link.href}>
                <li
                  key={index}
                  className={`hover:bg-accent/10 px-4 border py-1 flex items-center gap-2 text-sm rounded-full cursor-pointer ${
                    isActive
                      ? "bg-accent/20 border-transparent"
                      : "text-foreground/40 border-foreground/40"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.name}
                </li>
              </Link>
            );
          })}
        </ul>
        <div></div>
      </div>
    </div>
  );
}

export default Topbar;
