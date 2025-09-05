"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Ticket, LogOut } from "lucide-react";
import { logout } from "../features/auth/services/authService";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { href: "/projects", label: "Projects", icon: <FolderKanban size={18} /> },
    { href: "/tickets", label: "Tickets", icon: <Ticket size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-blue-600">DevDesk</h2>
      </div>

      <div className="flex-1 p-4 space-y-2 text-black">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${
                pathname.startsWith(item.href)
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};
