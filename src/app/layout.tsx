import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRINETRA",
  description: "Predict. Verify. Protect. Even Offline.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TRINETRA",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B3530",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerRegister />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
