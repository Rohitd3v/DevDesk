import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
