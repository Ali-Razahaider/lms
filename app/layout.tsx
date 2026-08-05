import type { Metadata } from "next";
import { Geist_Mono, Onest } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lume — Modern Learning",
  description: "A clean, modern learning management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1 bg-bg-subtle">{children}</main>
        <footer className="border-t border-border bg-surface py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted sm:px-6">
            © {new Date().getFullYear()} Lume. Built for learning.
          </div>
        </footer>
      </body>
    </html>
  );
}