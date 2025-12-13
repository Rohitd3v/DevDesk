"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../features/auth/services/authService";

const Icon = {
  Home: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
  FolderKanban: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true" {...props}>
      <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M8 13v5" /><path d="M12 11v7" /><path d="M16 14v4" />
    </svg>
  ),
  Ticket: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true" {...props}>
      <path d="M3 10a2 2 0 0 0 0 4h18a2 2 0 0 0 0-4H3z" />
      <path d="M7 10v4M12 10v4M17 10v4" />
    </svg>
  ),
  Logout: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  Menu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden="true" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden="true" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  User: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} aria-hidden="true" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Icon.Home /> },
    { href: "/projects", label: "Projects", icon: <Icon.FolderKanban /> },
    { href: "/tickets", label: "Tickets", icon: <Icon.Ticket /> },
    { href: "/profile", label: "Profile", icon: <Icon.User /> },
  ];

  return (
    <>
      {/* Toggle button (mobile only) */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-md shadow"
      >
        {open ? <Icon.X /> : <Icon.Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-md flex flex-col transition-transform duration-300 z-40
        ${open ? "translate-x-0 w-64" : "-translate-x-full w-64"} lg:translate-x-0 lg:w-64`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-600">DevDesk</h2>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <Icon.X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 text-black">
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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Icon.Logout /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
