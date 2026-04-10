import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloserFlow — AI-antwoorden die meer werk opleveren",
  description:
    "Verlies geen klanten door trage reacties. CloserFlow zet WhatsApp- en inboxberichten om in afspraken, offertes en omzet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} cf-app-mesh min-h-screen bg-background font-sans text-[15px] antialiased transition-colors duration-300 sm:text-[15.5px]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
