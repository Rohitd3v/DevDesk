"use client";

import { useAuth } from "../contexts/AuthContext";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Don't show sidebar on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/";
  const showSidebar = !loading && user && !isAuthPage;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? "ml-64" : ""} ${isAuthPage ? "" : "p-6"}`}>
        {children}
      </main>
    </div>
  );
};