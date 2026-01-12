import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { FacebookPixel } from "@/components/FacebookPixel";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GroomRoute - Smart Routing for Mobile Pet Groomers",
  description: "Optimize your grooming routes, reduce drive time, and serve more clients with GroomRoute.",
  icons: {
    icon: "/images/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className="scroll-smooth">
      <body className={inter.className}>
        <FacebookPixel />
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
