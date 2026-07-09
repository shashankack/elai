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
  title: "ELAI | India's All-in-One Accessories Marketplace",
  description:
    "ELAI is India's only dedicated accessories marketplace with 50+ curated categories  jewellery, fashion, hair, bags, beauty, tech, and lifestyle accessories. Where every look finds its flavour.",
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
