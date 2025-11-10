import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { NotificationProvider, NotificationContainer } from "@/components/Notification";
import { ToastProvider, ToastContainer } from "@/components/Toast";
import "@/components/Notification/notification.css";
import "@/components/Toast/toast.css";
import ThemeProvider from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "訂餐管理系統",
  description: "企業訂餐管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen grid grid-rows-[auto_1fr] min-w-xs`}
      ><SessionProvider>
          <ThemeProvider>
            <NotificationProvider>
              <ToastProvider>
                <Navbar />
                {children}
                <NotificationContainer />
                <ToastContainer />
              </ToastProvider>
            </NotificationProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
