import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import { seoPlugin } from "./build/seoPlugin.js";
import { normalizeSiteUrl } from "./src/lib/seo.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || "");
  const allowIndexing = env.VITE_ALLOW_INDEXING === "true";
  if (allowIndexing && !siteUrl)
    throw new Error(
      "Configura VITE_SITE_URL antes de habilitar la indexación.",
    );
  return { plugins: [react(), seoPlugin({ siteUrl, allowIndexing })] };
});
