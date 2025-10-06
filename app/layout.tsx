import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ledgr – Business Management App",
  description:
    "Ledgr is a modern business management application for small businesses. Manage sales, expenses, payroll, inventory, and generate automated financial reports with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
