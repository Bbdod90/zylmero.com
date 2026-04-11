import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

/** Always load `.env*` from this package directory, even if `cwd` is the parent folder. */
const projectDir = path.dirname(fileURLToPath(import.meta.url));
nextEnv.loadEnvConfig(projectDir);

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
