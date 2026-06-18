import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const fontHeading = localFont({
  src: "../public/fonts/Kingred/Kingred.otf",
  variable: "--font-heading",
  display: "swap",
});

const fontSubheading = localFont({
  src: [
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial DemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-subheading",
  display: "swap",
});

const fontBody = localFont({
  src: [
    {
      path: "../public/fonts/TT/TT Interphases Pro Trial Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elai | India's All-in-One Accessories Marketplace",
  description:
    "Elai is India's first dedicated accessories marketplace. Shop 40+ categories — fashion, ethnic, tech, luxury, beauty, and more. Elai style. Elai you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontHeading.variable} ${fontSubheading.variable} ${fontBody.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
