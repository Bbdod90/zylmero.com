import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "cf-scan": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "cf-slide": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "cf-hot-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 hsl(32 95% 55% / 0.35)",
          },
          "50%": {
            boxShadow: "0 0 20px 2px hsl(32 95% 50% / 0.2)",
          },
        },
        "cf-shimmer-bg": {
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
        "cf-scan": "cf-scan 2s ease-in-out infinite",
        "cf-slide": "cf-slide 0.45s ease-out forwards",
        "cf-hot-pulse": "cf-hot-pulse 2.4s ease-in-out infinite",
        "cf-shimmer-bg": "cf-shimmer-bg 1.8s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--ring) / 0.18), 0 18px 44px -24px hsl(var(--primary) / 0.28)",
        card: "0 4px 24px -10px rgb(0 0 0 / 0.45), 0 1px 0 0 hsl(220 16% 18% / 0.4)",
        premium:
          "0 1px 0 0 hsl(220 13% 88% / 0.9), 0 12px 40px -16px rgb(15 23 42 / 0.08), 0 0 0 1px hsl(220 13% 88% / 0.5)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
