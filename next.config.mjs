import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

/**
 * Omgevingsvariabelen voor runtime (o.a. server routes):
 * - OPENAI_API_KEY / OPENAI_MODEL — alleen server; zet op productie in hosting-dashboard (Railway/Vercel/…),
 *   niet in git. Zie .env.example en docs/OPENAI-DEPLOY.md.
 * - Supabase, Stripe, CRON_SECRET, enz. — zie .env.example.
 *
 * Always load `.env*` from this package directory, even if `cwd` is the parent folder. */
const projectDir = path.dirname(fileURLToPath(import.meta.url));
nextEnv.loadEnvConfig(projectDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/chatbots",
        destination: "/dashboard/settings?tab=widget",
        permanent: true,
      },
      {
        source: "/dashboard/chatbots/:path*",
        destination: "/dashboard/settings?tab=widget",
        permanent: true,
      },
      { source: "/chatbot", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
