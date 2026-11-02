import type { Metadata, Viewport } from "next";
import { Anek_Devanagari, Anek_Latin, Hind } from "next/font/google";
import "./globals.css";

const hind = Hind({ variable: "--font-hind", subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"] });
const anek = Anek_Latin({ variable: "--font-anek", subsets: ["latin"], axes: ["wdth"] });
const anekDeva = Anek_Devanagari({ variable: "--font-anek-deva", subsets: ["devanagari"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "Check First",
  description: "Check a face cream's label for steroids and mercury before you buy it, then get safer next steps for your skin from a YouCam skin scan.",
};

export const viewport: Viewport = { themeColor: "#fff8f4" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hind.variable} ${anek.variable} ${anekDeva.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
