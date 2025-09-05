import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

export const metadata: Metadata = {
  title: "DevDesk",
  description: "A project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased flex font-sans`}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-64 flex-1 bg-gray-50 min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
