import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daalabat",
  description: "Daalabat marketplace on Next.js 16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <CartDrawer />
        </AppProviders>
      </body>
    </html>
  );
}
