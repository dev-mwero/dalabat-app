import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
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
  title: "IIBSO — The Artisanal Marketplace",
  description: "IIBSO connects discerning buyers with master artisanal producers across Kenya.",
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
          <div className="flex-1 flex flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
