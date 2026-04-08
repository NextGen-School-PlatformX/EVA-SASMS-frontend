import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from "@/src/components/layout/ThemeProviderWrapper";
import { AuthProvider } from "@/src/context/AuthContext";
import { NotificationProvider } from "@/src/context/NotificationContext";
import { BrandingProvider } from "@/src/context/BrandingContext";
import { MainLayout } from "@/src/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SASMS - Student & Staff Administrative Management System",
  description: "Administrative web application for Student, Staff, and SuperAdmin dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProviderWrapper>
          <BrandingProvider>
            <NotificationProvider>
              <AuthProvider>
                <MainLayout>{children}</MainLayout>
              </AuthProvider>
            </NotificationProvider>
          </BrandingProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
