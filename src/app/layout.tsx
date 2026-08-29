import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmpForge",
  description: "Internal employee lifecycle platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthSessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
