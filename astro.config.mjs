// @ts-check
import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import { plate, plateTransformer } from "./src/lib/shiki.mjs";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://kovdev.me",
	compressHTML: false,
	integrations: [mdx(), sitemap({ filter: (page) => !["/old", "/404"].includes(new URL(page).pathname.replace(/\/$/, "")) })],
	markdown: {
		// gfm (footnotes, tables) and smartypants (curly quotes, en/em dashes) are on by default
		shikiConfig: { theme: plate, transformers: [plateTransformer] },
	},
});
