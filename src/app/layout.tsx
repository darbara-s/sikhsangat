import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/context/AuthContext";

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
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <Navigation />
          <AuthModal />
          <main className="flex-grow pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
