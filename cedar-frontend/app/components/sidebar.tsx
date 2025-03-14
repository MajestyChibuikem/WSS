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
function Sidebar() {
  const pathname = usePathname();
  const links = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard /> },
    { name: "Inventory", href: "/inventory", icon: <ChartNoAxesGantt /> },
    { name: "Cart", href: "/cart", icon: <ShoppingBasket /> },
    { name: "Activity", href: "/activity", icon: <Activity /> },
    { name: "Users", href: "/users", icon: <UsersRound /> },
  ];

  return (
    <div className="w-[18rem] ">
      <div className="w-[18rem] fixed top-0 left-0 h-[100vh] space-y-6">
        <div className="text-xl p-4 flex gap-x-4 items-center border-b border-b-wBrand-accent/50">
          <div className="p-2 text-2xl text-wBrand-background stroke-4 bg-wBrand-accent rounded-lg">
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
          <h1 className="font-medium">WINERY</h1>
        </div>
        <ul className="space-y-2 px-4">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link href={link.href}>
                <li
                  key={index}
                  className={`hover:bg-wBrand-accent/10 p-3 rounded-lg flex items-center gap-3 text-lg cursor-pointer ${
                    isActive
                      ? "bg-wBrand-accent/20"
                      : "text-wBrand-foreground/60"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
