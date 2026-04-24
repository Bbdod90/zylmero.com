import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { BRAND_NAME } from "@/lib/brand";
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/theme-color";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  /** Default dark; ThemeColorSync overschrijft na mount voor licht/donker match met body. */
  themeColor: "#05070D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth dark" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} zm-app-mesh min-h-dvh bg-background font-sans text-[15px] antialiased transition-colors duration-300 sm:text-[15px]`}
      >
        <Script id="zylmero-theme-init" strategy="beforeInteractive">
          {`(function(){var L="${THEME_COLOR_LIGHT}",D="${THEME_COLOR_DARK}";try{var k='zylmero-theme',s=localStorage.getItem(k),r=document.documentElement,dark=s!=='light';if(dark){r.classList.add('dark');r.style.backgroundColor=D;}else{r.classList.remove('dark');r.style.backgroundColor=L;}document.body.style.backgroundColor=r.style.backgroundColor;}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor=D;document.body.style.backgroundColor=D;}})();`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
