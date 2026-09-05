import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaxPresto Brevet - Platform Latihan Ujian Brevet Pajak A & B",
  description: "Latihan soal dan pembahasan ujian Brevet Pajak A & B interaktif lengkap dengan rumus dan konsep perpajakan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
