"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  LogOut,
  FileText,
} from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admindashboard",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admindashboard/users",
    },
    {
      label: "Terms & Conditions",
      icon: FileText,
      href: "/admindashboard/terms",
    },
    {
      label: "Invoices",
      icon: Receipt,
      href: "/admindashboard/invoices",
    },
  ];

  return (
    <div className="hidden md:flex h-full w-56 flex-col bg-white border-r">
      <div className="p-6">
        <h1 className="text-lg font-bold">Admin Panel</h1>
      </div>
      <div className="flex flex-col flex-grow gap-2 p-4">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              pathname === route.href && "bg-[rgb(37,99,235)]"
            )}
            asChild
          >
            <Link href={route.href}>
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
      <div className="p-4 mt-auto">
        <LogoutLink>
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </LogoutLink>
      </div>
    </div>
  );
}
