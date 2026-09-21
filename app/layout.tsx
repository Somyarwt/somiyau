import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323, Caveat } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

const caveat = Caveat({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "A Love Story Awaits 💜",
  description: "A retro confession from the heart.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07050d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${vt323.variable} ${caveat.variable} h-full dark`}
    >
      <body className="min-h-full bg-[#07050d] text-white flex flex-col antialiased selection:bg-purple-600 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
