import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const notes = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/notes" }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		date: z.coerce.date().optional(),
		updated: z.coerce.date().optional(),
		status: z
			.enum(["seedling", "growing", "evergreen"])
			.default("seedling"),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		year: z.number(),
		stack: z.array(z.string()),
		role: z.string().optional(),
		status: z.enum(["shipped", "wip", "archived"]).optional(),
		draft: z.boolean().default(false),
		repo: z.url().optional(),
		demo: z.url().optional(),
		order: z.number().optional(),
	}),
});

const lab = defineCollection({
	loader: glob({ pattern: "**/*.mdx", base: "./src/content/lab" }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		started: z.coerce.date().optional(),
		touched: z.coerce.date().optional(),
		status: z.enum(["working", "wip", "parked", "broken"]),
		source: z.url().optional(),
	}),
});

export const collections = { notes, projects, lab };
