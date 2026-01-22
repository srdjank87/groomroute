import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { FacebookPixel } from "@/components/FacebookPixel";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GroomRoute - Smart Routing for Mobile Pet Groomers",
  description: "Optimize your grooming routes, reduce drive time, and serve more clients with GroomRoute. The scheduling app built specifically for mobile dog groomers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/icon.svg",
    apple: "/images/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GroomRoute",
  },
  metadataBase: new URL("https://groomroute.com"),
  openGraph: {
    title: "GroomRoute - Smart Routing for Mobile Pet Groomers",
    description: "Optimize your grooming routes, reduce drive time, and serve more clients. Built by groomers, for groomers.",
    url: "https://groomroute.com",
    siteName: "GroomRoute",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "GroomRoute - Smart Routing for Mobile Pet Groomers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GroomRoute - Smart Routing for Mobile Pet Groomers",
    description: "Optimize your grooming routes, reduce drive time, and serve more clients. Built by groomers, for groomers.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#A5744A",
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
