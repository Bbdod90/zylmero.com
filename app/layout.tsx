import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import "@/styles/globals.css";

const Providers = dynamic(() => import("@/components/layout/providers"), {
  ssr: true,
});

/* Variabel font: geen vaste weight-array — voorkomt webpack/Safari issues met font-loader. */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — AI-antwoorden die meer werk opleveren`,
  description: `Verlies geen klanten door trage reacties. ${BRAND_NAME} zet WhatsApp- en inboxberichten om in afspraken, offertes en omzet.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} zm-app-mesh min-h-screen bg-background font-sans text-[15px] antialiased transition-colors duration-300 sm:text-[15.5px]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
