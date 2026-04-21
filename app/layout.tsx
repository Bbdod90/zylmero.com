import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import "@/styles/globals.css";

const Providers = dynamic(() => import("@/components/layout/providers"), {
  ssr: true,
});

/* Variabel font: geen vaste weight-array — voorkomt webpack/Safari issues met font-loader. */
const sans = Inter({
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
  title: `${BRAND_NAME} — gemiste aanvragen kosten omzet`,
  description: `Voor zzp en kleine bedrijven: snel reageren op mail, WhatsApp en site-aanvragen, serieuze leads vasthouden en opvolgen — zonder extra personeel op kantoor.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(210 32% 98%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(228 32% 4%)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} zm-app-mesh min-h-dvh bg-background font-sans text-[15px] antialiased transition-colors duration-300 sm:text-[15px]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
