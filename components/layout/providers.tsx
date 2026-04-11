"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="zylmero-theme"
      disableTransitionOnChange
    >
      {children}
      <Toaster
        richColors
        position="top-right"
        closeButton
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "group border border-white/[0.08] bg-card/95 backdrop-blur-xl shadow-xl",
            success: "border-primary/20",
            error: "border-destructive/30",
          },
        }}
      />
    </ThemeProvider>
  );
}

export default Providers;
export { Providers };
