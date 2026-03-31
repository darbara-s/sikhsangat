import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sikh Sangat Events",
  description: "Connecting Sikh Sangat with Ragis, Kirtaniyes, and Katha Vachaks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] pb-16 md:pb-0">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-[var(--surface)] border-b border-gray-100 dark:border-gray-800" />}>
            <Navigation />
          </Suspense>
          <AuthModal />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
