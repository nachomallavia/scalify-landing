// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "https://scalify-landing.vercel.app",
  integrations: [mdx(), sitemap(), react()],
  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});