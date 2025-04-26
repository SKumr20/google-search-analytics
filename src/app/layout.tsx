"use client";  

import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Navbar from "@/components/sections/Navbar.jsx";
import { ThemeProvider } from "@/components/ThemeProvider.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </ThemeProvider>
          </SessionProvider>
      </body>
    </html>
  );
}
