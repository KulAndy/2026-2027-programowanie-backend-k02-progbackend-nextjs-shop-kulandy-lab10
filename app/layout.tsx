import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sklep",
  description: "Sklep internetowy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className="navigation">
          <Link href="/">Sklep</Link> <Link href="/product-list">Produkty</Link>
          <Link href="/basket">Koszyk</Link>
          <Link href="/order-history">Historia zamówień</Link>
          <Link href="/about">O projekcie</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
